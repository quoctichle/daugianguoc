import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/session'
import { syncProductStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product id' })
  }

  await syncProductStatus(id)

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      winners: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { rank: 'asc' }
      },
      bids: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      _count: {
        select: {
          bids: true
        }
      }
    }
  })

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const myBidCount = await prisma.bid.count({
    where: {
      productId: id,
      userId: user.sub
    }
  })

  const winnerMap = new Map(
    product.winners.map((winner) => [winner.userId, { rank: winner.rank }])
  )

  const bestBidByUser = new Map<string, { user: { id: string, name: string, email: string }, amount: number }>()

  for (const bid of product.bids) {
    const current = bestBidByUser.get(bid.userId)
    if (!current || bid.amount > current.amount) {
      bestBidByUser.set(bid.userId, {
        user: bid.user,
        amount: bid.amount
      })
    }
  }

  const players = [...bestBidByUser.values()]
    .map((entry) => {
      const winner = winnerMap.get(entry.user.id)
      return {
        userId: entry.user.id,
        name: entry.user.name,
        email: entry.user.email,
        amount: product.status === 'completed' ? entry.amount : null,
        isWinner: Boolean(winner),
        rank: winner?.rank ?? null
      }
    })
    .sort((a, b) => {
      if (a.isWinner !== b.isWinner) {
        return a.isWinner ? -1 : 1
      }

      if (a.isWinner && b.isWinner) {
        return (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER)
      }

      if (product.status === 'completed') {
        return (b.amount ?? 0) - (a.amount ?? 0)
      }

      return a.email.localeCompare(b.email)
    })

  const { bids, ...productData } = product

  return {
    ...productData,
    myBidCount,
    players
  }
})

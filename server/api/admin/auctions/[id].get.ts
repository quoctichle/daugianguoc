import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'
import { syncProductStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing auction id' })
  }

  await syncProductStatus(id)

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      bids: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      winners: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { rank: 'asc' }
      }
    }
  })

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Auction not found' })
  }

  const amountMap = new Map<number, number>()
  for (const bid of product.bids) {
    amountMap.set(bid.amount, (amountMap.get(bid.amount) ?? 0) + 1)
  }

  const amountStats = [...amountMap.entries()]
    .map(([amount, count]) => ({ amount, count }))
    .sort((a, b) => a.amount - b.amount)

  const uniqueAmounts = amountStats.filter((item) => item.count === 1)

  const allAmounts = product.bids.map((bid) => bid.amount)
  const summary = {
    totalBids: product.bids.length,
    uniqueBidCount: uniqueAmounts.length,
    minBid: allAmounts.length ? Math.min(...allAmounts) : null,
    maxBid: allAmounts.length ? Math.max(...allAmounts) : null
  }

  const winnerRankByBidId = new Map<string, number>()
  for (const winner of product.winners) {
    winnerRankByBidId.set(winner.bidId, winner.rank)
  }

  const rankedBids = [...product.bids].sort((a, b) => {
    const rankA = winnerRankByBidId.get(a.id)
    const rankB = winnerRankByBidId.get(b.id)
    const isWinnerA = rankA !== undefined
    const isWinnerB = rankB !== undefined

    if (isWinnerA && isWinnerB) {
      return (rankA as number) - (rankB as number)
    }

    if (isWinnerA) {
      return -1
    }

    if (isWinnerB) {
      return 1
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const bidsWithWinnerInfo = rankedBids.map((bid) => ({
    ...bid,
    winnerRank: winnerRankByBidId.get(bid.id) ?? null,
    customerId: bid.customerId ?? null
  }))

  return {
    product,
    amountStats,
    uniqueAmounts,
    summary,
    bidsWithWinnerInfo
  }
})

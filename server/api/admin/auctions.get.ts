import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'
import { syncAllProductsStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await syncAllProductsStatus()

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      bids: {
        select: {
          userId: true
        }
      },
      _count: {
        select: {
          bids: true
        }
      }
    }
  })

  return products.map((product) => {
    const participants = new Set(product.bids.map((bid) => bid.userId)).size
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      status: product.status,
      startsAt: product.startsAt,
      durationMinutes: product.durationMinutes,
      totalBids: product._count.bids,
      totalParticipants: participants
    }
  })
})

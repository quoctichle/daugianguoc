import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'
import { syncAllProductsStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await syncAllProductsStatus()

  const products = await prisma.product.findMany({
    include: {
      event: {
        select: {
          id: true,
          eventId: true,
          title: true
        }
      },
      _count: {
        select: {
          bids: true,
          winners: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return products
})

import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'
import { syncAllProductsStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await syncAllProductsStatus()

  const query = getQuery(event)
  const eventId = typeof query.eventId === 'string' && query.eventId.trim()
    ? query.eventId.trim()
    : undefined

  const products = await prisma.product.findMany({
    where: eventId ? { eventId } : undefined,
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

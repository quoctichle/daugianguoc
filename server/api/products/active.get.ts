import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/session'
import { syncAllProductsStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  await syncAllProductsStatus()

  const query = getQuery(event)
  const requestedFormat = typeof query.format === 'string' ? query.format.toUpperCase() : 'REVERSE_AUCTION'
  const format = requestedFormat === 'VIETLOT' ? 'VIETLOT' : 'REVERSE_AUCTION'

  const now = new Date()
  const ongoingEvent = await prisma.event.findFirst({
    where: {
      format,
      startsAt: { lte: now },
      endsAt: { gte: now }
    },
    orderBy: { startsAt: 'desc' },
    select: { id: true }
  })

  if (!ongoingEvent) {
    return []
  }

  const products = await prisma.product.findMany({
    where: {
      eventId: ongoingEvent.id,
      status: {
        in: ['active', 'pending', 'completed']
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      winners: {
        include: { user: { select: { name: true } } },
        orderBy: { rank: 'asc' }
      }
    }
  })

  return products
})

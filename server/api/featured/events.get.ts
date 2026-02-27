import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const now = new Date()
  const events = await prisma.event.findMany({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now }
    },
    orderBy: { startsAt: 'desc' },
    select: {
      id: true,
      eventId: true,
      title: true,
      imageUrl: true,
      link: true,
      format: true,
      startsAt: true,
      endsAt: true
    }
  })

  return events
})

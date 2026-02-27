import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const now = new Date()
  const events = await prisma.event.findMany({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now }
    },
    orderBy: { startsAt: 'desc' }
  })
  return events
})

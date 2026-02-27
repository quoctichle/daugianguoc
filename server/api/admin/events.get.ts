import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const events = await prisma.event.findMany({
    orderBy: { eventId: 'desc' }
  })
  return events
})

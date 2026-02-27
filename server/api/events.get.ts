import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })
  return events
})

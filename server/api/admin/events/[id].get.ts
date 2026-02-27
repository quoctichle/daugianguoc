import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing event id' })
  }

  const item = await prisma.event.findUnique({
    where: { id }
  })

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return item
})

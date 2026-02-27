import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      code: body.code,
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      isActive: body.isActive,
      link: body.link
    }
  })
  
  return updatedEvent
})

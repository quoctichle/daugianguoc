import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { code: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'News not found' })
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      code: body.code || existing.code,
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      isActive: body.isActive,
      link: body.link
    }
  })

  return updated
})

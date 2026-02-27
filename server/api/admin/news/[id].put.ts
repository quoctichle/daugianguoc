import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const newsModel = (prisma as any).news

  const existing = await newsModel.findUnique({ where: { id } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'News not found' })
  }

  const updated = await newsModel.update({
    where: { id },
    data: {
      title: body.title,
      imageUrl: body.imageUrl,
      isActive: body.isActive,
      link: body.link
    }
  })

  return updated
})

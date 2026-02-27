import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const created = await prisma.news.create({
    data: {
      title: body.title,
      imageUrl: body.imageUrl,
      isActive: body.isActive,
      link: body.link
    }
  })

  return created
})

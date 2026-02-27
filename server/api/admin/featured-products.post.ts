import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const created = await prisma.featuredProduct.create({
    data: {
      title: body.title,
      imageUrl: body.imageUrl || null,
      link: body.link || null,
      isActive: Boolean(body.isActive)
    }
  })

  return created
})

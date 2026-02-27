import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updated = await prisma.featuredProduct.update({
    where: { id },
    data: {
      title: body.title,
      imageUrl: body.imageUrl || null,
      link: body.link || null,
      isActive: Boolean(body.isActive)
    }
  })

  return updated
})

import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const products = await prisma.featuredProduct.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return products
})

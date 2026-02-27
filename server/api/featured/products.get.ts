import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const products = await prisma.featuredProduct.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return products
})

import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/session'
import { syncAllProductsStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  await syncAllProductsStatus()

  const products = await prisma.product.findMany({
    where: {
      status: {
        in: ['active', 'pending', 'completed']
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      winners: {
        include: { user: { select: { name: true } } },
        orderBy: { rank: 'asc' }
      }
    }
  })

  return products
})

import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product id' })
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  await prisma.product.delete({ where: { id } })

  return { success: true }
})

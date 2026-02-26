import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/session'
import { syncProductStatus } from '~~/server/utils/auction'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ productId?: string, amount?: number, customerId?: string }>(event)
  const ID_PATTERN = /^ID\d{8}$/

  if (!body.productId || typeof body.amount !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'productId and amount are required' })
  }

  if (!Number.isInteger(body.amount) || body.amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bid amount must be a positive integer' })
  }

  const product = await syncProductStatus(body.productId)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  if (product.status !== 'active') {
    throw createError({ statusCode: 400, statusMessage: 'Auction is not active' })
  }

  let normalizedCustomerId: string | null = null
  if (product.isUsedProduct) {
    const inputCustomerId = String(body.customerId || '').trim().toUpperCase()
    if (!ID_PATTERN.test(inputCustomerId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID format' })
    }
    normalizedCustomerId = inputCustomerId
  }

  const myBidCount = await prisma.bid.count({
    where: {
      productId: body.productId,
      userId: user.sub
    }
  })

  if (myBidCount >= product.maxBidsPerUser) {
    throw createError({ statusCode: 400, statusMessage: 'Maximum bids reached for this user' })
  }

  const bid = await prisma.bid.create({
    data: {
      productId: body.productId,
      userId: user.sub,
      amount: body.amount,
      customerId: normalizedCustomerId
    }
  })

  return bid
})

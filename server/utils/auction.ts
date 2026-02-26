import type { Product } from '@prisma/client'
import { prisma } from './prisma'

const getEndTime = (product: Product) => {
  return new Date(product.startsAt.getTime() + product.durationMinutes * 60 * 1000)
}

export const resolveDisplayStatus = (product: Product, now = new Date()) => {
  if (product.status === 'completed') {
    return 'completed' as const
  }

  const endAt = getEndTime(product)
  if (now < product.startsAt) {
    return 'pending' as const
  }
  if (now >= product.startsAt && now < endAt) {
    return 'active' as const
  }
  return 'completed' as const
}

export const syncProductStatus = async (productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    return null
  }

  const nextStatus = resolveDisplayStatus(product)

  if (nextStatus === 'completed' && product.status !== 'completed') {
    await finalizeAuction(product.id)
    return await prisma.product.findUnique({ where: { id: product.id } })
  }

  if (nextStatus !== product.status) {
    return await prisma.product.update({
      where: { id: product.id },
      data: { status: nextStatus }
    })
  }

  return product
}

export const finalizeAuction = async (productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  if (product.status === 'completed') {
    return await prisma.winner.findMany({
      where: { productId },
      include: { user: true, bid: true },
      orderBy: { rank: 'asc' }
    })
  }

  const bids = await prisma.bid.findMany({
    where: { productId },
    orderBy: { createdAt: 'asc' }
  })

  const countMap = new Map<number, number>()
  for (const bid of bids) {
    countMap.set(bid.amount, (countMap.get(bid.amount) ?? 0) + 1)
  }

  const uniqueAmounts = [...countMap.entries()]
    .filter(([, count]) => count === 1)
    .map(([amount]) => amount)
    .sort((a, b) => a - b)
    .slice(0, product.winnerCount)

  const winnersData = uniqueAmounts
    .map((amount, index) => {
      const winnerBid = bids.find((bid) => bid.amount === amount)
      if (!winnerBid) {
        return null
      }
      return {
        rank: index + 1,
        amount,
        productId,
        userId: winnerBid.userId,
        bidId: winnerBid.id
      }
    })
    .filter((value): value is NonNullable<typeof value> => value !== null)

  return await prisma.$transaction(async (tx) => {
    await tx.winner.deleteMany({ where: { productId } })

    if (winnersData.length > 0) {
      await tx.winner.createMany({ data: winnersData })
    }

    await tx.product.update({
      where: { id: productId },
      data: { status: 'completed' }
    })

    return await tx.winner.findMany({
      where: { productId },
      include: { user: true, bid: true },
      orderBy: { rank: 'asc' }
    })
  })
}

export const syncAllProductsStatus = async () => {
  const products = await prisma.product.findMany({ select: { id: true } })
  await Promise.all(products.map((product) => syncProductStatus(product.id)))
}

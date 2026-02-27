import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{
    eventId?: string
    name?: string
    imageUrl?: string
    isUsedProduct?: boolean
    startsAt?: string
    durationMinutes?: number
    winnerCount?: number
    maxBidsPerUser?: number
    description?: string
  }>(event)

  if (!body.eventId || !body.name || !body.startsAt || !body.durationMinutes || !body.winnerCount || !body.maxBidsPerUser || !body.description) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const startsAt = new Date(body.startsAt)
  if (Number.isNaN(startsAt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid start datetime' })
  }

  if (body.durationMinutes <= 0 || body.winnerCount <= 0 || body.maxBidsPerUser <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Numeric values must be greater than zero' })
  }

  const eventEntity = await prisma.event.findUnique({
    where: { id: body.eventId },
    select: { id: true }
  })

  if (!eventEntity) {
    throw createError({ statusCode: 400, statusMessage: 'Sự kiện không tồn tại' })
  }

  const product = await prisma.$transaction(async (tx) => {
    const aggregateResult = await tx.product.aggregate({
      _max: {
        productCode: true
      }
    })

    const nextProductCode = (aggregateResult._max.productCode ?? 0) + 1

    return tx.product.create({
      data: {
        productCode: nextProductCode,
        eventId: eventEntity.id,
        name: body.name.trim(),
        imageUrl: body.imageUrl?.trim() || null,
        isUsedProduct: Boolean(body.isUsedProduct),
        startsAt,
        durationMinutes: Number(body.durationMinutes),
        winnerCount: Number(body.winnerCount),
        maxBidsPerUser: Number(body.maxBidsPerUser),
        description: body.description.trim(),
        status: 'pending'
      }
    })
  })

  return product
})

import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    code?: string
    title?: string
    description?: string
    imageUrl?: string
    startsAt?: string
    endsAt?: string
  }>(event)

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { code: true, startsAt: true, endsAt: true }
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  const startsAt = body.startsAt ? new Date(body.startsAt) : existing.startsAt
  const endsAt = body.endsAt ? new Date(body.endsAt) : existing.endsAt

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Thời gian sự kiện không hợp lệ' })
  }

  if (endsAt <= startsAt) {
    throw createError({ statusCode: 400, statusMessage: 'Thời gian kết thúc phải sau thời gian bắt đầu' })
  }

  const format = 'REVERSE_AUCTION'
  const overlapEvent = await prisma.event.findFirst({
    where: {
      id: { not: id },
      format,
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt }
    },
    select: {
      eventId: true,
      title: true,
      startsAt: true,
      endsAt: true
    }
  })

  if (overlapEvent) {
    throw createError({
      statusCode: 400,
      statusMessage: `Trùng thời gian với sự kiện ID ${overlapEvent.eventId} (${overlapEvent.title}). Không thể có 2 sự kiện cùng hình thức trong cùng thời điểm.`
    })
  }
  
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      code: body.code || existing.code,
      title: body.title?.trim(),
      description: body.description?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      format,
      link: '/auctions',
      startsAt,
      endsAt
    }
  })
  
  return updatedEvent
})

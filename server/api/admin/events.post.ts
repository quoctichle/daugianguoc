import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    code?: string
    title?: string
    description?: string
    imageUrl?: string
    format?: 'REVERSE_AUCTION' | 'VIETLOT'
    startsAt?: string
    endsAt?: string
  }>(event)

  const FORMAT_LINK_MAP: Record<'REVERSE_AUCTION' | 'VIETLOT', string> = {
    REVERSE_AUCTION: '/auctions',
    VIETLOT: '/vietlot'
  }

  const normalizeCode = (value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40)
  }

  const baseCode = normalizeCode(body.code || body.title || 'su-kien') || 'su-kien'
  const code = `${baseCode}-${Date.now()}`

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu tiêu đề sự kiện' })
  }

  const startsAt = body.startsAt ? new Date(body.startsAt) : null
  const endsAt = body.endsAt ? new Date(body.endsAt) : null

  if (!startsAt || Number.isNaN(startsAt.getTime()) || !endsAt || Number.isNaN(endsAt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Thời gian sự kiện không hợp lệ' })
  }

  if (endsAt <= startsAt) {
    throw createError({ statusCode: 400, statusMessage: 'Thời gian kết thúc phải sau thời gian bắt đầu' })
  }

  const format = body.format === 'VIETLOT' ? 'VIETLOT' : 'REVERSE_AUCTION'
  const link = FORMAT_LINK_MAP[format]
  const overlapEvent = await prisma.event.findFirst({
    where: {
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
      statusMessage: `Trùng thời gian với sự kiện ID ${overlapEvent.eventId} (${overlapEvent.title}). Không thể tạo 2 sự kiện cùng hình thức trong cùng thời điểm.`
    })
  }
  
  const newEvent = await prisma.event.create({
    data: {
      code,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      format,
      link,
      startsAt,
      endsAt
    }
  })
  
  return newEvent
})

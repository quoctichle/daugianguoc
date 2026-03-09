import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import { getCurrentVietlotRound, normalizeVietlotNumbers } from '~/server/utils/vietlot'

export default defineEventHandler(async (event) => {
  const db = prisma as any
  const user = await requireUser(event)
  const body = await readBody<{ eventId?: string, numbers?: number[] }>(event)

  if (!body.eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu eventId.' })
  }

  if (!Array.isArray(body.numbers)) {
    throw createError({ statusCode: 400, statusMessage: 'Danh sách số không hợp lệ.' })
  }

  const now = new Date()
  const activeEvent = await db.event.findFirst({
    where: {
      id: body.eventId,
      format: 'VIETLOT',
      startsAt: { lte: now },
      endsAt: { gte: now }
    } as any,
    select: { id: true }
  })

  if (!activeEvent) {
    throw createError({ statusCode: 400, statusMessage: 'Sự kiện Vietlot không còn hoạt động.' })
  }

  const normalizedNumbers = normalizeVietlotNumbers(body.numbers)
  const round = getCurrentVietlotRound(now)

  const ticket = await db.vietlotTicket.upsert({
    where: {
      eventId_userId_roundStart: {
        eventId: activeEvent.id,
        userId: user.sub,
        roundStart: round.roundStart
      }
    },
    update: {
      pickedNumbers: normalizedNumbers,
      roundEnd: round.roundEnd
    },
    create: {
      eventId: activeEvent.id,
      userId: user.sub,
      roundStart: round.roundStart,
      roundEnd: round.roundEnd,
      pickedNumbers: normalizedNumbers
    }
  })

  return {
    id: ticket.id,
    pickedNumbers: normalizedNumbers
  }
})

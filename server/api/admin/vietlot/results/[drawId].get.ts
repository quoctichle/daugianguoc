import { prisma } from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/session'

const formatNumber2 = (value: number) => `${value}`.padStart(2, '0')

export default defineEventHandler(async (event) => {
  const db = prisma as any
  await requireAdmin(event)

  const query = getQuery(event)
  const eventId = typeof query.eventId === 'string' ? query.eventId.trim() : ''
  const drawId = getRouterParam(event, 'drawId')

  if (!eventId || !drawId) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu eventId hoặc drawId.' })
  }

  const draw = await db.vietlotDraw.findFirst({
    where: {
      id: drawId,
      eventId
    }
  })

  if (!draw) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy lượt quay.' })
  }

  const winningNumbers = ((draw.winningNumbers as number[]) || []).map(formatNumber2)
  const winningSet = new Set(winningNumbers)

  const tickets = await db.vietlotTicket.findMany({
    where: {
      eventId,
      roundStart: draw.roundStart
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: [
      { matchCount: 'desc' },
      { createdAt: 'asc' }
    ]
  })

  return {
    draw: {
      id: draw.id,
      roundStart: draw.roundStart,
      roundEnd: draw.roundEnd,
      winningNumbers
    },
    tickets: tickets.map((ticket: any) => {
      const pickedNumbers = ((ticket.pickedNumbers as number[]) || []).map(formatNumber2)
      const matchedNumbers = pickedNumbers.filter((num: string) => winningSet.has(num))

      return {
        id: ticket.id,
        email: ticket.user?.email || '',
        name: ticket.user?.name || '',
        pickedNumbers,
        matchedNumbers,
        matchCount: ticket.matchCount ?? matchedNumbers.length,
        prizeLabel: ticket.prizeLabel || 'Không trúng',
        createdAt: ticket.createdAt
      }
    })
  }
})

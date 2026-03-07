import { prisma } from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const db = prisma as any
  await requireAdmin(event)

  const query = getQuery(event)
  const eventId = typeof query.eventId === 'string' ? query.eventId.trim() : ''

  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing eventId' })
  }

  const draws = await db.vietlotDraw.findMany({
    where: { eventId },
    orderBy: { roundStart: 'desc' },
    take: 20
  })

  const rows = await Promise.all(draws.map(async (draw: any) => {
    const tickets = await db.vietlotTicket.findMany({
      where: {
        eventId,
        roundStart: draw.roundStart,
        prizeTier: { not: null }
      },
      select: {
        prizeTier: true
      }
    })

    const stats = {
      SPECIAL: 0,
      FIRST: 0,
      SECOND: 0,
      THIRD: 0,
      FOURTH: 0,
      FIFTH: 0,
      CONSOLATION: 0,
      NONE: 0
    }

    for (const ticket of tickets as Array<{ prizeTier: keyof typeof stats | null }>) {
      if (!ticket.prizeTier) continue
      stats[ticket.prizeTier] += 1
    }

    return {
      id: draw.id,
      roundStart: draw.roundStart,
      roundEnd: draw.roundEnd,
      winningNumbers: draw.winningNumbers,
      totalTickets: tickets.length,
      stats
    }
  }))

  return rows
})

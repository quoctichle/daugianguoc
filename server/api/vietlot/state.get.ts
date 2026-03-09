import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import {
  ensureVietlotPrizeConfig,
  formatNumber2,
  getCurrentVietlotRound,
  settleVietlotRound
} from '~/server/utils/vietlot'

export default defineEventHandler(async (event) => {
  const db = prisma as any
  const user = await requireUser(event)
  const now = new Date()

  const activeEvent: any = await db.event.findFirst({
    where: {
      format: 'VIETLOT',
      startsAt: { lte: now },
      endsAt: { gte: now }
    },
    orderBy: { startsAt: 'desc' },
    include: {
      vietlotConfig: true
    }
  } as any)

  if (!activeEvent) {
    return {
      event: null,
      currentRound: null,
      myCurrentTicket: null,
      recentResults: [],
      latestDraw: null
    }
  }

  const config = activeEvent.vietlotConfig ?? await ensureVietlotPrizeConfig(db, activeEvent.id)
  const currentRound = getCurrentVietlotRound(now)
  const previousRound = {
    roundStart: new Date(currentRound.roundStart.getTime() - currentRound.intervalMinutes * 60 * 1000),
    roundEnd: currentRound.roundStart
  }

  if (previousRound.roundEnd.getTime() <= now.getTime() && previousRound.roundStart >= activeEvent.startsAt) {
    await settleVietlotRound(db, activeEvent.id, previousRound.roundStart, previousRound.roundEnd)
  }

  const myCurrentTicket = await db.vietlotTicket.findUnique({
    where: {
      eventId_userId_roundStart: {
        eventId: activeEvent.id,
        userId: user.sub,
        roundStart: currentRound.roundStart
      }
    }
  })

  const recentTickets = await db.vietlotTicket.findMany({
    where: {
      eventId: activeEvent.id,
      userId: user.sub,
      prizeTier: { not: null }
    },
    orderBy: { roundStart: 'desc' },
    take: 10
  })

  const recentDraws = await db.vietlotDraw.findMany({
    where: { eventId: activeEvent.id },
    orderBy: { roundStart: 'desc' },
    take: 10
  })

  const latestDraw = recentDraws[0]
    ? {
        roundStart: recentDraws[0].roundStart,
        roundEnd: recentDraws[0].roundEnd,
        winningNumbers: ((recentDraws[0] as any).winningNumbers as number[]).map(formatNumber2)
      }
    : null

  const drawMap = new Map(recentDraws.map((draw: any) => [draw.roundStart.toISOString(), draw]))
  const recentResults = recentTickets.map((ticket: any) => {
    const draw = drawMap.get(ticket.roundStart.toISOString())
    return {
      id: ticket.id,
      roundStart: ticket.roundStart,
      roundEnd: ticket.roundEnd,
      pickedNumbers: (ticket.pickedNumbers as number[]).map(formatNumber2),
      winningNumbers: draw ? ((draw as any).winningNumbers as number[]).map(formatNumber2) : [],
      matchCount: ticket.matchCount,
      prizeTier: ticket.prizeTier,
      prizeLabel: ticket.prizeLabel
    }
  })

  return {
    event: {
      id: activeEvent.id,
      title: activeEvent.title,
      description: activeEvent.description,
      imageUrl: activeEvent.imageUrl,
      startsAt: activeEvent.startsAt,
      endsAt: activeEvent.endsAt,
      format: activeEvent.format
    },
    prizeConfig: config,
    currentRound: {
      roundStart: currentRound.roundStart,
      roundEnd: currentRound.roundEnd,
      intervalMinutes: currentRound.intervalMinutes
    },
    myCurrentTicket: myCurrentTicket
      ? {
          id: myCurrentTicket.id,
          pickedNumbers: (myCurrentTicket.pickedNumbers as number[]).map(formatNumber2)
        }
      : null,
    recentResults,
    latestDraw
  }
})

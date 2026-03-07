type VietlotPrizeTier = 'SPECIAL' | 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH' | 'CONSOLATION' | 'NONE'

type VietlotPrizeConfigLike = {
  specialPrize: string
  firstPrize: string
  secondPrize: string
  thirdPrize: string
  fourthPrize: string
  fifthPrize: string
  consolationPrize: string
}

const ROUND_DURATION_MINUTES = 5
const ROUND_DURATION_MS = ROUND_DURATION_MINUTES * 60 * 1000

export type VietlotNumbers = number[]

export const DEFAULT_VIETLOT_PRIZE_CONFIG = {
  specialPrize: 'Giai dac biet',
  firstPrize: 'Giai nhat',
  secondPrize: 'Giai nhi',
  thirdPrize: 'Giai ba',
  fourthPrize: 'Giai tu',
  fifthPrize: 'Giai nam',
  consolationPrize: 'Giai khuyen khich'
}

export const normalizeVietlotNumbers = (numbers: number[]): VietlotNumbers => {
  const uniqueSorted = [...new Set(numbers)]
    .filter(value => Number.isInteger(value) && value >= 1 && value <= 99)
    .sort((a, b) => a - b)

  if (uniqueSorted.length !== 10) {
    throw createError({ statusCode: 400, statusMessage: 'Ban phai chon dung 10 so tu 01 den 99.' })
  }

  return uniqueSorted
}

export const getCurrentVietlotRound = (now = new Date()) => {
  const nowMs = now.getTime()
  const roundStartMs = Math.floor(nowMs / ROUND_DURATION_MS) * ROUND_DURATION_MS
  const roundEndMs = roundStartMs + ROUND_DURATION_MS

  return {
    roundStart: new Date(roundStartMs),
    roundEnd: new Date(roundEndMs),
    intervalMinutes: ROUND_DURATION_MINUTES
  }
}

const randomUniqueNumbers = (): VietlotNumbers => {
  const pool = Array.from({ length: 99 }, (_, index) => index + 1)
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = pool[i] as number
    pool[i] = pool[j] as number
    pool[j] = temp
  }

  return pool.slice(0, 10).sort((a, b) => a - b)
}

export const resolveVietlotPrize = (
  matchCount: number,
  config: VietlotPrizeConfigLike
): { tier: VietlotPrizeTier, label: string } => {
  if (matchCount === 10) {
    return { tier: 'SPECIAL', label: config.specialPrize }
  }
  if (matchCount === 9) {
    return { tier: 'FIRST', label: config.firstPrize }
  }
  if (matchCount === 8) {
    return { tier: 'SECOND', label: config.secondPrize }
  }
  if (matchCount === 7) {
    return { tier: 'THIRD', label: config.thirdPrize }
  }
  if (matchCount === 6) {
    return { tier: 'FOURTH', label: config.fourthPrize }
  }
  if (matchCount === 5) {
    return { tier: 'FIFTH', label: config.fifthPrize }
  }
  if (matchCount === 0) {
    return { tier: 'CONSOLATION', label: config.consolationPrize }
  }

  return { tier: 'NONE', label: 'Khong trung thuong' }
}

const countMatches = (pickedNumbers: number[], winningNumbers: number[]) => {
  const winningSet = new Set(winningNumbers)
  return pickedNumbers.reduce((total, value) => total + (winningSet.has(value) ? 1 : 0), 0)
}

export const ensureVietlotPrizeConfig = async (prisma: any, eventId: string) => {
  const existing = await prisma.vietlotPrizeConfig.findUnique({ where: { eventId } })
  if (existing) {
    return existing
  }

  return prisma.vietlotPrizeConfig.create({
    data: {
      eventId,
      ...DEFAULT_VIETLOT_PRIZE_CONFIG
    }
  })
}

export const settleVietlotRound = async (
  prisma: any,
  eventId: string,
  roundStart: Date,
  roundEnd: Date
) => {
  const existingDraw = await prisma.vietlotDraw.findUnique({
    where: {
      eventId_roundStart: {
        eventId,
        roundStart
      }
    }
  })

  const draw = existingDraw ?? await prisma.vietlotDraw.create({
    data: {
      eventId,
      roundStart,
      roundEnd,
      winningNumbers: randomUniqueNumbers()
    }
  })

  const config = await ensureVietlotPrizeConfig(prisma, eventId)
  const tickets = await prisma.vietlotTicket.findMany({
    where: {
      eventId,
      roundStart,
      prizeTier: null
    }
  })

  const winningNumbers = draw.winningNumbers as number[]

  for (const ticket of tickets) {
    const pickedNumbers = ticket.pickedNumbers as number[]
    const matchCount = countMatches(pickedNumbers, winningNumbers)
    const prize = resolveVietlotPrize(matchCount, config)

    await prisma.vietlotTicket.update({
      where: { id: ticket.id },
      data: {
        matchCount,
        prizeTier: prize.tier,
        prizeLabel: prize.label
      }
    })
  }

  return draw
}

export const formatNumber2 = (value: number) => `${value}`.padStart(2, '0')

import { prisma } from '~/server/utils/prisma'
import { ensureVietlotPrizeConfig } from '~/server/utils/vietlot'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing event id' })
  }

  const item = await prisma.event.findUnique({
    where: { id },
    include: {
      vietlotConfig: true,
      vietlotDraws: {
        take: 10,
        orderBy: { roundStart: 'desc' }
      }
    }
  })

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  if (item.format === 'VIETLOT' && !item.vietlotConfig) {
    await ensureVietlotPrizeConfig(prisma, item.id)
    return prisma.event.findUnique({
      where: { id },
      include: {
        vietlotConfig: true,
        vietlotDraws: {
          take: 10,
          orderBy: { roundStart: 'desc' }
        }
      }
    })
  }

  return item
})

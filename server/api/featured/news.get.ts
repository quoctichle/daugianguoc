import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const news = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  return news
})

import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return news
})

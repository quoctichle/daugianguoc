import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const news = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      link: true
    }
  })

  return news
})

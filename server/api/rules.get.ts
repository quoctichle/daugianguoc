import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const rule = await prisma.rule.findUnique({ where: { id: 1 } })
  return {
    content: rule?.content ?? ''
  }
})

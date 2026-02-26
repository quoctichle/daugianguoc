import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const rule = await prisma.rule.findUnique({ where: { id: 1 } })
  return {
    content: rule?.content ?? ''
  }
})

import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ content?: string }>(event)

  if (!body.content || !body.content.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Rule content is required' })
  }

  const rule = await prisma.rule.upsert({
    where: { id: 1 },
    update: { content: body.content.trim() },
    create: { id: 1, content: body.content.trim() }
  })

  return rule
})

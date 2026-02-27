import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const normalizeCode = (value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40)
  }

  const baseCode = normalizeCode(body.code || body.title || 'tin-tuc') || 'tin-tuc'
  const code = `${baseCode}-${Date.now()}`

  const created = await prisma.event.create({
    data: {
      code,
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      isActive: body.isActive,
      link: body.link
    }
  })

  return created
})

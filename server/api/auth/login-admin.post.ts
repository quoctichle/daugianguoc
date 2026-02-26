import { prisma } from '~~/server/utils/prisma'
import { signSessionToken } from '~~/server/utils/jwt'
import { setSessionCookie } from '~~/server/utils/session'

const ADMIN_EMAIL = 'admin@sunshine.com'
const ADMIN_PASSWORD = 'sunshinetelecom'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, password?: string }>(event)
  const email = body.email?.trim().toLowerCase()

  if (!email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  if (email !== ADMIN_EMAIL || body.password !== ADMIN_PASSWORD) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid admin credentials' })
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Admin',
      role: 'ADMIN'
    },
    create: {
      email,
      name: 'Admin',
      role: 'ADMIN',
      googleId: `local-${email}`
    }
  })

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: 'ADMIN',
    avatarUrl: user.avatarUrl
  })

  setSessionCookie(event, token)

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'ADMIN'
    }
  }
})

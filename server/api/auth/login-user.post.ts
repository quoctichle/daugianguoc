import { prisma } from '~~/server/utils/prisma'
import { signSessionToken } from '~~/server/utils/jwt'
import { setSessionCookie } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = body.email?.trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  if (!email.endsWith('@gmail.com')) {
    throw createError({ statusCode: 400, statusMessage: 'User email must be a Gmail address' })
  }

  if (email === 'admin@sunshine.com') {
    throw createError({ statusCode: 403, statusMessage: 'Use admin login page for admin account' })
  }

  const baseName = email.split('@')[0]
  const displayName = baseName.charAt(0).toUpperCase() + baseName.slice(1)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: displayName,
      role: 'USER'
    },
    create: {
      email,
      name: displayName,
      role: 'USER',
      googleId: `local-${email}`
    }
  })

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: 'USER',
    avatarUrl: user.avatarUrl
  })

  setSessionCookie(event, token)

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'USER'
    }
  }
})

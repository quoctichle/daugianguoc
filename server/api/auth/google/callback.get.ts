import { signSessionToken } from '~~/server/utils/jwt'
import { prisma } from '~~/server/utils/prisma'
import { setSessionCookie } from '~~/server/utils/session'

type GoogleTokenResponse = {
  access_token: string
  expires_in: number
  id_token: string
  token_type: string
}

type GoogleUserInfo = {
  sub: string
  email: string
  name: string
  picture?: string
}

const OAUTH_STATE_COOKIE = 'oauth_state'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  const code = query.code
  const state = query.state
  const cookieState = getCookie(event, OAUTH_STATE_COOKIE)

  if (!code || typeof code !== 'string' || !state || typeof state !== 'string' || state !== cookieState) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth callback state' })
  }

  deleteCookie(event, OAUTH_STATE_COOKIE, { path: '/' })

  if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
    throw createError({ statusCode: 500, statusMessage: 'Google OAuth config missing' })
  }

  const tokenResponse = await $fetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: config.googleRedirectUri,
      grant_type: 'authorization_code'
    }
  })

  const userInfo = await $fetch<GoogleUserInfo>('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  })

  const adminEmails = (config.adminEmails || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const role = adminEmails.includes(userInfo.email.toLowerCase()) ? 'ADMIN' : 'USER'

  const user = await prisma.user.upsert({
    where: { email: userInfo.email },
    update: {
      googleId: userInfo.sub,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
      role
    },
    create: {
      googleId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
      role
    }
  })

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl
  })

  setSessionCookie(event, token)

  return sendRedirect(event, '/')
})

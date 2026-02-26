import type { H3Event } from 'h3'
import { verifySessionToken } from './jwt'

const SESSION_COOKIE = 'auth_token'

export const getSessionUser = async (event: H3Event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    return null
  }
  return await verifySessionToken(token)
}

export const requireUser = async (event: H3Event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

export const requireAdmin = async (event: H3Event) => {
  const user = await requireUser(event)
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}

export const setSessionCookie = (event: H3Event, token: string) => {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export const clearSessionCookie = (event: H3Event) => {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

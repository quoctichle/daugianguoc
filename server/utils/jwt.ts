import { SignJWT, jwtVerify } from 'jose'

export type SessionPayload = {
  sub: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  avatarUrl?: string | null
}

const ALGORITHM = 'HS256'
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const getSecret = () => {
  const runtimeConfig = useRuntimeConfig()
  const secret = runtimeConfig.jwtSecret
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'Missing JWT_SECRET' })
  }
  return new TextEncoder().encode(secret)
}

export const signSessionToken = async (payload: SessionPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getSecret())
}

export const verifySessionToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  }
  catch {
    return null
  }
}

export const getTokenMaxAge = () => TOKEN_MAX_AGE_SECONDS

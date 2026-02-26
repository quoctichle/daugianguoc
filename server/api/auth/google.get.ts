const OAUTH_STATE_COOKIE = 'oauth_state'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.googleClientId || !config.googleRedirectUri) {
    throw createError({ statusCode: 500, statusMessage: 'Google OAuth config missing' })
  }

  const state = crypto.randomUUID()
  setCookie(event, OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10
  })

  const query = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state
  })

  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`)
})

export default defineNuxtRouteMiddleware(async (to) => {
  const headers = process.server ? useRequestHeaders(['cookie']) : undefined
  const session = await $fetch<{ user: { role: 'USER' | 'ADMIN' } | null }>('/api/auth/session', {
    headers
  })

  if (!session.user) {
    if (to.path === '/login') {
      return
    }

    const redirectTarget = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?redirect=${redirectTarget}`)
  }
})

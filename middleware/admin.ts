export default defineNuxtRouteMiddleware(async () => {
  const headers = process.server ? useRequestHeaders(['cookie']) : undefined
  const session = await $fetch<{ user: { role: 'USER' | 'ADMIN' } | null }>('/api/auth/session', {
    headers
  })

  if (!session.user) {
    return navigateTo('/admin/login')
  }

  if (session.user.role !== 'ADMIN') {
    return navigateTo('/admin/login')
  }
})

type SessionUser = {
  sub: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  avatarUrl?: string | null
}

export const useAuth = () => {
  const user = useState<SessionUser | null>('session-user', () => null)
  const loading = useState<boolean>('session-loading', () => false)

  const fetchSession = async () => {
    loading.value = true
    try {
      const headers = process.server ? useRequestHeaders(['cookie']) : undefined
      const data = await $fetch<{ user: SessionUser | null }>('/api/auth/session', { headers })
      user.value = data.user
      return data.user
    }
    catch {
      user.value = null
      return null
    }
    finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    loading,
    fetchSession,
    logout
  }
}

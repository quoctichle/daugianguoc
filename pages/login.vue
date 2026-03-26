<script setup lang="ts">
const { fetchSession } = useAuth()
const { t } = useAppI18n()
const route = useRoute()

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  const normalized = Array.isArray(redirect) ? redirect[0] : redirect
  return normalized && normalized !== '' ? normalized : '/'
})

const currentUser = await fetchSession()
if (currentUser) {
  await navigateTo(redirectPath.value)
}

const form = reactive({
  email: ''
})

const errorMessage = ref('')

const submitLogin = async () => {
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/login-user', {
      method: 'POST',
      body: {
        email: form.email
      }
    })

    await fetchSession()
    await navigateTo(redirectPath.value)
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || t('auth.loginFailed')
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-130px)] items-center justify-center">
    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 shadow-lg backdrop-blur-sm">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-white">{{ t('auth.userLoginTitle') }}</h1>
          <p class="mt-2 text-slate-400">
            {{ t('auth.userLoginSubtitle') }}
          </p>
        </div>

        <form class="mt-8 space-y-4" @submit.prevent="submitLogin">
          <div>
            <label for="email" class="mb-2 block text-sm font-medium text-slate-300">{{ t('auth.email') }}</label>
            <input
              v-model="form.email"
              type="email"
              id="email"
              required
              class="w-full rounded-lg border-slate-600 bg-slate-900/50 px-4 py-2.5 text-white placeholder-slate-500 shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="yourname@gmail.com"
            >
          </div>

          <button
            type="submit"
            class="w-full rounded-lg bg-primary-600 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {{ t('auth.login') }}
          </button>
        </form>

        <p v-if="errorMessage" class="mt-4 text-center text-sm text-red-400">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

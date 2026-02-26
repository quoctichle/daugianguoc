<script setup lang="ts">
const { fetchSession } = useAuth()
const { t } = useAppI18n()

const currentUser = await fetchSession()
if (currentUser) {
  await navigateTo('/')
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
    await navigateTo('/')
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || t('auth.loginFailed')
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-130px)] items-center justify-center">
    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-primary-900">{{ t('auth.userLoginTitle') }}</h1>
          <p class="mt-2 text-gray-500">
            {{ t('auth.userLoginSubtitle') }}
          </p>
        </div>

        <form class="mt-8 space-y-4" @submit.prevent="submitLogin">
          <div>
            <label for="email" class="mb-2 block text-sm font-medium text-gray-700">{{ t('auth.email') }}</label>
            <input
              v-model="form.email"
              type="email"
              id="email"
              required
              class="w-full rounded-lg border-gray-300 px-4 py-2.5 shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="yourname@gmail.com"
            >
          </div>

          <button
            type="submit"
            class="w-full rounded-lg bg-primary-800 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {{ t('auth.login') }}
          </button>
        </form>

        <p v-if="errorMessage" class="mt-4 text-center text-sm text-red-600">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

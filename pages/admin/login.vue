<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { t } = useAppI18n()

const form = reactive({
  email: '',
  password: ''
})

const errorMessage = ref('')

const submitAdminLogin = async () => {
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/login-admin', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      }
    })

    await navigateTo('/admin/config')
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || t('auth.adminLoginFailed')
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl rounded-xl border bg-white p-8 text-center shadow-sm">
    <h1 class="text-2xl font-bold">{{ t('auth.adminLoginTitle') }}</h1>
    <p class="mt-3 text-sm text-slate-600">
      {{ t('auth.adminLoginSubtitle') }}
    </p>

    <form class="mt-6 space-y-3 text-left" @submit.prevent="submitAdminLogin">
      <label class="block text-sm">
        <span class="mb-1 block">{{ t('auth.email') }}</span>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full rounded-lg border px-3 py-2"
          placeholder="admin@sunshine.com"
        >
      </label>

      <label class="block text-sm">
        <span class="mb-1 block">{{ t('auth.password') }}</span>
        <input
          v-model="form.password"
          type="password"
          required
          class="w-full rounded-lg border px-3 py-2"
          placeholder="sunshinetelecom"
        >
      </label>

      <button
        type="submit"
        class="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
      >
        {{ t('auth.adminLoginButton') }}
      </button>
    </form>

    <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>

    <NuxtLink to="/login" class="mt-4 inline-block text-xs text-slate-600 underline">
      {{ t('auth.backToUserLogin') }}
    </NuxtLink>
  </div>
</template>

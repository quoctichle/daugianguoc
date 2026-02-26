<script setup lang="ts">
import LanguageSwitcher from '~/components/common/LanguageSwitcher.vue'

const { data, refresh } = await useFetch<{ user: { name: string, email: string } | null }>('/api/auth/session', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})
const { t } = useAppI18n()

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div>
      <p class="text-sm text-slate-500">{{ t('admin.loggedIn') }}</p>
      <p class="font-medium">{{ data?.user?.name }} ({{ data?.user?.email }})</p>
    </div>
    <div class="flex items-center gap-2">
      <LanguageSwitcher />
      <button class="rounded-lg border px-3 py-2 text-sm" @click="logout">{{ t('common.logout') }}</button>
    </div>
  </div>
</template>

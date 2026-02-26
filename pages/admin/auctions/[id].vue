<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const { t } = useAppI18n()

const route = useRoute()
const id = computed(() => route.params.id as string)

const AuctionDetailCardAsync = defineAsyncComponent(() => import('~/components/admin/AuctionDetailCard.vue'))

const { data, refresh } = await useFetch<any>(() => `/api/admin/auctions/${id.value}`, {
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  watch: [id]
})

const finalizeMessage = ref('')
const finalizeError = ref('')

const refreshDetail = async () => {
  await refresh()
}

const finalize = async () => {
  finalizeMessage.value = ''
  finalizeError.value = ''

  try {
    const result = await $fetch<any>(`/api/admin/auctions/${id.value}/complete`, { method: 'POST' })
    const summary = result?.emailSummary

    if (summary) {
      const failed = (result?.emailResults || [])
        .filter((item: any) => !item.sent)
        .map((item: any) => `${item.email}: ${item.reason || 'Failed'}`)

      finalizeMessage.value = `Đã chốt winner. Gửi mail thành công ${summary.sent}/${summary.total}.`
      if (failed.length) {
        finalizeError.value = failed.join(' | ')
      }
    }
    else {
      finalizeMessage.value = 'Đã chốt winner.'
    }

    await refresh()
  }
  catch (error: any) {
    finalizeError.value = error?.data?.statusMessage || 'Không thể chốt winner.'
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-lg font-semibold">{{ t('admin.auctionDetailTitle') }}</h1>
      <div class="flex items-center gap-2">
        <button class="rounded-lg border px-3 py-2 text-sm" @click="refreshDetail">{{ t('common.refresh') }}</button>
        <button class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" @click="finalize">{{ t('admin.finalizeWinner') }}</button>
      </div>
    </div>

    <p v-if="finalizeMessage" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
      {{ finalizeMessage }}
    </p>
    <p v-if="finalizeError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ finalizeError }}
    </p>

    <Suspense>
      <AuctionDetailCardAsync v-if="data" :payload="data" />
      <template #fallback>
        <div class="rounded-xl border p-4 text-sm text-slate-600">{{ t('admin.loadingDetail') }}</div>
      </template>
    </Suspense>
  </section>
</template>

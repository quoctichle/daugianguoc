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

const refreshDetail = async () => {
  await refresh()
}

const finalize = async () => {
  await $fetch(`/api/admin/auctions/${id.value}/complete`, { method: 'POST' })
  await refresh()
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

    <Suspense>
      <AuctionDetailCardAsync v-if="data" :payload="data" />
      <template #fallback>
        <div class="rounded-xl border p-4 text-sm text-slate-600">{{ t('admin.loadingDetail') }}</div>
      </template>
    </Suspense>
  </section>
</template>

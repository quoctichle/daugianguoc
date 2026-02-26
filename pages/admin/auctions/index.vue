<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const { t } = useAppI18n()

const { data: auctionsData, refresh } = await useFetch<any[]>('/api/admin/auctions', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
})

const refreshList = async () => {
  await refresh()
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold">{{ t('admin.auctionsTitle') }}</h1>
      <button class="rounded-lg border px-3 py-2 text-sm" @click="refreshList">{{ t('common.refresh') }}</button>
    </div>
    <div class="overflow-x-auto rounded-xl border">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left">
          <tr>
            <th class="px-3 py-2">{{ t('admin.product') }}</th>
            <th class="px-3 py-2">{{ t('admin.status') }}</th>
            <th class="px-3 py-2">{{ t('admin.totalBids') }}</th>
            <th class="px-3 py-2">{{ t('admin.participants') }}</th>
            <th class="px-3 py-2">{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in auctionsData || []" :key="item.id" class="border-t">
            <td class="px-3 py-2">#{{ item.productCode || '-' }} - {{ item.name }}</td>
            <td class="px-3 py-2">
              <span class="rounded bg-slate-100 px-2 py-1 text-xs uppercase">{{ item.status }}</span>
            </td>
            <td class="px-3 py-2">{{ item.totalBids }}</td>
            <td class="px-3 py-2">{{ item.totalParticipants }}</td>
            <td class="px-3 py-2">
              <NuxtLink :to="`/admin/auctions/${item.id}`" class="rounded border px-3 py-1 text-xs">{{ t('admin.viewDetails') }}</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

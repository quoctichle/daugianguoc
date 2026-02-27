<script setup lang="ts">
const props = defineProps<{
  products: Array<{
    id: string
    productCode?: number | null
    event?: { id: string, eventId?: number | null, title?: string | null } | null
    name: string
    isUsedProduct?: boolean
    status: string
    createdAt: string
    startsAt: string
    _count?: { bids: number }
  }>
}>()

const emit = defineEmits<{
  deleted: [id: string]
}>()

const sortedProducts = computed(() => {
  return [...props.products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const { t } = useAppI18n()
</script>

<template>
  <div class="overflow-x-auto rounded-xl border">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 text-left">
        <tr>
          <th class="px-3 py-2">Sự kiện</th>
          <th class="px-3 py-2">{{ t('productTable.name') }}</th>
          <th class="px-3 py-2">{{ t('productTable.type') }}</th>
          <th class="px-3 py-2">{{ t('productTable.start') }}</th>
          <th class="px-3 py-2">{{ t('productTable.status') }}</th>
          <th class="px-3 py-2">{{ t('productTable.totalBids') }}</th>
          <th class="px-3 py-2">{{ t('productTable.createdAt') }}</th>
          <th class="px-3 py-2">{{ t('productTable.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sortedProducts" :key="item.id" class="border-t">
          <td class="px-3 py-2 text-xs text-slate-600">{{ item.event ? `ID ${item.event.eventId || '-'} - ${item.event.title || 'N/A'}` : 'Chưa gán' }}</td>
          <td class="px-3 py-2">#{{ item.productCode || '-' }} - {{ item.name }}</td>
          <td class="px-3 py-2">
            <span class="rounded px-2 py-1 text-xs" :class="item.isUsedProduct ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
              {{ item.isUsedProduct ? t('productTable.used') : t('productTable.new') }}
            </span>
          </td>
          <td class="px-3 py-2">{{ new Date(item.startsAt).toLocaleString() }}</td>
          <td class="px-3 py-2"><span class="rounded bg-slate-100 px-2 py-1 text-xs">{{ item.status }}</span></td>
          <td class="px-3 py-2">{{ item._count?.bids ?? 0 }}</td>
          <td class="px-3 py-2">{{ new Date(item.createdAt).toLocaleString() }}</td>
          <td class="px-3 py-2">
            <button
              type="button"
              class="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
              @click="emit('deleted', item.id)"
            >
              {{ t('productTable.delete') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

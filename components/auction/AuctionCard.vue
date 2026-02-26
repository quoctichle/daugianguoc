<script setup lang="ts">
const props = defineProps<{
  product: any
  active?: boolean
}>()

const { t } = useAppI18n()

const emit = defineEmits<{
  select: []
}>()

const statusLabel = computed(() => {
  switch (props.product?.status) {
    case 'active':
      return t('auction.status.active')
    case 'pending':
      return t('auction.status.pending')
    default:
      return t('auction.status.completed')
  }
})

</script>

<template>
  <button
    type="button"
    class="group w-full overflow-hidden rounded-xl border text-left transition-all duration-200 ease-in-out"
    :class="active
      ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200 shadow-lg'
      : 'border-gray-200 bg-white hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg'"
    @click="emit('select')"
  >
    <div class="relative flex h-44 items-center justify-center bg-gray-100">
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      >
      <div v-else class="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-medium text-gray-500">
        {{ t('auction.noImage') }}
      </div>
    </div>
    <div class="space-y-3 p-4">
      <div class="flex items-start justify-between gap-3">
        <h3 class="line-clamp-2 text-base font-semibold text-gray-800">
          <span v-if="product.productCode" class="mr-1">#{{ product.productCode }}</span>
          {{ product.name }}
        </h3>
        <span
          class="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
          :class="product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
        >
          {{ statusLabel }}
        </span>
      </div>
      <p class="line-clamp-2 text-sm text-gray-600">{{ product.description }}</p>
      <p class="text-sm font-medium text-primary-800">
        {{ product.status === 'active' ? t('auction.actionNow') : t('auction.actionView') }}
      </p>
    </div>
  </button>
</template>

<script setup lang="ts">
import AuctionCard from '~/components/auction/AuctionCard.vue'

definePageMeta({ middleware: ['auth'] })
const { t } = useAppI18n()

const { data: rulesData } = await useFetch<{ content: string }>('/api/rules', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const { data: productsData } = await useFetch<any[]>('/api/products/active', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const sortedProducts = computed(() => {
  const statusPriority: Record<string, number> = {
    active: 0,
    pending: 1,
    completed: 2
  }

  return [...(productsData.value || [])].sort((a, b) => {
    const priorityA = statusPriority[a.status] ?? 3
    const priorityB = statusPriority[b.status] ?? 3

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    if (a.status === 'active' && b.status === 'active') {
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    }

    return new Date(b.endedAt || 0).getTime() - new Date(a.endedAt || 0).getTime()
  })
})

const pageSize = 9
const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedProducts.value.length / pageSize))
})

const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize
  return sortedProducts.value.slice(startIndex, startIndex + pageSize)
})

watch([sortedProducts, totalPages], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) {
    return
  }
  currentPage.value = page
}

const goToPreviousPage = () => {
  goToPage(currentPage.value - 1)
}

const goToNextPage = () => {
  goToPage(currentPage.value + 1)
}

const activeCount = computed(() => sortedProducts.value.filter(product => product.status === 'active').length)
const finishedCount = computed(() => sortedProducts.value.filter(product => product.status !== 'active').length)

const idInput = ref('')
const idError = ref('')
const pendingProduct = ref<any | null>(null)

const ID_PATTERN = /^ID\d{8}$/

const onSelectProduct = (product: any) => {
  if (!product?.isUsedProduct) {
    navigateTo(`/auctions/${product.id}`)
    return
  }

  pendingProduct.value = product
  idInput.value = ''
  idError.value = ''
}

const closeIdPrompt = () => {
  pendingProduct.value = null
  idInput.value = ''
  idError.value = ''
}

const confirmProductId = () => {
  const value = idInput.value.trim().toUpperCase()
  if (!pendingProduct.value) {
    return
  }

  if (!ID_PATTERN.test(value)) {
    idError.value = t('user.idInvalid')
    return
  }

  navigateTo(`/auctions/${pendingProduct.value.id}?accessId=${value}`)
  closeIdPrompt()
}
</script>

<template>
  <div class="space-y-6">
    <div class="animate-fade-in-up overflow-hidden rounded-xl border border-white/60 bg-white/90 shadow-md backdrop-blur-sm">
      <img
        src="/uploads/Banner.jpg"
        alt="Auction Banner"
        class="h-auto w-full object-cover"
      >
    </div>

    <div class="animate-fade-in-up" style="animation-delay: 100ms;">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-2xl font-bold text-gray-800">{{ t('user.listTitle') }}</h2>
        <div class="flex items-center gap-2 text-sm">
          <span class="animate-pulse-soft rounded-full bg-green-100 px-3 py-1 font-medium text-green-800">{{ t('user.activeCount', { count: activeCount }) }}</span>
          <span class="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">{{ t('user.completedCount', { count: finishedCount }) }}</span>
        </div>
      </div>

      <template v-if="sortedProducts.length">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AuctionCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            :active="product.status === 'active'"
            @select="onSelectProduct(product)"
          />
        </div>

        <div v-if="sortedProducts.length > pageSize" class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
          >
            {{ t('user.prevPage') }}
          </button>

          <span class="font-medium text-gray-700">{{ t('user.pageOf', { page: currentPage, total: totalPages }) }}</span>

          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentPage === totalPages"
            @click="goToNextPage"
          >
            {{ t('user.nextPage') }}
          </button>
        </div>
      </template>

      <p v-else class="py-8 text-center text-gray-500">{{ t('user.noProducts') }}</p>
    </div>

    <div v-if="pendingProduct" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900">{{ t('user.verifyIdTitle') }}</h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('user.verifyIdDesc', { name: pendingProduct.name }) }}
        </p>

        <label class="mt-4 block text-sm">
          <span class="mb-1 block text-gray-700">{{ t('user.idInputLabel') }}</span>
          <input
            v-model="idInput"
            type="text"
            class="w-full rounded-lg border px-3 py-2 uppercase"
            :placeholder="t('user.idInputPlaceholder')"
          >
        </label>

        <p v-if="idError" class="mt-2 text-sm text-red-600">{{ idError }}</p>

        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-lg border px-3 py-2 text-sm" @click="closeIdPrompt">{{ t('user.cancel') }}</button>
          <button type="button" class="rounded-lg bg-primary-800 px-3 py-2 text-sm text-white" @click="confirmProductId">{{ t('user.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

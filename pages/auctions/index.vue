<script setup lang="ts">
import AuctionCard from '~/components/auction/AuctionCard.vue'

definePageMeta({ middleware: ['auth'] })
const { t } = useAppI18n()

const { data: productsData } = await useFetch<any[]>('/api/products/active?format=REVERSE_AUCTION', {
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
  <div class="space-y-12 pb-12">
    <!-- Main Content -->
    <section class="animate-slide-up" style="animation-delay: 100ms;">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-3xl font-black tracking-tight text-white">{{ t('user.listTitle') }}</h2>
          <p class="mt-2 text-slate-400">{{ t('user.listSubtitle') }}</p>
        </div>
        
        <div class="flex items-center gap-3 rounded-xl bg-slate-800/50 p-1.5 shadow-sm ring-1 ring-white/10 backdrop-blur-sm">
          <div class="flex items-center gap-2 rounded-lg bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-300">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
            </span>
            {{ t('user.activeCount', { count: activeCount }) }}
          </div>
          <div class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            {{ t('user.completedCount', { count: finishedCount }) }}
          </div>
        </div>
      </div>

      <template v-if="sortedProducts.length">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          <AuctionCard
            v-for="(product, index) in paginatedProducts"
            :key="product.id"
            :product="product"
            :active="product.status === 'active'"
            class="animate-slide-up"
            :style="{ animationDelay: `${(index % pageSize) * 100}ms` }"
            @select="onSelectProduct(product)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="sortedProducts.length > pageSize" class="mt-12 flex items-center justify-center">
          <div class="flex items-center gap-2 rounded-full bg-slate-800/50 p-2 shadow-sm ring-1 ring-white/10 backdrop-blur-sm">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === 1"
              @click="goToPreviousPage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
            </button>

            <div class="flex items-center gap-1 px-4 font-medium text-slate-300">
              <span class="text-primary-400">{{ currentPage }}</span>
              <span class="text-slate-500">/</span>
              <span>{{ totalPages }}</span>
            </div>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === totalPages"
              @click="goToNextPage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/30 py-24 text-center backdrop-blur-sm">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        </div>
        <h3 class="text-lg font-bold text-white">{{ t('user.noProductsTitle') }}</h3>
        <p class="mt-1 text-slate-400">{{ t('user.noProducts') }}</p>
      </div>
    </section>

    <!-- ID Prompt Modal -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="pendingProduct" class="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" @click="closeIdPrompt"></div>
        
        <div class="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-slate-800 p-8 text-left align-middle shadow-2xl ring-1 ring-white/10 transition-all">
          <div class="absolute right-4 top-4">
            <button @click="closeIdPrompt" class="rounded-full p-2 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>

          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">{{ t('user.verifyIdTitle') }}</h3>
              <p class="text-sm text-slate-400">{{ t('user.verifyIdSubtitle') }}</p>
            </div>
          </div>

          <div class="mb-6 rounded-xl bg-slate-900/50 p-4 border border-slate-700">
            <p class="text-sm text-slate-300">
              {{ t('user.verifyIdDesc', { name: pendingProduct.name }) }}
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-semibold text-slate-300">{{ t('user.idInputLabel') }}</label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                </div>
                <input
                  v-model="idInput"
                  type="text"
                  class="block w-full rounded-xl border-slate-600 bg-slate-900/50 py-3 pl-11 pr-4 text-white uppercase placeholder-slate-500 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors"
                  :placeholder="t('user.idInputPlaceholder')"
                  @keyup.enter="confirmProductId"
                >
              </div>
              <p v-if="idError" class="mt-2 flex items-center gap-1 text-sm text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ idError }}
              </p>
            </div>

            <button 
              type="button" 
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" 
              @click="confirmProductId"
            >
              <span>{{ t('user.confirm') }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

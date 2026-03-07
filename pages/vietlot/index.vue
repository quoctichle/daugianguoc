<script setup lang="ts">
import AuctionCard from '~/components/auction/AuctionCard.vue'

definePageMeta({ middleware: ['auth'] })

const { data: productsData } = await useFetch<any[]>('/api/products/active?format=VIETLOT', {
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

const onSelectProduct = (product: any) => {
  navigateTo(`/vietlot/${product.id}`)
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <section>
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-white">Vietlot</h1>
          <p class="mt-2 text-slate-400">Danh sach phien Vietlot dang dien ra va da ket thuc.</p>
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
        <h3 class="text-lg font-bold text-white">Chua co phien Vietlot</h3>
        <p class="mt-1 text-slate-400">Vui long quay lai sau.</p>
      </div>
    </section>
  </div>
</template>

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

const { data: eventsData } = await useFetch<any[]>('/api/events', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const activeCount = computed(() => productsData.value?.filter(product => product.status === 'active').length || 0)

const eventsScrollContainer = ref<HTMLElement | null>(null)
let isJumping = false

const infiniteEvents = computed(() => {
  if (!eventsData.value || eventsData.value.length === 0) return []
  // Create 3 identical sets for infinite scrolling
  return [
    ...eventsData.value.map(e => ({ ...e, uniqueKey: `set1-${e.id}` })),
    ...eventsData.value.map(e => ({ ...e, uniqueKey: `set2-${e.id}` })),
    ...eventsData.value.map(e => ({ ...e, uniqueKey: `set3-${e.id}` }))
  ]
})

const handleScroll = () => {
  if (!eventsScrollContainer.value || isJumping) return
  const container = eventsScrollContainer.value
  
  // gap-8 is 32px
  const setWidth = (container.scrollWidth + 32) / 3

  // If we scroll into the first set, jump to the middle set
  if (container.scrollLeft < setWidth * 0.5) {
    isJumping = true
    container.style.scrollSnapType = 'none'
    container.scrollLeft += setWidth
    setTimeout(() => {
      container.style.scrollSnapType = ''
      isJumping = false
    }, 50)
  } 
  // If we scroll into the third set, jump back to the middle set
  else if (container.scrollLeft > setWidth * 1.5) {
    isJumping = true
    container.style.scrollSnapType = 'none'
    container.scrollLeft -= setWidth
    setTimeout(() => {
      container.style.scrollSnapType = ''
      isJumping = false
    }, 50)
  }
}

onMounted(() => {
  // Initialize scroll position to the middle set
  setTimeout(() => {
    if (eventsScrollContainer.value) {
      const container = eventsScrollContainer.value
      const setWidth = (container.scrollWidth + 32) / 3
      container.scrollLeft = setWidth
    }
  }, 100)
})

const scrollEvents = (direction: 'left' | 'right') => {
  if (!eventsScrollContainer.value) return
  const container = eventsScrollContainer.value
  const scrollAmount = container.clientWidth
  
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="w-screen relative left-1/2 right-1/2 -mx-[50vw] -mt-8 -mb-8 flex flex-col">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-slate-900">
      <div class="absolute inset-0">
        <img
          src="/uploads/Banner.jpg"
          alt="Event Banner"
          class="h-full w-full object-cover object-center opacity-60 transition-transform duration-1000 hover:scale-105"
        >
        <!-- Gradient blending into the events section background (#050505) -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-slate-900/40 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent"></div>
      </div>
      
      <div class="relative z-10 mx-auto flex max-w-7xl min-h-[600px] flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div class="max-w-2xl animate-slide-up">
          <span class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-500/20 border border-primary-500/30 px-4 py-1.5 text-sm font-semibold text-primary-300 backdrop-blur-md">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
            </span>
            {{ t('user.activeCount', { count: activeCount }) }}
          </span>
          <h1 class="mb-6 text-4xl font-black tracking-tight bg-gradient-to-r from-[#ffe600] to-[#66cc00] bg-clip-text text-transparent sm:text-5xl lg:text-6xl">
            {{ t('user.heroTitle') }} {{ t('user.heroHighlight') }}
          </h1>
          <p class="mb-8 text-lg text-slate-300 sm:text-xl">
            {{ t('user.heroSubtitle') }} <span class="font-bold text-accent-400">{{ t('user.heroPrice') }}</span>
          </p>
          <div class="flex flex-wrap gap-4">
            <NuxtLink to="/auctions" class="rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-4 font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-1 hover:shadow-primary-500/50">
              {{ t('user.exploreNow') }}
            </NuxtLink>
            <button class="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
              {{ t('user.learnRules') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Events Section -->
    <section v-if="eventsData && eventsData.length > 0" class="relative overflow-hidden bg-[#050505] pb-24 pt-10 group/section">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#00ff66 1px, transparent 1px); background-size: 30px 30px;"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]"></div>
      
      <!-- Gradient blending into footer -->
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-900 z-10 pointer-events-none"></div>

      <div class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center animate-slide-up" style="animation-delay: 50ms;">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#00ff66] uppercase drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]">
            {{ t('user.ongoingEvents') }}
          </h2>
        </div>
        
        <div class="relative z-10 animate-slide-up" style="animation-delay: 100ms;">
          <!-- Navigation Buttons -->
          <button 
            @click="scrollEvents('left')"
            class="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 sm:-ml-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/10 hover:bg-[#00ff66] hover:text-black transition-all opacity-0 group-hover/section:opacity-100 disabled:opacity-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button 
            @click="scrollEvents('right')"
            class="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 sm:-mr-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/10 hover:bg-[#00ff66] hover:text-black transition-all opacity-0 group-hover/section:opacity-100 disabled:opacity-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <!-- Scroll Container -->
          <div 
            ref="eventsScrollContainer"
            class="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4"
            style="scrollbar-width: none; -ms-overflow-style: none;"
            @scroll="handleScroll"
          >
            <a
              v-for="event in infiniteEvents"
              :key="event.uniqueKey"
              :href="event.link || '#'"
              class="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 snap-start shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
            >
              <div class="aspect-square w-full overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/50">
                <img
                  v-if="event.imageUrl"
                  :src="event.imageUrl"
                  :alt="event.title"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                >
                <div v-else class="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
                  {{ t('auction.noImage') }}
                </div>
              </div>
              
              <div class="mt-5 flex flex-col text-center px-2">
                <h3 class="mb-3 text-base font-bold leading-snug text-white uppercase group-hover:text-[#00ff66] transition-colors line-clamp-2">
                  {{ event.title }}
                </h3>
                <p class="line-clamp-4 text-sm text-gray-400 leading-relaxed">
                  {{ event.description }}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

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

const { data: featuredNewsData } = await useFetch<any[]>('/api/featured/news', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const { data: featuredProductsData } = await useFetch<any[]>('/api/featured/products', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const activeCount = computed(() => productsData.value?.filter(product => product.status === 'active').length || 0)

const eventsScrollContainer = ref<HTMLElement | null>(null)
let isJumping = false

const eventItems = computed(() => eventsData.value || [])
const shouldLoopEvents = computed(() => eventItems.value.length > 4)

const infiniteEvents = computed(() => {
  if (!eventItems.value.length) return []
  if (!shouldLoopEvents.value) {
    return eventItems.value.map(e => ({ ...e, uniqueKey: `single-${e.id}` }))
  }

  // Create 3 identical sets for infinite scrolling
  return [
    ...eventItems.value.map(e => ({ ...e, uniqueKey: `set1-${e.id}` })),
    ...eventItems.value.map(e => ({ ...e, uniqueKey: `set2-${e.id}` })),
    ...eventItems.value.map(e => ({ ...e, uniqueKey: `set3-${e.id}` }))
  ]
})

const handleScroll = () => {
  if (!eventsScrollContainer.value || isJumping || !shouldLoopEvents.value) return
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
    if (eventsScrollContainer.value && shouldLoopEvents.value) {
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

const featuredTab = ref<'news' | 'products'>('news')
const featuredScrollContainer = ref<HTMLElement | null>(null)
let isFeaturedJumping = false

const activeFeaturedItems = computed(() => {
  return featuredTab.value === 'news'
    ? (featuredNewsData.value || [])
    : (featuredProductsData.value || [])
})

const infiniteFeaturedItems = computed(() => {
  if (!activeFeaturedItems.value.length) return []

  if (activeFeaturedItems.value.length <= 4) {
    return activeFeaturedItems.value.map(item => ({ ...item, uniqueKey: `single-${featuredTab.value}-${item.id}` }))
  }

  return [
    ...activeFeaturedItems.value.map(item => ({ ...item, uniqueKey: `set1-${featuredTab.value}-${item.id}` })),
    ...activeFeaturedItems.value.map(item => ({ ...item, uniqueKey: `set2-${featuredTab.value}-${item.id}` })),
    ...activeFeaturedItems.value.map(item => ({ ...item, uniqueKey: `set3-${featuredTab.value}-${item.id}` }))
  ]
})

const hasFeaturedSection = computed(() => {
  return (featuredNewsData.value?.length || 0) > 0 || (featuredProductsData.value?.length || 0) > 0
})

const shouldLoopFeatured = computed(() => activeFeaturedItems.value.length > 4)

const resetFeaturedToMiddle = () => {
  if (!featuredScrollContainer.value || !activeFeaturedItems.value.length || !shouldLoopFeatured.value) return
  const container = featuredScrollContainer.value
  const setWidth = (container.scrollWidth + 32) / 3
  container.scrollLeft = setWidth
}

const handleFeaturedScroll = () => {
  if (!featuredScrollContainer.value || isFeaturedJumping || !activeFeaturedItems.value.length || !shouldLoopFeatured.value) return
  const container = featuredScrollContainer.value
  const setWidth = (container.scrollWidth + 32) / 3

  if (container.scrollLeft < setWidth * 0.5) {
    isFeaturedJumping = true
    container.style.scrollSnapType = 'none'
    container.scrollLeft += setWidth
    setTimeout(() => {
      container.style.scrollSnapType = ''
      isFeaturedJumping = false
    }, 50)
  }
  else if (container.scrollLeft > setWidth * 1.5) {
    isFeaturedJumping = true
    container.style.scrollSnapType = 'none'
    container.scrollLeft -= setWidth
    setTimeout(() => {
      container.style.scrollSnapType = ''
      isFeaturedJumping = false
    }, 50)
  }
}

watch(featuredTab, async () => {
  await nextTick()
  if (shouldLoopFeatured.value) {
    setTimeout(() => resetFeaturedToMiddle(), 50)
  }
  else if (featuredScrollContainer.value) {
    featuredScrollContainer.value.scrollLeft = 0
  }
})

const scrollFeatured = (direction: 'left' | 'right') => {
  if (!featuredScrollContainer.value) return
  const container = featuredScrollContainer.value
  const scrollAmount = container.clientWidth

  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }
  else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

onMounted(() => {
  if (shouldLoopFeatured.value) {
    setTimeout(() => resetFeaturedToMiddle(), 120)
  }
})
</script>

<template>
  <div class="w-screen relative left-1/2 right-1/2 -mx-[50vw] -mt-8 -mb-8 flex flex-col">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-[#031729]">
      <div class="absolute inset-0">
        <img
          src="/uploads/Banner.jpg"
          alt="Event Banner"
          class="h-full w-full object-cover object-center opacity-60 transition-transform duration-1000 hover:scale-105"
        >
        <!-- Gradient blending into the events section background (#031729) -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#031729] via-[#031729]/35 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#031729]/70 via-transparent to-transparent"></div>
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
    <section v-if="eventsData && eventsData.length > 0" class="relative overflow-hidden bg-[#031729] pb-16 pt-10 group/section">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-emerald-400/5"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#031729]/80 to-[#031729]"></div>
      
      <div class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center animate-slide-up" style="animation-delay: 50ms;">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-[#ffe600] to-[#66cc00] bg-clip-text text-transparent uppercase drop-shadow-[0_0_15px_rgba(102,204,0,0.3)] py-2 leading-normal">
            {{ t('user.ongoingEvents') }}
          </h2>
        </div>
        
        <div class="relative z-10 animate-slide-up" style="animation-delay: 100ms;">
          <!-- Navigation Buttons -->
          <button
            v-if="shouldLoopEvents"
            @click="scrollEvents('left')"
            class="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 sm:-ml-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#031729]/70 text-white backdrop-blur-sm border border-white/10 hover:bg-[#00ff66] hover:text-black transition-all opacity-0 group-hover/section:opacity-100 disabled:opacity-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            v-if="shouldLoopEvents"
            @click="scrollEvents('right')"
            class="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 sm:-mr-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#031729]/70 text-white backdrop-blur-sm border border-white/10 hover:bg-[#00ff66] hover:text-black transition-all opacity-0 group-hover/section:opacity-100 disabled:opacity-0"
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

    <section v-if="hasFeaturedSection" class="relative overflow-hidden bg-[#031729] pb-24 pt-8">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-emerald-400/5"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#031729]/80 to-[#031729]"></div>
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#02111a] z-10 pointer-events-none"></div>

      <div class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 text-center">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-[#ffe600] to-[#66cc00] bg-clip-text text-transparent uppercase py-2 leading-normal">
            CÁC TIN NỔI BẬT
          </h2>
        </div>

        <div class="mb-8 flex items-center justify-center gap-4">
          <button
            type="button"
            class="rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wide transition-colors"
            :class="featuredTab === 'news' ? 'bg-[#00ff66] text-black' : 'bg-white/10 text-white hover:bg-white/20'"
            @click="featuredTab = 'news'"
          >
            Tin tức
          </button>
          <button
            type="button"
            class="rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wide transition-colors"
            :class="featuredTab === 'products' ? 'bg-[#00ff66] text-black' : 'bg-white/10 text-white hover:bg-white/20'"
            @click="featuredTab = 'products'"
          >
            Sản phẩm
          </button>
        </div>

        <div class="relative">
          <button
            v-if="shouldLoopFeatured"
            type="button"
            class="absolute left-0 top-1/2 z-20 -ml-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#031729]/70 text-white backdrop-blur-sm transition-all hover:bg-[#00ff66] hover:text-black"
            @click="scrollFeatured('left')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            v-if="shouldLoopFeatured"
            type="button"
            class="absolute right-0 top-1/2 z-20 -mr-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#031729]/70 text-white backdrop-blur-sm transition-all hover:bg-[#00ff66] hover:text-black"
            @click="scrollFeatured('right')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div
            ref="featuredScrollContainer"
            class="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-2"
            style="scrollbar-width: none; -ms-overflow-style: none;"
            @scroll="handleFeaturedScroll"
          >
            <a
              v-for="item in infiniteFeaturedItems"
              :key="item.uniqueKey"
              :href="item.link || '#'"
              target="_blank"
              rel="noopener noreferrer"
              class="group w-full shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-2 sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
            >
              <div class="aspect-video w-full overflow-hidden bg-slate-800">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.title"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                >
                <div v-else class="flex h-full w-full items-center justify-center text-slate-500">
                  {{ t('auction.noImage') }}
                </div>
              </div>

              <div class="p-4">
                <h3 class="line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-[#00ff66]">
                  {{ item.title }}
                </h3>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

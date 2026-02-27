<script setup lang="ts">
import BidForm from '~/components/auction/BidForm.vue'
import CountdownTimer from '~/components/auction/CountdownTimer.vue'
import WinnerList from '~/components/auction/WinnerList.vue'

definePageMeta({ middleware: ['auth'] })
const { t } = useAppI18n()

const route = useRoute()
const productId = computed(() => route.params.id as string)
const accessId = computed(() => String(route.query.accessId || '').trim().toUpperCase())
const typedAccessId = ref(accessId.value)
const accessError = ref('')
const ID_PATTERN = /^ID\d{8}$/
let statusPoller: ReturnType<typeof setInterval> | null = null

const bidError = ref('')
const bidSuccess = ref('')
const showWinnerPopup = ref(false)
const hasShownWinnerPopup = ref(false)

const { data: productDetail, refresh: refreshDetail } = await useFetch<any>(() => `/api/products/${productId.value}`, {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const isAccessGranted = computed(() => {
  if (!productDetail.value?.isUsedProduct) {
    return true
  }

  return ID_PATTERN.test(accessId.value)
})

const winnerList = computed(() => productDetail.value?.winners || [])

const formatYen = (amount: number) => `¥ ${amount.toLocaleString('ja-JP')}`

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) {
    return email
  }

  const chars = Array.from(localPart)
  const prefix = chars.slice(0, 2).join('')
  const suffix = chars.length > 2 ? chars[chars.length - 1] : ''
  const starCount = Math.max(3, chars.length - 3)

  return `${prefix}${'*'.repeat(starCount)}${suffix}@${domain}`
}

const fireworkParticles = [
  { left: '10%', top: '20%', delay: '0ms', duration: '1300ms', color: 'bg-primary-400' },
  { left: '22%', top: '12%', delay: '120ms', duration: '1500ms', color: 'bg-green-400' },
  { left: '35%', top: '22%', delay: '240ms', duration: '1400ms', color: 'bg-amber-400' },
  { left: '48%', top: '14%', delay: '360ms', duration: '1250ms', color: 'bg-primary-300' },
  { left: '60%', top: '24%', delay: '480ms', duration: '1450ms', color: 'bg-green-500' },
  { left: '74%', top: '16%', delay: '600ms', duration: '1300ms', color: 'bg-amber-300' },
  { left: '86%', top: '22%', delay: '720ms', duration: '1500ms', color: 'bg-primary-500' },
  { left: '15%', top: '42%', delay: '840ms', duration: '1200ms', color: 'bg-green-300' },
  { left: '30%', top: '36%', delay: '960ms', duration: '1350ms', color: 'bg-amber-500' },
  { left: '52%', top: '40%', delay: '1080ms', duration: '1500ms', color: 'bg-primary-400' },
  { left: '70%', top: '34%', delay: '1200ms', duration: '1400ms', color: 'bg-green-400' },
  { left: '84%', top: '38%', delay: '1320ms', duration: '1300ms', color: 'bg-amber-400' }
]

watch(accessId, (value) => {
  typedAccessId.value = value
  accessError.value = ''
})

watch(productId, () => {
  showWinnerPopup.value = false
  hasShownWinnerPopup.value = false
})

watch(
  [() => productDetail.value?.status, isAccessGranted],
  ([status, granted]) => {
    if (status === 'completed' && granted && !hasShownWinnerPopup.value) {
      showWinnerPopup.value = true
      hasShownWinnerPopup.value = true
    }
  },
  { immediate: true }
)

const verifyAccessId = async () => {
  const value = typedAccessId.value.trim().toUpperCase()

  if (!ID_PATTERN.test(value)) {
    accessError.value = t('user.idInvalid')
    return
  }

  accessError.value = ''
  await navigateTo(`/auctions/${productId.value}?accessId=${value}`, { replace: true })
}

const closeWinnerPopup = () => {
  showWinnerPopup.value = false
}

const submitBid = async (amount: number) => {
  bidError.value = ''
  bidSuccess.value = ''
  if (!productId.value) return

  try {
    await $fetch('/api/bids', {
      method: 'POST',
      body: {
        productId: productId.value,
        amount,
        customerId: productDetail.value?.isUsedProduct ? accessId.value : undefined
      }
    })

    bidSuccess.value = t('auction.bidSuccess')
    await refreshDetail()
  }
  catch (error: any) {
    bidError.value = error?.data?.statusMessage || t('auction.bidFailed')
  }
}

onMounted(() => {
  statusPoller = setInterval(async () => {
    if (!productDetail.value || productDetail.value.status === 'completed') {
      return
    }
    await refreshDetail()
  }, 3000)
})

onUnmounted(() => {
  if (statusPoller) {
    clearInterval(statusPoller)
  }
})
</script>

<template>
  <div class="space-y-6 pb-12">
    <NuxtLink to="/" class="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary-600">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:-translate-x-1 group-hover:bg-primary-50 group-hover:ring-primary-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </div>
      {{ t('auction.backToList') }}
    </NuxtLink>

    <div v-if="productDetail && !isAccessGranted" class="animate-slide-up mx-auto max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
      <div class="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div class="relative z-10">
          <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/20 ring-1 ring-primary-500/50 backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 class="text-2xl font-black text-white">{{ t('auction.verifyTitle') }}</h2>
          <p class="mt-2 text-slate-300">{{ t('auction.verifySubtitle') }}</p>
        </div>
      </div>

      <div class="p-8">
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">{{ t('user.idInputLabel') }}</label>
            <input
              v-model="typedAccessId"
              type="text"
              class="block w-full rounded-xl border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 uppercase placeholder-slate-400 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-primary-500 sm:text-sm transition-colors"
              :placeholder="t('user.idInputPlaceholder')"
              @keyup.enter="verifyAccessId"
            >
            <p v-if="accessError" class="mt-2 flex items-center gap-1 text-sm text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              {{ accessError }}
            </p>
          </div>
          <button 
            type="button" 
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:shadow-primary-500/40" 
            @click="verifyAccessId"
          >
            {{ t('auction.verifyButton') }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="productDetail" class="animate-slide-up grid gap-8 lg:grid-cols-12 lg:items-start">
      <!-- Left Column: Product Showcase -->
      <section class="lg:col-span-7 xl:col-span-8 space-y-6">
        <div class="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <!-- Image Area -->
          <div class="relative flex aspect-[4/3] w-full items-center justify-center bg-slate-100 p-8 sm:p-12">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/10"></div>
            <img
              v-if="productDetail.imageUrl"
              :src="productDetail.imageUrl"
              :alt="productDetail.name"
              class="relative z-10 h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
            >
            <div v-else class="relative z-10 flex flex-col items-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span class="mt-4 font-medium">{{ t('auction.noImage') }}</span>
            </div>
            
            <!-- Badges -->
            <div class="absolute left-6 top-6 z-20 flex flex-col gap-2">
              <div
                class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md"
                :class="productDetail.status === 'active' ? 'bg-primary-500/90 text-white ring-1 ring-white/20' : 'bg-slate-900/80 text-slate-200 ring-1 ring-white/10'"
              >
                <span v-if="productDetail.status === 'active'" class="relative flex h-2.5 w-2.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
                </span>
                {{ productDetail.status === 'active' ? t('auction.status.active') : t('auction.status.completed') }}
              </div>
              <div v-if="productDetail.productCode" class="inline-flex w-fit rounded-full bg-black/40 px-3 py-1.5 text-xs font-mono font-medium text-white backdrop-blur-md ring-1 ring-white/20">
                #{{ productDetail.productCode }}
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-8 sm:p-10">
            <h1 class="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{{ productDetail.name }}</h1>
            <div class="mt-6 prose prose-slate max-w-none text-slate-600">
              <p class="whitespace-pre-line leading-relaxed">{{ productDetail.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Column: Bidding Console -->
      <div class="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
        <!-- Timer Card -->
        <div class="overflow-hidden rounded-3xl bg-slate-900 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-800">
          <div class="p-6 sm:p-8">
            <CountdownTimer :starts-at="productDetail.startsAt" :duration-minutes="productDetail.durationMinutes" :status="productDetail.status" />
          </div>
          
          <!-- Bidding Area -->
          <div v-if="productDetail.status === 'active'" class="bg-white p-6 sm:p-8">
            <BidForm
              :max-bids-per-user="productDetail.maxBidsPerUser"
              :my-bid-count="productDetail.myBidCount"
              @submit="submitBid"
            />
            
            <transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
            >
              <div v-if="bidError" class="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                <p class="font-medium">{{ bidError }}</p>
              </div>
            </transition>
            
            <transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
            >
              <div v-if="bidSuccess" class="mt-4 flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-700 ring-1 ring-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                <p class="font-medium">{{ bidSuccess }}</p>
              </div>
            </transition>
          </div>
        </div>

        <!-- Winner List -->
        <div class="rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
          <WinnerList :status="productDetail.status" :players="productDetail.players || []" />
        </div>
      </div>
    </div>

    <!-- Winner Popup -->
    <transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showWinnerPopup" class="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" @click="closeWinnerPopup"></div>
        
        <div class="relative w-full max-w-2xl transform overflow-hidden rounded-[2rem] bg-white text-left align-middle shadow-2xl transition-all">
          <!-- Celebration Header -->
          <div class="bg-gradient-to-br from-primary-600 to-primary-900 px-8 py-12 text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            <!-- Fireworks -->
            <div class="pointer-events-none absolute inset-0 overflow-hidden">
              <span
                v-for="(item, index) in fireworkParticles"
                :key="index"
                class="firework-particle absolute h-3 w-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                :class="item.color"
                :style="{ left: item.left, top: item.top, animationDelay: item.delay, animationDuration: item.duration }"
              />
            </div>

            <div class="relative z-10">
              <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <h3 class="text-3xl font-black text-white drop-shadow-md">{{ t('auction.popupTitle') }}</h3>
              <p class="mt-3 text-lg font-medium text-primary-100">{{ t('auction.popupSubtitle') }}</p>
            </div>
          </div>

          <div class="p-8">
            <div v-if="winnerList.length" class="space-y-4">
              <div
                v-for="(winner, index) in winnerList"
                :key="winner.id"
                class="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary-200 hover:bg-primary-50 hover:shadow-md"
              >
                <div v-if="index === 0" class="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-accent-400/20 blur-xl"></div>
                
                <div class="relative z-10 flex items-center gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl font-black shadow-sm"
                    :class="index === 0 ? 'bg-gradient-to-br from-accent-300 to-accent-500 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'">
                    #{{ winner.rank }}
                  </div>
                  <div>
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('auction.winnerLabel') }}</p>
                    <p class="font-semibold text-slate-900">{{ maskEmail(winner.user.email) }}</p>
                  </div>
                </div>
                <div class="relative z-10 text-right">
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('auction.priceLabel') }}</p>
                  <p class="text-xl font-black text-primary-600">{{ formatYen(winner.amount) }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mb-4 h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p class="text-lg font-medium text-slate-600">{{ t('auction.popupNoWinner') }}</p>
            </div>

            <button
              type="button"
              class="mt-8 w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              @click="closeWinnerPopup"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.firework-particle {
  animation-name: firework-burst;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
}

@keyframes firework-burst {
  0% {
    transform: scale(0.2) translateY(8px);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  100% {
    transform: scale(1.4) translateY(-48px);
    opacity: 0;
  }
}
</style>

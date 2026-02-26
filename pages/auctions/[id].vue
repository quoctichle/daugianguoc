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
  <div class="space-y-4">
    <NuxtLink to="/" class="inline-block text-sm text-primary-800 hover:underline">&larr; {{ t('auction.backToList') }}</NuxtLink>

    <div v-if="productDetail && !isAccessGranted" class="animate-fade-in-up rounded-xl border border-white/60 bg-white/90 p-6 shadow-md backdrop-blur-sm">
      <h2 class="text-2xl font-bold text-gray-900">{{ t('auction.verifyTitle') }}</h2>
      <p class="mt-2 text-sm text-gray-600">
        {{ t('auction.verifySubtitle') }}
      </p>

      <div class="mt-4 max-w-sm space-y-3">
        <input
          v-model="typedAccessId"
          type="text"
          class="w-full rounded-lg border px-3 py-2 uppercase"
          :placeholder="t('user.idInputPlaceholder')"
        >
        <button type="button" class="rounded-lg bg-primary-800 px-4 py-2 text-sm text-white" @click="verifyAccessId">
          {{ t('auction.verifyButton') }}
        </button>
        <p v-if="accessError" class="text-sm text-red-600">{{ accessError }}</p>
      </div>
    </div>

    <div v-else-if="productDetail" class="animate-fade-in-up grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <section class="space-y-5 rounded-xl border border-white/60 bg-white/90 p-6 shadow-md backdrop-blur-sm">
        <div class="space-y-3">
          <h2 class="text-3xl font-bold text-gray-900">{{ productDetail.name }}</h2>
          <div class="flex h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 shadow-inner">
            <img
              v-if="productDetail.imageUrl"
              :src="productDetail.imageUrl"
              :alt="productDetail.name"
              class="h-full w-full object-contain"
            >
          </div>
          <p class="text-base text-gray-700">{{ productDetail.description }}</p>
        </div>

        <CountdownTimer :starts-at="productDetail.startsAt" :duration-minutes="productDetail.durationMinutes" :status="productDetail.status" />

        <div v-if="productDetail.status === 'active'" class="rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-primary-200 hover:shadow-sm">
          <BidForm
            :max-bids-per-user="productDetail.maxBidsPerUser"
            :my-bid-count="productDetail.myBidCount"
            @submit="submitBid"
          />
          <p v-if="bidError" class="mt-3 text-center text-sm font-medium text-red-600">{{ bidError }}</p>
          <p v-if="bidSuccess" class="mt-3 text-center text-sm font-medium text-green-600">{{ bidSuccess }}</p>
        </div>
      </section>

      <div class="lg:sticky lg:top-24">
        <WinnerList :status="productDetail.status" :players="productDetail.players || []" />
      </div>
    </div>

    <div v-if="showWinnerPopup" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div class="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          class="absolute right-3 top-3 rounded-full border border-gray-200 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-50"
          @click="closeWinnerPopup"
        >
          ✕
        </button>

        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            v-for="(item, index) in fireworkParticles"
            :key="index"
            class="firework-particle absolute h-2.5 w-2.5 rounded-full opacity-80"
            :class="item.color"
            :style="{ left: item.left, top: item.top, animationDelay: item.delay, animationDuration: item.duration }"
          />
        </div>

        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-primary-900">{{ t('auction.popupTitle') }}</h3>
          <p class="mt-2 text-sm text-gray-600">{{ t('auction.popupSubtitle') }}</p>

          <ul v-if="winnerList.length" class="mt-4 space-y-2">
            <li
              v-for="winner in winnerList"
              :key="winner.id"
              class="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm"
            >
              <span>#{{ winner.rank }} - {{ maskEmail(winner.user.email) }}</span>
              <span class="font-semibold text-primary-900">{{ formatYen(winner.amount) }}</span>
            </li>
          </ul>
          <p v-else class="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {{ t('auction.popupNoWinner') }}
          </p>
        </div>
      </div>
    </div>
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

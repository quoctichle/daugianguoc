<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const selectedNumbers = ref<number[]>([])
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitError = ref('')
const now = ref(Date.now())
const displayDrawNumbers = ref<string[]>(Array.from({ length: 10 }, () => '00'))
const isAnimatingDraw = ref(false)
const latestDrawKey = ref('')
const roundKey = ref('')
const waitingForRoundResult = ref(false)
const spinCanStop = ref(false)
const pendingResultNumbers = ref<string[] | null>(null)

let spinIntervals: number[] = []
let stopTimeouts: number[] = []
let minSpinTimeout: number | null = null

const { data: vietlotState, refresh } = await useFetch<any>('/api/vietlot/state', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const eventData = computed(() => vietlotState.value?.event || null)
const currentRound = computed(() => vietlotState.value?.currentRound || null)
const myCurrentTicket = computed(() => vietlotState.value?.myCurrentTicket || null)
const recentResults = computed(() => vietlotState.value?.recentResults || [])
const latestDraw = computed(() => vietlotState.value?.latestDraw || null)
const prizeConfig = computed(() => vietlotState.value?.prizeConfig || null)

watch(myCurrentTicket, (ticket) => {
  if (!ticket?.pickedNumbers) return
  selectedNumbers.value = ticket.pickedNumbers.map((value: string) => Number(value))
}, { immediate: true })

const remainingSeconds = computed(() => {
  if (!currentRound.value?.roundEnd) return 0
  const end = new Date(currentRound.value.roundEnd).getTime()
  return Math.max(0, Math.floor((end - now.value) / 1000))
})

const countdownLabel = computed(() => {
  const total = remainingSeconds.value
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const numberLabel = (value: number) => `${value}`.padStart(2, '0')
const randomDrawNumber = () => numberLabel(Math.floor(Math.random() * 99) + 1)

const clearDrawTimers = () => {
  if (!import.meta.client) return

  spinIntervals.forEach((timerId) => window.clearInterval(timerId))
  stopTimeouts.forEach((timerId) => window.clearTimeout(timerId))
  if (minSpinTimeout !== null) {
    window.clearTimeout(minSpinTimeout)
    minSpinTimeout = null
  }

  spinIntervals = []
  stopTimeouts = []
  isAnimatingDraw.value = false
  waitingForRoundResult.value = false
  spinCanStop.value = false
  pendingResultNumbers.value = null
}

const applyDrawNumbers = (numbers: string[]) => {
  displayDrawNumbers.value = [...numbers]
}

const startRoundSpin = () => {
  if (!import.meta.client) return
  if (!eventData.value || isAnimatingDraw.value) return

  spinIntervals.forEach((timerId) => window.clearInterval(timerId))
  stopTimeouts.forEach((timerId) => window.clearTimeout(timerId))
  if (minSpinTimeout !== null) {
    window.clearTimeout(minSpinTimeout)
  }

  spinIntervals = []
  stopTimeouts = []
  minSpinTimeout = null
  waitingForRoundResult.value = true
  spinCanStop.value = false
  pendingResultNumbers.value = null

  isAnimatingDraw.value = true
  displayDrawNumbers.value = Array.from({ length: 10 }, () => randomDrawNumber())

  spinIntervals = Array.from({ length: 10 }, (_, index) => {
    return window.setInterval(() => {
      displayDrawNumbers.value[index] = randomDrawNumber()
    }, 60 + (index * 8))
  })

  // Quay tối thiểu 5 giây trước khi cho phép dừng tuần tự theo kết quả mới.
  minSpinTimeout = window.setTimeout(() => {
    spinCanStop.value = true
    minSpinTimeout = null

    if (pendingResultNumbers.value?.length === 10) {
      stopWithFinalNumbers(pendingResultNumbers.value)
    }
  }, 5000)
}

const stopWithFinalNumbers = (numbers: string[]) => {
  if (!import.meta.client) return

  if (numbers.length !== 10) {
    applyDrawNumbers(numbers)
    return
  }

  if (!isAnimatingDraw.value) {
    applyDrawNumbers(numbers)
    waitingForRoundResult.value = false
    spinCanStop.value = false
    pendingResultNumbers.value = null
    return
  }

  stopTimeouts.forEach((timerId) => window.clearTimeout(timerId))
  stopTimeouts = []
  pendingResultNumbers.value = null

  stopTimeouts = numbers.map((value, index) => {
    return window.setTimeout(() => {
      window.clearInterval(spinIntervals[index])
      displayDrawNumbers.value[index] = value

      if (index === numbers.length - 1) {
        isAnimatingDraw.value = false
        waitingForRoundResult.value = false
        spinCanStop.value = false
      }
    }, 300 + (index * 260))
  })
}

const toggleNumber = (value: number) => {
  submitMessage.value = ''
  submitError.value = ''

  const index = selectedNumbers.value.indexOf(value)
  if (index >= 0) {
    selectedNumbers.value.splice(index, 1)
    selectedNumbers.value.sort((a, b) => a - b)
    return
  }

  if (selectedNumbers.value.length >= 10) {
    submitError.value = 'Bạn chỉ được chọn tối đa 10 số.'
    return
  }

  selectedNumbers.value.push(value)
  selectedNumbers.value.sort((a, b) => a - b)
}

const submitNumbers = async () => {
  submitMessage.value = ''
  submitError.value = ''

  if (!eventData.value?.id) {
    submitError.value = 'Không tìm thấy sự kiện Vietlot đang hoạt động.'
    return
  }

  if (selectedNumbers.value.length !== 10) {
    submitError.value = 'Bạn phải chọn đúng 10 số.'
    return
  }

  isSubmitting.value = true
  try {
    await $fetch('/api/vietlot/play', {
      method: 'POST',
      body: {
        eventId: eventData.value.id,
        numbers: selectedNumbers.value
      }
    })

    submitMessage.value = 'Đã lưu bộ số của bạn cho kỳ quay hiện tại.'
    await refresh()
  }
  catch (error: any) {
    submitError.value = error?.data?.statusMessage || 'Không thể lưu bộ số.'
  }
  finally {
    isSubmitting.value = false
  }
}

const prizeRules = computed(() => {
  if (!prizeConfig.value) return []
  return [
    { match: '10 số', label: prizeConfig.value.specialPrize },
    { match: '9 số', label: prizeConfig.value.firstPrize },
    { match: '8 số', label: prizeConfig.value.secondPrize },
    { match: '7 số', label: prizeConfig.value.thirdPrize },
    { match: '6 số', label: prizeConfig.value.fourthPrize },
    { match: '5 số', label: prizeConfig.value.fifthPrize },
    { match: '0 số', label: prizeConfig.value.consolationPrize }
  ]
})

watch(latestDraw, (draw) => {
  if (!import.meta.client) return

  const winningNumbers = draw?.winningNumbers as string[] | undefined
  if (!winningNumbers?.length) return

  const drawKey = `${draw.roundStart}`
  if (drawKey !== latestDrawKey.value) {
    latestDrawKey.value = drawKey
  }

  // Nếu đang quay, mọi kết quả nhận được đều phải đi qua luồng dừng quay.
  if (isAnimatingDraw.value && waitingForRoundResult.value) {
    if (spinCanStop.value) {
      stopWithFinalNumbers(winningNumbers)
    }
    else {
      pendingResultNumbers.value = winningNumbers
    }
    return
  }

  applyDrawNumbers(winningNumbers)
}, { immediate: true })

watch(() => currentRound.value?.roundStart, (value) => {
  if (!import.meta.client) return
  if (!value || !eventData.value) return

  const key = `${value}`
  if (!roundKey.value) {
    roundKey.value = key
    return
  }

  if (key !== roundKey.value) {
    roundKey.value = key
    startRoundSpin()
  }
}, { immediate: true })

watch(eventData, (value) => {
  if (!import.meta.client) return
  if (value) return

  clearDrawTimers()
  displayDrawNumbers.value = Array.from({ length: 10 }, () => '00')
  roundKey.value = ''
  latestDrawKey.value = ''
}, { immediate: true })

onMounted(() => {
  const timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)

  const puller = window.setInterval(async () => {
    await refresh()
  }, 3000)

  onBeforeUnmount(() => {
    clearDrawTimers()
    window.clearInterval(timer)
    window.clearInterval(puller)
  })
})
</script>

<template>
  <section class="space-y-8 pb-12">
    <div class="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/10 p-6 shadow-xl shadow-amber-900/10">
      <h1 class="text-3xl font-black text-white">Vietlot</h1>
      <p class="mt-2 text-sm text-amber-100/90">{{ eventData?.title || 'Sự kiện quay số 5 phút/lần' }}</p>
      <p class="mt-4 text-sm text-slate-200">Mỗi 5 phút hệ thống quay ngẫu nhiên 10 số (01-99). Bạn chọn 10 số để dự thưởng.</p>
      <div class="mt-5 inline-flex items-center rounded-xl bg-slate-950/40 px-4 py-2 text-sm font-semibold text-amber-300 ring-1 ring-amber-300/30">
        Còn lại đến kỳ quay: {{ countdownLabel }}
      </div>

      <div class="mt-5 rounded-2xl border border-amber-300/20 bg-slate-950/35 p-4">
        <p class="mb-3 text-sm font-semibold text-amber-200">Kết quả quay gần nhất (10 số)</p>
        <div class="grid grid-cols-5 gap-2 sm:grid-cols-10">
          <div
            v-for="(num, index) in displayDrawNumbers"
            :key="index"
            class="flex h-12 items-center justify-center rounded-xl border border-amber-200/25 bg-slate-900/70 text-base font-black tracking-wide text-amber-100"
            :class="isAnimatingDraw ? 'animate-pulse' : ''"
          >
            {{ num }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="eventData" class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4 rounded-3xl border border-slate-700 bg-slate-900/50 p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">Chọn 10 số của bạn</h2>
          <span class="text-sm text-slate-400">Đã chọn: {{ selectedNumbers.length }}/10</span>
        </div>

        <div class="grid grid-cols-6 gap-2 sm:grid-cols-9 md:grid-cols-11">
          <button
            v-for="value in 99"
            :key="value"
            type="button"
            class="rounded-lg border px-2 py-2 text-sm font-semibold transition"
            :class="selectedNumbers.includes(value) ? 'border-amber-300 bg-amber-400/25 text-amber-200' : 'border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-500'"
            @click="toggleNumber(value)"
          >
            {{ numberLabel(value) }}
          </button>
        </div>

        <div class="rounded-xl border border-slate-700 bg-slate-950/40 p-3 text-sm text-slate-200">
          Bộ số của bạn: <strong>{{ selectedNumbers.map(numberLabel).join(', ') || '-' }}</strong>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"
            :disabled="isSubmitting || selectedNumbers.length !== 10"
            @click="submitNumbers"
          >
            {{ isSubmitting ? 'Đang lưu...' : 'Xác nhận bộ số' }}
          </button>
          <button type="button" class="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200" @click="selectedNumbers = []">Xóa nhanh</button>
        </div>

        <p v-if="submitMessage" class="text-sm text-emerald-400">{{ submitMessage }}</p>
        <p v-if="submitError" class="text-sm text-rose-400">{{ submitError }}</p>
      </div>

      <div class="space-y-4 rounded-3xl border border-slate-700 bg-slate-900/50 p-5">
        <h2 class="text-lg font-bold text-white">Bảng giải thưởng</h2>
        <div class="space-y-2 text-sm">
          <div v-for="rule in prizeRules" :key="rule.match" class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
            <span class="font-semibold text-amber-200">{{ rule.match }}</span>
            <span class="text-slate-200">{{ rule.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-2xl border border-dashed border-slate-600 bg-slate-900/40 p-10 text-center text-slate-300">
      Chưa có sự kiện Vietlot đang diễn ra.
    </div>

    <div class="rounded-3xl border border-slate-700 bg-slate-900/50 p-5">
      <h2 class="mb-4 text-lg font-bold text-white">Kết quả của bạn (10 kỳ gần nhất)</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-slate-300">
            <tr>
              <th class="px-3 py-2">Kỳ quay</th>
              <th class="px-3 py-2">Số đã chọn</th>
              <th class="px-3 py-2">Số trúng thưởng</th>
              <th class="px-3 py-2">Số trúng</th>
              <th class="px-3 py-2">Giải</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in recentResults" :key="row.id" class="border-t border-slate-800">
              <td class="px-3 py-2 text-slate-300">{{ new Date(row.roundStart).toLocaleString() }}</td>
              <td class="px-3 py-2 text-slate-200">{{ row.pickedNumbers.join(', ') }}</td>
              <td class="px-3 py-2 font-semibold text-amber-200">{{ row.winningNumbers.join(', ') }}</td>
              <td class="px-3 py-2 text-slate-200">{{ row.matchCount }}</td>
              <td class="px-3 py-2 text-slate-200">{{ row.prizeLabel }}</td>
            </tr>
            <tr v-if="!recentResults.length">
              <td colspan="5" class="px-3 py-6 text-center text-slate-400">Chưa có kết quả.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
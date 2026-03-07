<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const selectedNumbers = ref<number[]>([])
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitError = ref('')
const now = ref(Date.now())

const { data: vietlotState, refresh } = await useFetch<any>('/api/vietlot/state', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const eventData = computed(() => vietlotState.value?.event || null)
const currentRound = computed(() => vietlotState.value?.currentRound || null)
const myCurrentTicket = computed(() => vietlotState.value?.myCurrentTicket || null)
const recentResults = computed(() => vietlotState.value?.recentResults || [])
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
    submitError.value = 'Ban chi duoc chon toi da 10 so.'
    return
  }

  selectedNumbers.value.push(value)
  selectedNumbers.value.sort((a, b) => a - b)
}

const submitNumbers = async () => {
  submitMessage.value = ''
  submitError.value = ''

  if (!eventData.value?.id) {
    submitError.value = 'Khong tim thay su kien Vietlot dang hoat dong.'
    return
  }

  if (selectedNumbers.value.length !== 10) {
    submitError.value = 'Ban phai chon dung 10 so.'
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

    submitMessage.value = 'Da luu bo so cua ban cho ky quay hien tai.'
    await refresh()
  }
  catch (error: any) {
    submitError.value = error?.data?.statusMessage || 'Khong the luu bo so.'
  }
  finally {
    isSubmitting.value = false
  }
}

const prizeRules = computed(() => {
  if (!prizeConfig.value) return []
  return [
    { match: '10 so', label: prizeConfig.value.specialPrize },
    { match: '9 so', label: prizeConfig.value.firstPrize },
    { match: '8 so', label: prizeConfig.value.secondPrize },
    { match: '7 so', label: prizeConfig.value.thirdPrize },
    { match: '6 so', label: prizeConfig.value.fourthPrize },
    { match: '5 so', label: prizeConfig.value.fifthPrize },
    { match: '0 so', label: prizeConfig.value.consolationPrize },
    { match: '1-4 so', label: 'Khong co giai' }
  ]
})

onMounted(() => {
  const timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)

  const puller = window.setInterval(async () => {
    await refresh()
  }, 10000)

  onBeforeUnmount(() => {
    window.clearInterval(timer)
    window.clearInterval(puller)
  })
})
</script>

<template>
  <section class="space-y-8 pb-12">
    <div class="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/10 p-6 shadow-xl shadow-amber-900/10">
      <h1 class="text-3xl font-black text-white">Vietlot</h1>
      <p class="mt-2 text-sm text-amber-100/90">{{ eventData?.title || 'Su kien quay so 5 phut/lần' }}</p>
      <p class="mt-4 text-sm text-slate-200">Moi 5 phut he thong quay ngau nhien 10 so (01-99). Ban chon 10 so de du thuong.</p>
      <div class="mt-5 inline-flex items-center rounded-xl bg-slate-950/40 px-4 py-2 text-sm font-semibold text-amber-300 ring-1 ring-amber-300/30">
        Con lai den ky quay: {{ countdownLabel }}
      </div>
    </div>

    <div v-if="eventData" class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4 rounded-3xl border border-slate-700 bg-slate-900/50 p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white">Chon 10 so cua ban</h2>
          <span class="text-sm text-slate-400">Da chon: {{ selectedNumbers.length }}/10</span>
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
          Bo so cua ban: <strong>{{ selectedNumbers.map(numberLabel).join(', ') || '-' }}</strong>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"
            :disabled="isSubmitting || selectedNumbers.length !== 10"
            @click="submitNumbers"
          >
            {{ isSubmitting ? 'Dang luu...' : 'Xac nhan bo so' }}
          </button>
          <button type="button" class="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200" @click="selectedNumbers = []">Xoa nhanh</button>
        </div>

        <p v-if="submitMessage" class="text-sm text-emerald-400">{{ submitMessage }}</p>
        <p v-if="submitError" class="text-sm text-rose-400">{{ submitError }}</p>
      </div>

      <div class="space-y-4 rounded-3xl border border-slate-700 bg-slate-900/50 p-5">
        <h2 class="text-lg font-bold text-white">Bang giai thuong</h2>
        <div class="space-y-2 text-sm">
          <div v-for="rule in prizeRules" :key="rule.match" class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
            <span class="font-semibold text-amber-200">{{ rule.match }}</span>
            <span class="text-slate-200">{{ rule.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-2xl border border-dashed border-slate-600 bg-slate-900/40 p-10 text-center text-slate-300">
      Chua co su kien Vietlot dang dien ra.
    </div>

    <div class="rounded-3xl border border-slate-700 bg-slate-900/50 p-5">
      <h2 class="mb-4 text-lg font-bold text-white">Ket qua cua ban (10 ky gan nhat)</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-slate-300">
            <tr>
              <th class="px-3 py-2">Ky quay</th>
              <th class="px-3 py-2">So da chon</th>
              <th class="px-3 py-2">So trung thuong</th>
              <th class="px-3 py-2">So trung</th>
              <th class="px-3 py-2">Giai</th>
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
              <td colspan="5" class="px-3 py-6 text-center text-slate-400">Chua co ket qua.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
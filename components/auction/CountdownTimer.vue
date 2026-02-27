<script setup lang="ts">
const props = defineProps<{
  startsAt: string
  durationMinutes: number
  status?: 'pending' | 'active' | 'completed' | string
}>()

const { t } = useAppI18n()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const start = computed(() => new Date(props.startsAt).getTime())
const end = computed(() => start.value + props.durationMinutes * 60 * 1000)
const totalDuration = computed(() => Math.max(end.value - start.value, 1))
const isCompletedByStatus = computed(() => props.status === 'completed')

const progressPercent = computed(() => {
  if (isCompletedByStatus.value) {
    return 0
  }

  if (now.value < start.value) {
    return 100
  }

  if (now.value >= end.value) {
    return 0
  }

  const elapsed = now.value - start.value
  const remaining = totalDuration.value - elapsed
  return Math.min(100, Math.max(0, (remaining / totalDuration.value) * 100))
})

const text = computed(() => {
  if (isCompletedByStatus.value) {
    return t('auction.countdownEnded')
  }

  if (now.value < start.value) {
    const diff = start.value - now.value
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return t('auction.countdownStartsIn', { minutes, seconds })
  }

  if (now.value >= end.value) {
    return t('auction.countdownEnded')
  }

  const diff = end.value - now.value
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return t('auction.countdownRemaining', { minutes, seconds })
})

onMounted(() => {
  if (isCompletedByStatus.value) {
    return
  }

  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

watch(isCompletedByStatus, (completed) => {
  if (completed && timer) {
    clearInterval(timer)
    timer = null
    return
  }

  if (!completed && !timer) {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 text-sm">
    <div class="mb-2 font-medium text-slate-300">
      {{ text }}
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        class="progress-shimmer h-full rounded-full bg-primary-500 transition-all duration-1000 ease-linear"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
  </div>
</template>

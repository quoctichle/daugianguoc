<script setup lang="ts">
const props = defineProps<{
  maxBidsPerUser: number
  myBidCount: number
}>()

const { t } = useAppI18n()

const emit = defineEmits<{
  submit: [amount: number]
}>()

const amount = ref<number | null>(null)
const disabled = computed(() => props.myBidCount >= props.maxBidsPerUser)

const onSubmit = () => {
  if (!amount.value || amount.value <= 0) return
  emit('submit', Math.floor(amount.value))
  amount.value = null
}
</script>

<template>
  <div class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
    <p class="mb-2 text-sm text-slate-400">
      {{ t('auction.usedTurns', { used: myBidCount, max: maxBidsPerUser }) }}
    </p>
    <form class="flex flex-wrap gap-2" @submit.prevent="onSubmit">
      <input
        v-model.number="amount"
        type="number"
        min="1"
        class="w-44 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:ring-primary-500"
        :placeholder="t('auction.bidPlaceholder')"
        :disabled="disabled"
      >
      <button
        type="submit"
        :disabled="disabled"
        class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600"
      >
        {{ t('auction.placeBid') }}
      </button>
    </form>
  </div>
</template>

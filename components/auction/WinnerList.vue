<script setup lang="ts">
defineProps<{
  status: string
  players: Array<{
    userId: string
    name: string
    email: string
    amount: number | null
    isWinner: boolean
    rank: number | null
  }>
}>()

const { t } = useAppI18n()

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) {
    return email
  }

  const chars = Array.from(localPart)
  const prefix = chars.slice(0, 2).join('')
  const suffix = chars.length > 2 ? chars[chars.length - 1] : ''
  const starCount = Math.max(8, chars.length - 3)

  return `${prefix}${'*'.repeat(starCount)}${suffix}@${domain}`
}

const formatAmount = (amount: number | null) => {
  if (amount === null) {
    return '******'
  }

  return `¥ ${amount.toLocaleString('ja-JP')}`
}
</script>

<template>
  <aside class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-base font-semibold text-white">{{ t('auction.playersTitle') }}</h3>
      <span class="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
        {{ t('auction.playersCount', { count: players.length }) }}
      </span>
    </div>

    <p v-if="status !== 'completed'" class="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400 border border-amber-500/20">
      {{ t('auction.hidePriceHint') }}
    </p>

    <ul v-if="players.length" class="space-y-2">
      <li
        v-for="(player, index) in players"
        :key="player.userId"
        class="rounded-lg border px-3 py-2"
        :class="player.isWinner && status === 'completed' ? 'border-green-500/30 bg-green-500/10' : 'border-slate-700 bg-slate-800/50'"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-200">
              <span v-if="status === 'completed' && player.isWinner">#{{ player.rank }} - </span>
              <span v-else>#{{ index + 1 }} - </span>
              {{ maskEmail(player.email) }}
            </p>
            <p class="mt-1 text-xs text-slate-400">
              {{ status === 'completed' && player.isWinner ? t('auction.winner') : t('auction.player') }}
            </p>
          </div>
          <p class="text-sm font-semibold text-primary-400">
            {{ formatAmount(player.amount) }}
          </p>
        </div>
      </li>
    </ul>
    <p v-else class="text-sm text-slate-400">{{ t('auction.noParticipants') }}</p>

    <p class="mt-3 text-xs text-slate-500">
      {{ status === 'completed' ? t('auction.winnerFirstHint') : t('auction.revealAfterEnd') }}
    </p>
  </aside>
</template>

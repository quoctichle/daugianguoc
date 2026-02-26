<script setup lang="ts">
defineProps<{
  payload: {
    product: any
    amountStats: Array<{ amount: number, count: number }>
    uniqueAmounts: Array<{ amount: number, count: number }>
    bidsWithWinnerInfo: Array<{
      id: string
      amount: number
      createdAt: string
      winnerRank: number | null
      customerId: string | null
      user: {
        name: string
        email: string
      }
    }>
    summary: {
      totalBids: number
      uniqueBidCount: number
      minBid: number | null
      maxBid: number | null
    }
  }
}>()

const { t } = useAppI18n()

const formatYen = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) {
    return '-'
  }

  return `¥ ${amount.toLocaleString('ja-JP')}`
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border p-4">
      <h2 class="text-lg font-semibold">{{ payload.product.name }}</h2>
      <p class="mt-2 text-sm text-slate-700">{{ payload.product.description }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
        <div class="rounded border p-2">{{ t('adminAuctionCard.totalBids', { count: payload.summary.totalBids }) }}</div>
        <div class="rounded border p-2">{{ t('adminAuctionCard.uniqueBids', { count: payload.summary.uniqueBidCount }) }}</div>
        <div class="rounded border p-2">{{ t('adminAuctionCard.minBid', { value: formatYen(payload.summary.minBid) }) }}</div>
        <div class="rounded border p-2">{{ t('adminAuctionCard.maxBid', { value: formatYen(payload.summary.maxBid) }) }}</div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border p-4">
        <h3 class="mb-3 font-semibold">{{ t('adminAuctionCard.amountStats') }}</h3>
        <ul class="space-y-2 text-sm">
          <li v-for="item in payload.amountStats" :key="item.amount" class="flex justify-between rounded border px-3 py-2">
            <span>{{ formatYen(item.amount) }}</span>
            <span>{{ t('adminAuctionCard.times', { count: item.count }) }}</span>
          </li>
        </ul>
      </div>

      <div class="rounded-xl border p-4">
        <h3 class="mb-3 font-semibold">{{ t('adminAuctionCard.uniqueAmountList') }}</h3>
        <ul class="space-y-2 text-sm">
          <li v-for="item in payload.uniqueAmounts" :key="item.amount" class="rounded border px-3 py-2">
            {{ formatYen(item.amount) }}
          </li>
          <li v-if="payload.uniqueAmounts.length === 0" class="text-slate-500">{{ t('adminAuctionCard.noUnique') }}</li>
        </ul>
      </div>
    </div>

    <div class="rounded-xl border p-4">
      <h3 class="mb-3 font-semibold">{{ t('adminAuctionCard.winnerList') }}</h3>
      <ul class="space-y-2 text-sm">
        <li v-for="winner in payload.product.winners" :key="winner.id" class="rounded border px-3 py-2">
          #{{ winner.rank }} - {{ winner.user.name }} - {{ winner.user.email }} - {{ formatYen(winner.amount) }}
        </li>
        <li v-if="payload.product.winners.length === 0" class="text-slate-500">{{ t('adminAuctionCard.noWinner') }}</li>
      </ul>
    </div>

    <div class="rounded-xl border p-4">
      <h3 class="mb-3 font-semibold">{{ t('adminAuctionCard.allBids') }}</h3>
      <div class="max-h-80 overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left">
            <tr>
              <th class="px-3 py-2">#</th>
              <th class="px-3 py-2">{{ t('adminAuctionCard.user') }}</th>
              <th class="px-3 py-2">{{ t('auth.email') }}</th>
              <th v-if="payload.product.isUsedProduct" class="px-3 py-2">{{ t('adminAuctionCard.customerId') }}</th>
              <th class="px-3 py-2">{{ t('adminAuctionCard.price') }}</th>
              <th class="px-3 py-2">{{ t('adminAuctionCard.time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in payload.bidsWithWinnerInfo" :key="bid.id" class="border-t">
              <td class="px-3 py-2">
                <span v-if="bid.winnerRank" class="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">#{{ bid.winnerRank }}</span>
                <span v-else>-</span>
              </td>
              <td class="px-3 py-2">{{ bid.user.name }}</td>
              <td class="px-3 py-2">{{ bid.user.email }}</td>
              <td v-if="payload.product.isUsedProduct" class="px-3 py-2">{{ bid.customerId || '-' }}</td>
              <td class="px-3 py-2">{{ formatYen(bid.amount) }}</td>
              <td class="px-3 py-2">{{ new Date(bid.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

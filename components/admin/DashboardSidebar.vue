<script setup lang="ts">
const links = [
  { label: 'Cấu hình đấu giá', to: '/admin/config' },
  { label: 'Thông tin chi tiết đấu giá', to: '/admin/auctions' }
]

const route = useRoute()
</script>

<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold">Admin Dashboard</h2>
    <ul class="space-y-2">
      <li v-for="item in links" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="block rounded-lg px-3 py-2 text-sm"
          :class="route.path.startsWith(item.to) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'"
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

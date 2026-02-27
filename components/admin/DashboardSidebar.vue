<script setup lang="ts">
const sections = [
  {
    title: 'Quản lý nội dung',
    links: [
      { label: 'Quản lý sự kiện', to: '/admin/events' },
      { label: 'Quản lý sản phẩm', to: '/admin/featured-products' }
    ]
  },
  {
    title: 'Sự kiện Đấu giá ngược',
    links: [
      { label: 'Cấu hình đấu giá', to: '/admin/config' },
      { label: 'Thông tin chi tiết đấu giá', to: '/admin/auctions' }
    ]
  }
]

const route = useRoute()
</script>

<template>
  <div>
    <h2 class="mb-6 text-xl font-bold text-slate-900">Admin Dashboard</h2>
    <div class="space-y-6">
      <div v-for="section in sections" :key="section.title">
        <h3 class="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">{{ section.title }}</h3>
        <ul class="space-y-1">
          <li v-for="item in section.links" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              :class="route.path.startsWith(item.to) ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

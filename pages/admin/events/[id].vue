<script setup lang="ts">
import ProductForm from '~/components/admin/ProductForm.vue'
import ProductTable from '~/components/admin/ProductTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const route = useRoute()
const { t } = useAppI18n()
const eventId = computed(() => route.params.id as string)
const activeTab = ref<'config' | 'detail'>('config')

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const { data: eventData, refresh: refreshEvent } = await useFetch<any>(() => `/api/admin/events/${eventId.value}`, {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined,
  watch: [eventId]
})

const eventForm = reactive({
  title: '',
  description: '',
  format: 'REVERSE_AUCTION',
  imageUrl: '',
  link: '/auctions',
  startsAt: '',
  endsAt: ''
})

watch(eventData, (value) => {
  if (!value) return

  eventForm.title = value.title || ''
  eventForm.description = value.description || ''
  eventForm.format = value.format || 'REVERSE_AUCTION'
  eventForm.imageUrl = value.imageUrl || ''
  eventForm.link = value.link || '/auctions'
  eventForm.startsAt = toDateTimeLocal(value.startsAt)
  eventForm.endsAt = toDateTimeLocal(value.endsAt)
}, { immediate: true })

const eventMessage = ref('')
const eventError = ref('')
const ruleInput = ref('')
const ruleMessage = ref('')
const productMessage = ref('')
const productError = ref('')

const { data: ruleData, refresh: refreshRule } = await useFetch<{ content: string }>('/api/admin/rules', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

watch(ruleData, (value) => {
  ruleInput.value = value?.content || ''
}, { immediate: true })

const { data: productsData, refresh: refreshProducts } = await useFetch<any[]>(() => `/api/admin/products?eventId=${eventId.value}`, {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined,
  watch: [eventId]
})

const { data: auctionsData, refresh: refreshAuctions } = await useFetch<any[]>(() => `/api/admin/auctions?eventId=${eventId.value}`, {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined,
  watch: [eventId]
})

const saveEventInfo = async () => {
  eventMessage.value = ''
  eventError.value = ''

  try {
    await $fetch(`/api/admin/events/${eventId.value}`, {
      method: 'PUT',
      body: {
        title: eventForm.title,
        description: eventForm.description,
        format: 'REVERSE_AUCTION',
        imageUrl: eventForm.imageUrl,
        link: '/auctions',
        startsAt: eventForm.startsAt,
        endsAt: eventForm.endsAt
      }
    })

    eventMessage.value = 'Đã cập nhật cấu hình sự kiện.'
    await refreshEvent()
  }
  catch (error: any) {
    eventError.value = error?.data?.statusMessage || 'Không thể cập nhật sự kiện.'
  }
}

const saveRule = async () => {
  await $fetch('/api/admin/rules', {
    method: 'POST',
    body: {
      content: ruleInput.value
    }
  })
  ruleMessage.value = t('admin.rulesSaved')
  await refreshRule()
}

const onProductCreated = async () => {
  productMessage.value = ''
  productError.value = ''
  await Promise.all([refreshProducts(), refreshAuctions()])
}

const onProductDeleted = async (id: string) => {
  productMessage.value = ''
  productError.value = ''

  const confirmed = window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')
  if (!confirmed) {
    return
  }

  try {
    await $fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    productMessage.value = 'Đã xóa sản phẩm.'
    await Promise.all([refreshProducts(), refreshAuctions()])
  }
  catch (error: any) {
    productError.value = error?.data?.statusMessage || 'Không thể xóa sản phẩm.'
  }
}

const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await $fetch<{ imageUrl: string }>('/api/products/upload', {
      method: 'POST',
      body: formData
    })
    eventForm.imageUrl = res.imageUrl
  }
  catch {
    eventError.value = 'Lỗi upload ảnh sự kiện.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Quản lý sự kiện: {{ eventData?.title || '...' }}</h1>
        <p class="mt-1 text-sm text-slate-500">ID: {{ eventData?.eventId || '-' }} · Link: /auctions</p>
      </div>
      <NuxtLink to="/admin/events" class="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Quay lại danh sách sự kiện</NuxtLink>
    </div>

    <div class="flex gap-2 rounded-xl bg-slate-100 p-1">
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === 'config' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="activeTab = 'config'"
      >
        Cấu hình đấu giá
      </button>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === 'detail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="activeTab = 'detail'"
      >
        Thông tin chi tiết đấu giá
      </button>
    </div>

    <div v-if="activeTab === 'config'" class="space-y-6">
      <div class="rounded-xl border p-4">
        <h2 class="mb-4 text-lg font-semibold">Thông tin sự kiện</h2>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">ID</label>
            <input :value="eventData?.eventId || ''" type="text" readonly class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600">
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Hình thức</label>
            <select v-model="eventForm.format" disabled class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600">
              <option value="REVERSE_AUCTION">Đấu giá ngược</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Tiêu đề</label>
            <input v-model="eventForm.title" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2">
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea v-model="eventForm.description" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Thời gian bắt đầu</label>
            <input v-model="eventForm.startsAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2">
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Thời gian kết thúc</label>
            <input v-model="eventForm.endsAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2">
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Ảnh sự kiện</label>
            <input type="file" accept="image/*" class="w-full text-sm" @change="handleImageUpload">
            <img v-if="eventForm.imageUrl" :src="eventForm.imageUrl" class="mt-2 h-40 w-full rounded-lg object-cover">
          </div>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" @click="saveEventInfo">Lưu thông tin sự kiện</button>
          <span v-if="eventMessage" class="text-sm text-emerald-600">{{ eventMessage }}</span>
          <span v-if="eventError" class="text-sm text-red-600">{{ eventError }}</span>
        </div>
      </div>

      <div class="rounded-xl border p-4">
        <h2 class="mb-3 text-lg font-semibold">{{ t('admin.rulesTitle') }}</h2>
        <textarea
          v-model="ruleInput"
          rows="6"
          class="w-full rounded-lg border px-3 py-2 text-sm"
          :placeholder="t('admin.rulesPlaceholder')"
        />
        <div class="mt-3 flex items-center gap-3">
          <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" @click="saveRule">{{ t('admin.saveRules') }}</button>
          <span v-if="ruleMessage" class="text-sm text-emerald-600">{{ ruleMessage }}</span>
        </div>
      </div>

      <ProductForm :fixed-event-id="eventId" @created="onProductCreated" />

      <ProductTable :products="productsData || []" @deleted="onProductDeleted" />

      <p v-if="productMessage" class="text-sm text-emerald-600">{{ productMessage }}</p>
      <p v-if="productError" class="text-sm text-red-600">{{ productError }}</p>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ t('admin.auctionsTitle') }}</h2>
        <button class="rounded-lg border px-3 py-2 text-sm" @click="refreshAuctions">{{ t('common.refresh') }}</button>
      </div>

      <div class="overflow-x-auto rounded-xl border">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left">
            <tr>
              <th class="px-3 py-2">{{ t('admin.product') }}</th>
              <th class="px-3 py-2">{{ t('admin.status') }}</th>
              <th class="px-3 py-2">{{ t('admin.totalBids') }}</th>
              <th class="px-3 py-2">{{ t('admin.participants') }}</th>
              <th class="px-3 py-2">{{ t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in auctionsData || []" :key="item.id" class="border-t">
              <td class="px-3 py-2">#{{ item.productCode || '-' }} - {{ item.name }}</td>
              <td class="px-3 py-2">
                <span class="rounded bg-slate-100 px-2 py-1 text-xs uppercase">{{ item.status }}</span>
              </td>
              <td class="px-3 py-2">{{ item.totalBids }}</td>
              <td class="px-3 py-2">{{ item.totalParticipants }}</td>
              <td class="px-3 py-2">
                <NuxtLink :to="`/admin/auctions/${item.id}`" class="rounded border px-3 py-1 text-xs">{{ t('admin.viewDetails') }}</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

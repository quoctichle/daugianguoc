<script setup lang="ts">
import ProductForm from '~/components/admin/ProductForm.vue'
import ProductTable from '~/components/admin/ProductTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

type EventFormat = 'REVERSE_AUCTION' | 'VIETLOT'

const route = useRoute()
const { t } = useAppI18n()
const eventId = computed(() => route.params.id as string)
const activeTab = ref<'config' | 'detail'>('config')

const formatLabel = (format: EventFormat) => format === 'VIETLOT' ? 'Vietlot' : 'Đấu giá ngược'

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toNumberList = (value: unknown) => {
  if (!Array.isArray(value)) return '-'
  return value.map(item => `${item}`.padStart(2, '0')).join(', ')
}

const toNumberArray = (value: unknown) => {
  if (!Array.isArray(value)) return [] as string[]
  return value.map(item => `${item}`.padStart(2, '0'))
}

const { data: eventData, refresh: refreshEvent } = await useFetch<any>(() => `/api/admin/events/${eventId.value}`, {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined,
  watch: [eventId]
})

const eventForm = reactive({
  title: '',
  description: '',
  format: 'REVERSE_AUCTION' as EventFormat,
  imageUrl: '',
  link: '/auctions',
  startsAt: '',
  endsAt: '',
  vietlotPrize: {
    specialPrize: '',
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
    fourthPrize: '',
    fifthPrize: '',
    consolationPrize: ''
  }
})

watch(eventData, (value) => {
  if (!value) return

  const format: EventFormat = value.format === 'VIETLOT' ? 'VIETLOT' : 'REVERSE_AUCTION'
  eventForm.title = value.title || ''
  eventForm.description = value.description || ''
  eventForm.format = format
  eventForm.imageUrl = value.imageUrl || ''
  eventForm.link = value.link || (format === 'VIETLOT' ? '/vietlot' : '/auctions')
  eventForm.startsAt = toDateTimeLocal(value.startsAt)
  eventForm.endsAt = toDateTimeLocal(value.endsAt)

  eventForm.vietlotPrize.specialPrize = value.vietlotConfig?.specialPrize || ''
  eventForm.vietlotPrize.firstPrize = value.vietlotConfig?.firstPrize || ''
  eventForm.vietlotPrize.secondPrize = value.vietlotConfig?.secondPrize || ''
  eventForm.vietlotPrize.thirdPrize = value.vietlotConfig?.thirdPrize || ''
  eventForm.vietlotPrize.fourthPrize = value.vietlotConfig?.fourthPrize || ''
  eventForm.vietlotPrize.fifthPrize = value.vietlotConfig?.fifthPrize || ''
  eventForm.vietlotPrize.consolationPrize = value.vietlotConfig?.consolationPrize || ''
}, { immediate: true })

watch(() => eventForm.format, (value) => {
  eventForm.link = value === 'VIETLOT' ? '/vietlot' : '/auctions'
})

const isVietlot = computed(() => eventForm.format === 'VIETLOT')

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

const { data: vietlotResults, refresh: refreshVietlotResults } = await useFetch<any[]>(() => `/api/admin/vietlot/results?eventId=${eventId.value}`, {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined,
  watch: [eventId]
})

const selectedVietlotDrawId = ref('')
const vietlotDetailLoading = ref(false)
const vietlotDetailError = ref('')
const vietlotDetail = ref<any | null>(null)
const detailWinningSet = computed(() => new Set(toNumberArray(vietlotDetail.value?.draw?.winningNumbers)))

const loadVietlotDrawDetail = async (drawId: string) => {
  selectedVietlotDrawId.value = drawId
  vietlotDetailLoading.value = true
  vietlotDetailError.value = ''

  try {
    const result = await $fetch<any>(`/api/admin/vietlot/results/${drawId}?eventId=${eventId.value}`)
    vietlotDetail.value = result
  }
  catch (error: any) {
    vietlotDetailError.value = error?.data?.statusMessage || 'Không thể tải chi tiết lượt quay.'
    vietlotDetail.value = null
  }
  finally {
    vietlotDetailLoading.value = false
  }
}

const isMatchedNumber = (num: string) => {
  return detailWinningSet.value.has(num)
}

watch(vietlotResults, (rows) => {
  if (!rows?.length) {
    selectedVietlotDrawId.value = ''
    vietlotDetail.value = null
    return
  }

  if (!selectedVietlotDrawId.value) {
    loadVietlotDrawDetail(rows[0].id)
    return
  }

  if (!rows.some(row => row.id === selectedVietlotDrawId.value)) {
    loadVietlotDrawDetail(rows[0].id)
  }
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
        format: eventForm.format,
        imageUrl: eventForm.imageUrl,
        link: eventForm.link,
        startsAt: eventForm.startsAt,
        endsAt: eventForm.endsAt,
        vietlotPrize: isVietlot.value ? eventForm.vietlotPrize : undefined
      }
    })

    eventMessage.value = 'Đã cập nhật cấu hình sự kiện.'
    await Promise.all([refreshEvent(), refreshVietlotResults()])
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
        <p class="mt-1 text-sm text-slate-500">ID: {{ eventData?.eventId || '-' }} · Link: {{ eventForm.link }}</p>
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
        Cấu hình {{ isVietlot ? 'Vietlot' : 'đấu giá' }}
      </button>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === 'detail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="activeTab = 'detail'"
      >
        {{ isVietlot ? 'Kết quả quay số' : 'Thông tin chi tiết đấu giá' }}
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
            <input :value="formatLabel(eventForm.format)" type="text" readonly class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600">
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

        <div v-if="isVietlot" class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 md:grid-cols-2">
          <h3 class="md:col-span-2 text-sm font-semibold text-amber-900">Cấu hình giải thưởng Vietlot</h3>
          <input v-model="eventForm.vietlotPrize.specialPrize" type="text" placeholder="Giải đặc biệt" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.firstPrize" type="text" placeholder="Giải nhất" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.secondPrize" type="text" placeholder="Giải nhì" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.thirdPrize" type="text" placeholder="Giải ba" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.fourthPrize" type="text" placeholder="Giải tư" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.fifthPrize" type="text" placeholder="Giải năm" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.consolationPrize" type="text" placeholder="Giải khuyến khích" class="md:col-span-2 rounded-lg border border-amber-300 px-3 py-2 text-sm">
        </div>

        <div class="mt-4 flex items-center gap-3">
          <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" @click="saveEventInfo">Lưu thông tin sự kiện</button>
          <span v-if="eventMessage" class="text-sm text-emerald-600">{{ eventMessage }}</span>
          <span v-if="eventError" class="text-sm text-red-600">{{ eventError }}</span>
        </div>
      </div>

      <template v-if="!isVietlot">
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
      </template>
    </div>

    <div v-else class="space-y-4">
      <template v-if="!isVietlot">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ t('admin.auctionsTitle') }}</h2>
          <button class="rounded-lg border px-3 py-2 text-sm" @click="() => refreshAuctions()">{{ t('common.refresh') }}</button>
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
      </template>

      <template v-else>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Kết quả Vietlot gần đây</h2>
          <button class="rounded-lg border px-3 py-2 text-sm" @click="() => refreshVietlotResults()">Tải lại</button>
        </div>

        <div class="overflow-x-auto rounded-xl border bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left">
              <tr>
                <th class="px-3 py-2">Khung giờ</th>
                <th class="px-3 py-2">Bộ số trúng thưởng</th>
                <th class="px-3 py-2">Tổng vé</th>
                <th class="px-3 py-2">Thống kê giải</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in vietlotResults || []"
                :key="row.id"
                class="cursor-pointer border-t align-top transition-colors hover:bg-slate-50"
                :class="selectedVietlotDrawId === row.id ? 'bg-amber-50/60' : ''"
                @click="loadVietlotDrawDetail(row.id)"
              >
                <td class="px-3 py-2">{{ new Date(row.roundStart).toLocaleString() }}</td>
                <td class="px-3 py-2 font-medium">{{ toNumberList(row.winningNumbers) }}</td>
                <td class="px-3 py-2">{{ row.totalTickets }}</td>
                <td class="px-3 py-2 text-xs leading-6">
                  DB: {{ row.stats.SPECIAL }} | N: {{ row.stats.FIRST }} | Nhi: {{ row.stats.SECOND }} | Ba: {{ row.stats.THIRD }}<br>
                  Tư: {{ row.stats.FOURTH }} | Năm: {{ row.stats.FIFTH }} | KK: {{ row.stats.CONSOLATION }} | Không trúng: {{ row.stats.NONE }}
                </td>
              </tr>
              <tr v-if="!(vietlotResults && vietlotResults.length)">
                <td colspan="4" class="px-3 py-6 text-center text-slate-500">Chưa có kết quả quay số.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-xl border bg-white p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-base font-semibold text-slate-900">Chi tiết người chơi theo lượt quay</h3>
            <p v-if="vietlotDetail?.draw" class="text-sm text-slate-500">
              Khung giờ: {{ new Date(vietlotDetail.draw.roundStart).toLocaleString() }}
            </p>
          </div>

          <p v-if="vietlotDetail?.draw" class="mt-2 text-sm text-slate-700">
            Bộ số trúng thưởng:
            <span class="font-semibold text-amber-700">{{ toNumberList(vietlotDetail.draw.winningNumbers) }}</span>
          </p>

          <p v-if="vietlotDetailLoading" class="mt-3 text-sm text-slate-500">Đang tải chi tiết lượt quay...</p>
          <p v-else-if="vietlotDetailError" class="mt-3 text-sm text-red-600">{{ vietlotDetailError }}</p>

          <div v-else class="mt-3 overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-left">
                <tr>
                  <th class="px-3 py-2">Email</th>
                  <th class="px-3 py-2">Họ tên</th>
                  <th class="px-3 py-2">Bộ số dự thưởng</th>
                  <th class="px-3 py-2">Số trúng</th>
                  <th class="px-3 py-2">Giải</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in vietlotDetail?.tickets || []" :key="ticket.id" class="border-t align-top">
                  <td class="px-3 py-2">{{ ticket.email || '-' }}</td>
                  <td class="px-3 py-2">{{ ticket.name || '-' }}</td>
                  <td class="px-3 py-2">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="num in ticket.pickedNumbers"
                        :key="`${ticket.id}-${num}`"
                        class="rounded border px-2 py-0.5 text-xs font-semibold"
                        :class="isMatchedNumber(num) ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-700'"
                      >
                        {{ num }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2 font-semibold text-red-600">{{ ticket.matchCount }}</td>
                  <td class="px-3 py-2">{{ ticket.prizeLabel }}</td>
                </tr>
                <tr v-if="!(vietlotDetail?.tickets && vietlotDetail.tickets.length)">
                  <td colspan="5" class="px-3 py-6 text-center text-slate-500">Chưa có người chơi ở lượt quay này.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
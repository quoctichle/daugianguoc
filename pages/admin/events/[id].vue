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

const formatLabel = (format: EventFormat) => format === 'VIETLOT' ? 'Vietlot' : 'Dau gia nguoc'

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

    eventMessage.value = 'Da cap nhat cau hinh su kien.'
    await Promise.all([refreshEvent(), refreshVietlotResults()])
  }
  catch (error: any) {
    eventError.value = error?.data?.statusMessage || 'Khong the cap nhat su kien.'
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

  const confirmed = window.confirm('Ban co chac muon xoa san pham nay khong?')
  if (!confirmed) {
    return
  }

  try {
    await $fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    productMessage.value = 'Da xoa san pham.'
    await Promise.all([refreshProducts(), refreshAuctions()])
  }
  catch (error: any) {
    productError.value = error?.data?.statusMessage || 'Khong the xoa san pham.'
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
    eventError.value = 'Loi upload anh su kien.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Quan ly su kien: {{ eventData?.title || '...' }}</h1>
        <p class="mt-1 text-sm text-slate-500">ID: {{ eventData?.eventId || '-' }} · Link: {{ eventForm.link }}</p>
      </div>
      <NuxtLink to="/admin/events" class="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Quay lai danh sach su kien</NuxtLink>
    </div>

    <div class="flex gap-2 rounded-xl bg-slate-100 p-1">
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === 'config' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="activeTab = 'config'"
      >
        Cau hinh {{ isVietlot ? 'Vietlot' : 'dau gia' }}
      </button>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === 'detail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="activeTab = 'detail'"
      >
        {{ isVietlot ? 'Ket qua quay so' : 'Thong tin chi tiet dau gia' }}
      </button>
    </div>

    <div v-if="activeTab === 'config'" class="space-y-6">
      <div class="rounded-xl border p-4">
        <h2 class="mb-4 text-lg font-semibold">Thong tin su kien</h2>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">ID</label>
            <input :value="eventData?.eventId || ''" type="text" readonly class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600">
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Hinh thuc</label>
            <input :value="formatLabel(eventForm.format)" type="text" readonly class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600">
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Tieu de</label>
            <input v-model="eventForm.title" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2">
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Mo ta</label>
            <textarea v-model="eventForm.description" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Thoi gian bat dau</label>
            <input v-model="eventForm.startsAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2">
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Thoi gian ket thuc</label>
            <input v-model="eventForm.endsAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2">
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">Anh su kien</label>
            <input type="file" accept="image/*" class="w-full text-sm" @change="handleImageUpload">
            <img v-if="eventForm.imageUrl" :src="eventForm.imageUrl" class="mt-2 h-40 w-full rounded-lg object-cover">
          </div>
        </div>

        <div v-if="isVietlot" class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 md:grid-cols-2">
          <h3 class="md:col-span-2 text-sm font-semibold text-amber-900">Cau hinh giai thuong Vietlot</h3>
          <input v-model="eventForm.vietlotPrize.specialPrize" type="text" placeholder="Giai dac biet" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.firstPrize" type="text" placeholder="Giai nhat" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.secondPrize" type="text" placeholder="Giai nhi" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.thirdPrize" type="text" placeholder="Giai ba" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.fourthPrize" type="text" placeholder="Giai tu" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.fifthPrize" type="text" placeholder="Giai nam" class="rounded-lg border border-amber-300 px-3 py-2 text-sm">
          <input v-model="eventForm.vietlotPrize.consolationPrize" type="text" placeholder="Giai khuyen khich" class="md:col-span-2 rounded-lg border border-amber-300 px-3 py-2 text-sm">
        </div>

        <div class="mt-4 flex items-center gap-3">
          <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" @click="saveEventInfo">Luu thong tin su kien</button>
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
          <h2 class="text-lg font-semibold">Ket qua Vietlot gan day</h2>
          <button class="rounded-lg border px-3 py-2 text-sm" @click="() => refreshVietlotResults()">Tai lai</button>
        </div>

        <div class="overflow-x-auto rounded-xl border bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left">
              <tr>
                <th class="px-3 py-2">Khung gio</th>
                <th class="px-3 py-2">Bo so trung thuong</th>
                <th class="px-3 py-2">Tong ve</th>
                <th class="px-3 py-2">Thong ke giai</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in vietlotResults || []" :key="row.id" class="border-t align-top">
                <td class="px-3 py-2">{{ new Date(row.roundStart).toLocaleString() }}</td>
                <td class="px-3 py-2 font-medium">{{ toNumberList(row.winningNumbers) }}</td>
                <td class="px-3 py-2">{{ row.totalTickets }}</td>
                <td class="px-3 py-2 text-xs leading-6">
                  DB: {{ row.stats.SPECIAL }} | N: {{ row.stats.FIRST }} | Nhi: {{ row.stats.SECOND }} | Ba: {{ row.stats.THIRD }}<br>
                  Tu: {{ row.stats.FOURTH }} | Nam: {{ row.stats.FIFTH }} | KK: {{ row.stats.CONSOLATION }} | Khong trung: {{ row.stats.NONE }}
                </td>
              </tr>
              <tr v-if="!(vietlotResults && vietlotResults.length)">
                <td colspan="4" class="px-3 py-6 text-center text-slate-500">Chua co ket qua quay so.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </section>
</template>
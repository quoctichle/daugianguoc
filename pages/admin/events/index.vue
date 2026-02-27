<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const { data: events, refresh } = await useFetch<any[]>('/api/admin/events', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const isEditing = ref(false)
const currentEvent = ref<any>({
  eventId: null,
  title: '',
  description: '',
  format: 'REVERSE_AUCTION',
  imageUrl: '',
  link: '/auctions',
  startsAt: '',
  endsAt: ''
})

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const nextEventId = computed(() => {
  const list = events.value || []
  if (!list.length) {
    return 1
  }

  return Math.max(...list.map(item => Number(item.eventId) || 0)) + 1
})

const getEventStatus = (item: any) => {
  const now = Date.now()
  const start = new Date(item.startsAt).getTime()
  const end = new Date(item.endsAt).getTime()

  if (!Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end) {
    return 'ongoing'
  }

  if (!Number.isNaN(start) && now < start) {
    return 'upcoming'
  }

  return 'ended'
}

const openEdit = (event?: any) => {
  if (event) {
    currentEvent.value = {
      ...event,
      format: event.format || 'REVERSE_AUCTION',
      link: event.link || '/auctions',
      startsAt: toDateTimeLocal(event.startsAt),
      endsAt: toDateTimeLocal(event.endsAt)
    }
  }
  else {
    currentEvent.value = {
      eventId: nextEventId.value,
      title: '',
      description: '',
      format: 'REVERSE_AUCTION',
      imageUrl: '',
      link: '/auctions',
      startsAt: '',
      endsAt: ''
    }
  }
  isEditing.value = true
}

const closeEdit = () => {
  isEditing.value = false
}

const saveEvent = async () => {
  try {
    if (currentEvent.value.id) {
      await $fetch(`/api/admin/events/${currentEvent.value.id}`, {
        method: 'PUT',
        body: currentEvent.value
      })
    }
    else {
      await $fetch('/api/admin/events', {
        method: 'POST',
        body: currentEvent.value
      })
    }
    await refresh()
    closeEdit()
  }
  catch {
    alert('Có lỗi xảy ra khi lưu sự kiện')
  }
}

const deleteEvent = async (id: string) => {
  if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return

  try {
    await $fetch(`/api/admin/events/${id}`, {
      method: 'DELETE'
    })
    await refresh()
  }
  catch {
    alert('Có lỗi xảy ra khi xóa sự kiện')
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
    currentEvent.value.imageUrl = res.imageUrl
  }
  catch {
    alert('Lỗi upload ảnh')
  }
}

const goToEventManagement = (id: string) => {
  navigateTo(`/admin/events/${id}`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">Quản lý sự kiện</h1>
      <button
        @click="openEdit()"
        class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Thêm sự kiện mới
      </button>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="event in events" :key="event.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button type="button" class="w-full text-left" @click="goToEventManagement(event.id)">
          <div class="aspect-video w-full bg-slate-100">
            <img v-if="event.imageUrl" :src="event.imageUrl" class="h-full w-full object-cover" >
            <div v-else class="flex h-full items-center justify-center text-slate-400">Chưa có ảnh</div>
          </div>
        </button>

        <div class="p-4">
          <div class="mb-2 flex items-center justify-between">
            <span class="rounded-full px-2 py-1 text-xs font-medium" :class="getEventStatus(event) === 'ongoing' ? 'bg-green-100 text-green-700' : getEventStatus(event) === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'">
              {{ getEventStatus(event) === 'ongoing' ? 'Đang diễn ra' : getEventStatus(event) === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc' }}
            </span>
            <span class="text-xs font-semibold text-slate-500">ID: {{ event.eventId }}</span>
          </div>

          <button type="button" class="line-clamp-2 text-left font-bold text-slate-900 hover:text-primary-700" @click="goToEventManagement(event.id)">{{ event.title }}</button>
          <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ event.description || 'Chưa có mô tả' }}</p>
          <p class="mt-2 text-xs text-slate-500">Hình thức: {{ event.format === 'REVERSE_AUCTION' ? 'Đấu giá ngược' : event.format }}</p>
          <p class="mt-1 text-xs text-slate-500">Bắt đầu: {{ new Date(event.startsAt).toLocaleString() }}</p>
          <p class="mt-1 text-xs text-slate-500">Kết thúc: {{ new Date(event.endsAt).toLocaleString() }}</p>

          <div class="mt-4 flex gap-2">
            <button @click.stop="openEdit(event)" class="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Sửa</button>
            <button @click.stop="deleteEvent(event.id)" class="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isEditing" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="mb-4 text-xl font-bold">{{ currentEvent.id ? 'Sửa sự kiện' : 'Thêm sự kiện' }}</h2>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">ID</label>
            <input :value="currentEvent.eventId || nextEventId" type="text" readonly class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600" >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Tiêu đề</label>
            <input v-model="currentEvent.title" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea v-model="currentEvent.description" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Hình thức</label>
            <select v-model="currentEvent.format" class="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="REVERSE_AUCTION">Đấu giá ngược</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Link sự kiện</label>
            <input v-model="currentEvent.link" type="text" readonly class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600" >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Thời gian bắt đầu</label>
            <input v-model="currentEvent.startsAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2" >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Thời gian kết thúc</label>
            <input v-model="currentEvent.endsAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2" >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Ảnh sự kiện</label>
            <input type="file" accept="image/*" @change="handleImageUpload" class="w-full text-sm" >
            <img v-if="currentEvent.imageUrl" :src="currentEvent.imageUrl" class="mt-2 h-32 w-full rounded-lg object-cover" >
          </div>

          <p class="text-xs text-slate-500">Sự kiện sẽ tự hiển thị ở trang user khi thời gian hiện tại nằm trong khoảng bắt đầu/kết thúc.</p>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeEdit" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Hủy</button>
          <button @click="saveEvent" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const { data: newsList, refresh } = await useFetch<any[]>('/api/admin/news', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

const isEditing = ref(false)
const currentNews = ref<any>({
  title: '',
  imageUrl: '',
  isActive: false,
  link: ''
})

const openEdit = (news?: any) => {
  if (news) {
    currentNews.value = { ...news }
  }
  else {
    currentNews.value = {
      title: '',
      imageUrl: '',
      isActive: false,
      link: ''
    }
  }
  isEditing.value = true
}

const closeEdit = () => {
  isEditing.value = false
}

const saveNews = async () => {
  try {
    if (currentNews.value.id) {
      await $fetch(`/api/admin/news/${currentNews.value.id}`, {
        method: 'PUT',
        body: currentNews.value
      })
    }
    else {
      await $fetch('/api/admin/news', {
        method: 'POST',
        body: currentNews.value
      })
    }

    await refresh()
    closeEdit()
  }
  catch {
    alert('Có lỗi xảy ra khi lưu tin tức')
  }
}

const deleteNews = async (id: string) => {
  if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) return

  try {
    await $fetch(`/api/admin/news/${id}`, {
      method: 'DELETE'
    })
    await refresh()
  }
  catch {
    alert('Có lỗi xảy ra khi xóa tin tức')
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
    currentNews.value.imageUrl = res.imageUrl
  }
  catch {
    alert('Lỗi upload ảnh')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">Quản lý tin tức</h1>
      <button
        @click="openEdit()"
        class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Thêm tin tức mới
      </button>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="news in newsList" :key="news.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="aspect-video w-full bg-slate-100">
          <img v-if="news.imageUrl" :src="news.imageUrl" class="h-full w-full object-cover" >
          <div v-else class="flex h-full items-center justify-center text-slate-400">Chưa có ảnh</div>
        </div>

        <div class="p-4">
          <div class="mb-2 flex items-center justify-between">
            <span class="rounded-full px-2 py-1 text-xs font-medium" :class="news.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'">
              {{ news.isActive ? 'Đang hiển thị' : 'Đã ẩn' }}
            </span>
          </div>

          <a :href="news.link || '#'" target="_blank" rel="noopener noreferrer" class="line-clamp-2 font-bold text-slate-900 hover:text-primary-700">{{ news.title }}</a>
          <p class="mt-1 line-clamp-1 text-sm text-slate-500">{{ news.link || 'Chưa có link' }}</p>

          <div class="mt-4 flex gap-2">
            <button @click="openEdit(news)" class="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Sửa</button>
            <button @click="deleteNews(news.id)" class="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isEditing" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="mb-4 text-xl font-bold">{{ currentNews.id ? 'Sửa tin tức' : 'Thêm tin tức' }}</h2>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Tiêu đề</label>
            <input v-model="currentNews.title" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Link bài viết</label>
            <input v-model="currentNews.link" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="https://..." >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Ảnh bài viết</label>
            <input type="file" accept="image/*" @change="handleImageUpload" class="w-full text-sm" >
            <img v-if="currentNews.imageUrl" :src="currentNews.imageUrl" class="mt-2 h-32 w-full rounded-lg object-cover" >
          </div>

          <div class="flex items-center gap-2">
            <input id="isNewsActive" v-model="currentNews.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary-600" >
            <label for="isNewsActive" class="text-sm font-medium text-slate-700">Hiển thị ở mục tin nổi bật</label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeEdit" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Hủy</button>
          <button @click="saveNews" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  created: []
}>()

const { t } = useAppI18n()

const form = reactive({
  name: '',
  isUsedProduct: false,
  startsAt: '',
  durationMinutes: 30,
  winnerCount: 1,
  maxBidsPerUser: 5,
  description: ''
})

const imageFile = ref<File | null>(null)
const message = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  imageFile.value = target.files?.[0] ?? null
}

const createProduct = async () => {
  submitting.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    let imageUrl = ''
    if (imageFile.value) {
      const fd = new FormData()
      fd.append('image', imageFile.value)
      const upload = await $fetch<{ imageUrl: string }>('/api/products/upload', {
        method: 'POST',
        body: fd
      })
      imageUrl = upload.imageUrl
    }

    await $fetch('/api/admin/products', {
      method: 'POST',
      body: {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        imageUrl
      }
    })

    form.name = ''
    form.isUsedProduct = false
    form.startsAt = ''
    form.durationMinutes = 30
    form.winnerCount = 1
    form.maxBidsPerUser = 5
    form.description = ''
    imageFile.value = null
    message.value = t('productForm.createSuccess')
    emit('created')
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || t('productForm.createFailed')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="rounded-xl border p-4">
    <h2 class="mb-4 text-lg font-semibold">{{ t('productForm.title') }}</h2>

    <form class="grid grid-cols-1 gap-3 md:grid-cols-2" @submit.prevent="createProduct">
      <label class="text-sm">
        <span class="mb-1 block">{{ t('productForm.image') }}</span>
        <input type="file" accept="image/*" class="w-full rounded-lg border px-3 py-2" @change="onFileChange">
      </label>

      <label class="text-sm">
        <span class="mb-1 block">{{ t('productForm.name') }}</span>
        <input v-model="form.name" required class="w-full rounded-lg border px-3 py-2">
      </label>

      <label class="text-sm md:col-span-2">
        <span class="mb-1 block">{{ t('productForm.usedProduct') }}</span>
        <div class="flex items-center gap-2 rounded-lg border px-3 py-2">
          <input id="isUsedProduct" v-model="form.isUsedProduct" type="checkbox" class="h-4 w-4">
          <label for="isUsedProduct" class="text-sm text-gray-700">
            {{ t('productForm.usedProductHint') }}
          </label>
        </div>
      </label>

      <label class="text-sm">
        <span class="mb-1 block">{{ t('productForm.startTime') }}</span>
        <input v-model="form.startsAt" type="datetime-local" required class="w-full rounded-lg border px-3 py-2">
      </label>

      <label class="text-sm">
        <span class="mb-1 block">{{ t('productForm.duration') }}</span>
        <input v-model.number="form.durationMinutes" type="number" min="1" required class="w-full rounded-lg border px-3 py-2">
      </label>

      <label class="text-sm">
        <span class="mb-1 block">{{ t('productForm.winners') }}</span>
        <input v-model.number="form.winnerCount" type="number" min="1" required class="w-full rounded-lg border px-3 py-2">
      </label>

      <label class="text-sm">
        <span class="mb-1 block">{{ t('productForm.maxBids') }}</span>
        <input v-model.number="form.maxBidsPerUser" type="number" min="1" required class="w-full rounded-lg border px-3 py-2">
      </label>

      <label class="text-sm md:col-span-2">
        <span class="mb-1 block">{{ t('productForm.description') }}</span>
        <textarea v-model="form.description" rows="4" required class="w-full rounded-lg border px-3 py-2" />
      </label>

      <div class="md:col-span-2">
        <button :disabled="submitting" class="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
          {{ submitting ? t('productForm.saving') : t('productForm.addProduct') }}
        </button>
      </div>
    </form>

    <p v-if="message" class="mt-3 text-sm text-emerald-600">{{ message }}</p>
    <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import ProductForm from '~/components/admin/ProductForm.vue'
import ProductTable from '~/components/admin/ProductTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const { t } = useAppI18n()

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

const { data: productsData, refresh: refreshProducts } = await useFetch<any[]>('/api/admin/products', {
  headers: process.server ? useRequestHeaders(['cookie']) : undefined
})

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
  await refreshProducts()
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
    await refreshProducts()
  }
  catch (error: any) {
    productError.value = error?.data?.statusMessage || 'Không thể xóa sản phẩm.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-xl border p-4">
      <h1 class="mb-3 text-lg font-semibold">{{ t('admin.rulesTitle') }}</h1>
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

    <ProductForm @created="onProductCreated" />

    <ProductTable :products="productsData || []" @deleted="onProductDeleted" />

    <p v-if="productMessage" class="text-sm text-emerald-600">{{ productMessage }}</p>
    <p v-if="productError" class="text-sm text-red-600">{{ productError }}</p>
  </section>
</template>

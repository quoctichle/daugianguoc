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
  await refreshProducts()
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

    <ProductTable :products="productsData || []" />
  </section>
</template>

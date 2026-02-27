<script setup lang="ts">
const props = defineProps<{
  product: any
  active?: boolean
}>()

const { t } = useAppI18n()

const emit = defineEmits<{
  select: []
}>()

const statusLabel = computed(() => {
  switch (props.product?.status) {
    case 'active':
      return t('auction.status.active')
    case 'pending':
      return t('auction.status.pending')
    default:
      return t('auction.status.completed')
  }
})

</script>

<template>
  <button
    type="button"
    class="group relative flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl"
    :class="active
      ? 'shadow-xl shadow-primary-900/10 ring-1 ring-primary-200'
      : 'shadow-md shadow-slate-200/50 ring-1 ring-slate-200'"
    @click="emit('select')"
  >
    <!-- Active Glow Effect -->
    <div v-if="active" class="absolute -inset-px z-0 rounded-2xl bg-gradient-to-b from-primary-400/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

    <!-- Image Container -->
    <div class="relative z-10 h-52 w-full overflow-hidden bg-slate-100">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80 z-10" />
      
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      >
      <div v-else class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>

      <!-- Status Badge -->
      <div class="absolute left-4 top-4 z-20">
        <div
          class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md"
          :class="active ? 'bg-primary-500/90 text-white ring-1 ring-white/20' : 'bg-slate-900/80 text-slate-200 ring-1 ring-white/10'"
        >
          <span v-if="active" class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          {{ statusLabel }}
        </div>
      </div>

      <!-- Product Code Badge -->
      <div v-if="product.productCode" class="absolute right-4 top-4 z-20">
        <div class="rounded-lg bg-black/40 px-2.5 py-1 text-xs font-mono font-medium text-white backdrop-blur-md ring-1 ring-white/20">
          #{{ product.productCode }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-1 flex-col justify-between bg-white p-5">
      <div class="space-y-2">
        <h3 class="line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary-700">
          {{ product.name }}
        </h3>
        <p class="line-clamp-2 text-sm leading-relaxed text-slate-500">
          {{ product.description }}
        </p>
      </div>

      <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</span>
          <span class="text-sm font-semibold" :class="active ? 'text-primary-600' : 'text-slate-600'">
            {{ active ? 'Đang mở thưởng' : 'Đã kết thúc' }}
          </span>
        </div>
        
        <div 
          class="flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition-all duration-300"
          :class="active 
            ? 'bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-primary-600/20' 
            : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100'"
        >
          {{ active ? t('auction.actionNow') : t('auction.actionView') }}
          <svg xmlns="http://www.w3.org/2000/svg" class="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </div>
      </div>
    </div>
  </button>
</template>

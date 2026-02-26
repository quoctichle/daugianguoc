<script setup lang="ts">
const { locale, setLocale } = useAppI18n()

const selectLanguage = (language: 'vi' | 'en') => {
  setLocale(language)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="rounded-md border p-1 transition"
      :class="locale === 'vi' ? 'border-white/70 bg-white/20' : 'border-white/30 hover:bg-white/10'"
      @click="selectLanguage('vi')"
      title="Tiếng Việt"
    >
      <img src="/flags/vn.svg" alt="Tiếng Việt" class="h-4 w-6 rounded-sm object-cover">
    </button>

    <button
      type="button"
      class="rounded-md border p-1 transition"
      :class="locale === 'en' ? 'border-white/70 bg-white/20' : 'border-white/30 hover:bg-white/10'"
      @click="selectLanguage('en')"
      title="English"
    >
      <img src="/flags/gb.svg" alt="English" class="h-4 w-6 rounded-sm object-cover">
    </button>
  </div>
</template>

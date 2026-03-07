<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
await navigateTo({
  path: `/auctions/${route.params.id as string}`,
  query: route.query
})
</script>

<template>
  <div class="py-8 text-slate-300">Dang chuyen huong...</div>
</template>

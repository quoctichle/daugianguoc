<script setup lang="ts">
import DashboardSidebar from '~/components/admin/DashboardSidebar.vue'
import DashboardHeader from '~/components/admin/DashboardHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <div class="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[240px_1fr]">
      <aside class="rounded-xl border bg-white p-4">
        <DashboardSidebar />
      </aside>
      <div class="flex min-w-0 flex-col gap-4">
        <header class="rounded-xl border bg-white p-4">
          <DashboardHeader />
        </header>
        <main class="min-h-[70vh] rounded-xl border bg-white p-4">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

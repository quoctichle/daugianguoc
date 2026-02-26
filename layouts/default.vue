<script setup lang="ts">
import LanguageSwitcher from '~/components/common/LanguageSwitcher.vue'

const route = useRoute()
const { user, fetchSession, logout } = useAuth()
const { t } = useAppI18n()
const showUserMenu = ref(false)

await fetchSession()

watch(() => route.fullPath, async () => {
  showUserMenu.value = false
  await fetchSession()
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logoutFromMenu = async () => {
  showUserMenu.value = false
  await logout()
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col overflow-x-hidden bg-primary-50 text-gray-800">
    <div class="pointer-events-none fixed inset-0 -z-10">
      <div class="animate-float-slow absolute -left-16 top-24 h-56 w-56 rounded-full bg-primary-100/80 blur-2xl" />
      <div class="animate-float-slower absolute right-0 top-40 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
      <div class="animate-float-slow absolute bottom-10 left-1/3 h-52 w-52 rounded-full bg-amber-100/60 blur-2xl" />
    </div>

    <header class="relative z-40 bg-primary-900/95 text-white shadow-md backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <NuxtLink to="/" class="flex items-center gap-3 text-xl font-bold tracking-tight">
          <img :alt="t('common.brandName')" src="/uploads/logo.png" class="h-9 w-9 rounded-md object-contain bg-white p-1" >
          <span>{{ t('common.brandName') }}</span>
        </NuxtLink>
        <nav class="relative flex items-center gap-6 text-sm">
          <LanguageSwitcher />
          <template v-if="user">
            <button
              type="button"
              class="rounded-full bg-primary-800 px-3 py-1 text-xs font-medium text-primary-100 transition hover:bg-primary-700"
              @click="toggleUserMenu"
            >
              {{ user.email }}
            </button>
            <div v-if="showUserMenu" class="absolute right-0 top-10 z-50 min-w-32 rounded-lg border border-primary-700 bg-primary-900 p-1 shadow-lg">
              <button
                type="button"
                class="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-primary-100 transition hover:bg-primary-800"
                @click="logoutFromMenu"
              >
                {{ t('common.logout') }}
              </button>
            </div>
            <NuxtLink v-if="user.role === 'ADMIN'" to="/admin" class="transition hover:text-primary-200">{{ t('common.admin') }}</NuxtLink>
          </template>
        </nav>
      </div>
    </header>
    <main class="animate-fade-in-soft mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-gray-100">
      <div class="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-2">
        <section class="space-y-3 text-gray-700">
          <div class="flex items-center gap-3">
            <img src="/uploads/logo.png" alt="Sunshine Telecom" class="h-11 w-11 rounded-lg bg-white p-1 object-contain" >
            <div>
              <p class="text-lg font-bold leading-none text-green-700">SUNSHINE TELECOM</p>
              <p class="text-xs text-green-600">Your hope is our responsibility</p>
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-bold text-gray-800">Trụ sở Nhật Bản</h3>
            <p class="text-base">MST: 9030001136641</p>
            <p class="text-base">Ngày cấp: 28/05/2020</p>
            <p class="text-base">Nơi cấp: Cơ quan thuế quốc gia</p>
          </div>

          <div class="space-y-2 pt-1">
            <h3 class="text-xl font-bold text-gray-800">Văn phòng Việt Nam</h3>
            <p class="text-base">MST: 0110257142</p>
            <p class="text-base">Ngày cấp: 20/02/2023</p>
            <p class="text-base">Nơi cấp: Sở kế hoạch và đầu tư Thành phố Hà nội</p>
          </div>
        </section>

        <section class="space-y-5 text-gray-700">
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-green-800">Thông tin liên hệ Nhật Bản</h3>
            <p class="text-base">335-0002-埼玉県蕨市塚越1-2-14花見第3ビル5階</p>
            <p class="text-base">048-420-6088</p>
            <p class="text-base">ss@sunshineglobal.co.jp</p>
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-bold text-green-800">Thông tin liên hệ Việt Nam</h3>
            <p class="text-base">Số 29 ngõ 151B Thái Hà, phường Đống Đa, Thành phố Hà Nội</p>
            <p class="text-base">048-420-6088</p>
            <p class="text-base">ss@sunshineglobal.co.jp</p>
          </div>
        </section>

      </div>
    </footer>
  </div>
</template>

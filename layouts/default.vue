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
  <div class="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-800 font-sans selection:bg-primary-500 selection:text-white">
    <!-- Dynamic Background -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      <div class="animate-float-slow absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-primary-300/20 blur-[100px]" />
      <div class="animate-float-slower absolute right-0 top-40 h-[600px] w-[600px] rounded-full bg-accent-300/10 blur-[120px]" />
      <div class="animate-float-slow absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-300/20 blur-[100px]" />
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="group flex items-center gap-3 transition-transform hover:scale-105">
          <div class="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 shadow-lg shadow-primary-900/20">
            <img :alt="t('common.brandName')" src="/uploads/logo.png" class="h-8 w-8 object-contain drop-shadow-md filter brightness-0 invert" >
          </div>
          <div class="flex flex-col">
            <span class="bg-gradient-to-r from-primary-900 to-primary-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">{{ t('common.brandName') }}</span>
            <span class="text-[10px] font-medium uppercase tracking-widest text-primary-600">Your hope is our responsibility</span>
          </div>
        </NuxtLink>
        
        <nav class="relative flex items-center gap-4 sm:gap-6">
          <LanguageSwitcher class="hidden sm:block" />
          <template v-if="user">
            <div class="relative">
              <button
                type="button"
                class="flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-semibold text-primary-900 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="toggleUserMenu"
              >
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="hidden sm:inline-block">{{ user.email.split('@')[0] }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 transition-transform" :class="{'rotate-180': showUserMenu}" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95 translate-y-2"
                enter-to-class="transform opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100 translate-y-0"
                leave-to-class="transform opacity-0 scale-95 translate-y-2"
              >
                <div v-if="showUserMenu" class="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div class="mb-2 border-b border-gray-100 px-3 py-2">
                    <p class="text-xs text-gray-500">Đăng nhập với</p>
                    <p class="truncate text-sm font-medium text-gray-900">{{ user.email }}</p>
                  </div>
                  <NuxtLink v-if="user.role === 'ADMIN'" to="/admin" class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ t('common.admin') }}
                  </NuxtLink>
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    @click="logoutFromMenu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {{ t('common.logout') }}
                  </button>
                </div>
              </transition>
            </div>
          </template>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="relative mt-20 overflow-hidden bg-slate-900 text-slate-300">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      <div class="absolute -top-24 left-1/2 h-48 w-1/2 -translate-x-1/2 rounded-full bg-primary-600/20 blur-[100px]"></div>
      
      <div class="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <!-- Brand Section -->
          <div class="space-y-6 lg:col-span-4">
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
                <img src="/uploads/logo.png" alt="Sunshine Telecom" class="h-full w-full object-contain" >
              </div>
              <div>
                <h2 class="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-2xl font-black tracking-tight text-transparent">SUNSHINE TELECOM</h2>
                <p class="text-sm font-medium tracking-wider text-primary-400 uppercase">Your hope is our responsibility</p>
              </div>
            </div>
            <p class="text-sm leading-relaxed text-slate-400">
              Nền tảng đấu giá ngược hàng đầu, mang đến cơ hội sở hữu các sản phẩm công nghệ cao cấp với mức giá không tưởng. Minh bạch, công bằng và đầy kịch tính.
            </p>
            <div class="flex gap-4">
              <a href="#" class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-primary-600 hover:text-white">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
              </a>
              <a href="#" class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-primary-600 hover:text-white">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
            </div>
          </div>

          <!-- Japan Office -->
          <div class="space-y-4 lg:col-span-4">
            <h3 class="text-lg font-bold text-white">Trụ sở Nhật Bản</h3>
            <ul class="space-y-3 text-sm text-slate-400">
              <li class="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>335-0002-埼玉県蕨市塚越1-2-14花見第3ビル5階</span>
              </li>
              <li class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>048-420-6088</span>
              </li>
              <li class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>ss@sunshineglobal.co.jp</span>
              </li>
              <li class="pt-2">
                <p class="text-xs text-slate-500">MST: 9030001136641<br>Cấp ngày: 28/05/2020 bởi Cơ quan thuế quốc gia</p>
              </li>
            </ul>
          </div>

          <!-- Vietnam Office -->
          <div class="space-y-4 lg:col-span-4">
            <h3 class="text-lg font-bold text-white">Văn phòng Việt Nam</h3>
            <ul class="space-y-3 text-sm text-slate-400">
              <li class="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Số 29 ngõ 151B Thái Hà, phường Đống Đa, Thành phố Hà Nội</span>
              </li>
              <li class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>048-420-6088</span>
              </li>
              <li class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>ss@sunshineglobal.co.jp</span>
              </li>
              <li class="pt-2">
                <p class="text-xs text-slate-500">MST: 0110257142<br>Cấp ngày: 20/02/2023 bởi Sở KH&ĐT TP. Hà Nội</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {{ new Date().getFullYear() }} Sunshine Telecom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

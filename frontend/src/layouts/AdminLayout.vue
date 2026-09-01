<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAppStore } from '@/stores/app'
import UserAvatar from '@/components/UserAvatar.vue'
import { 
  Home, Users, FileText, Settings, Shield, Bell, Menu as MenuIcon, X, LogOut,
  ChevronRight, Database, Box, BarChart3, ShieldAlert, FolderTree, ChevronLeft,
  Sun, Moon, MessageCircle, Flag, User
} from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { logout } = useAuth()

const isMobile = ref(false)
const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)
const showUserMenu = ref(false)

const navItems = [
  { icon: Home, label: 'Dashboard', to: '/admin' },
  { icon: Users, label: 'Người dùng', to: '/admin/users' },
  { icon: FileText, label: 'Bài viết', to: '/admin/posts' },
  { icon: ShieldAlert, label: 'Kiểm duyệt', to: '/admin/moderation' },
  { icon: FolderTree, label: 'Danh mục', to: '/admin/categories' },
  { icon: MessageCircle, label: 'Nhóm', to: '/admin/groups' },
  { icon: BarChart3, label: 'Thống kê', to: '/admin/analytics' },
  { icon: Settings, label: 'Cài đặt', to: '/admin/settings' },
]

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) sidebarOpen.value = false
}

const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu') && !target.closest('.user-trigger')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('click', handleClickOutside)
})

const navigateTo = (path: string) => {
  router.push(path)
  if (isMobile.value) mobileSidebarOpen.value = false
}

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar Overlay (mobile) -->
    <transition name="fade">
      <div
        v-if="mobileSidebarOpen && isMobile"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        @click="mobileSidebarOpen = false"
      />
    </transition>

    <!-- Admin Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-gray-950 transition-all duration-300 ease-in-out',
        isMobile
          ? (mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72')
          : (sidebarOpen ? 'w-64' : 'w-20')
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-white/5 shrink-0">
        <div class="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
          <span class="text-white font-bold text-lg">A</span>
        </div>
        <transition name="fade">
          <div v-if="sidebarOpen || isMobile" class="whitespace-nowrap">
            <span class="text-base font-bold text-white">VietBlog</span>
            <span class="block text-[10px] font-semibold text-red-400 uppercase tracking-widest -mt-0.5">Admin Panel</span>
          </div>
        </transition>
      </div>

      <!-- Back to Client -->
      <div class="px-3 pt-4 pb-2">
        <button
          @click="router.push('/')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200',
          ]"
        >
          <ChevronLeft :size="18" class="shrink-0" />
          <transition name="fade">
            <span v-if="sidebarOpen || isMobile" class="whitespace-nowrap">Về trang chính</span>
          </transition>
        </button>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
        <div v-if="sidebarOpen || isMobile" class="px-3 pt-2 pb-3">
          <p class="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Quản lý</p>
        </div>

        <button
          v-for="item in navItems"
          :key="item.to"
          @click="navigateTo(item.to)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
            isActive(item.to)
              ? 'bg-white/10 text-white'
              : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
          ]"
        >
          <component
            :is="item.icon"
            :size="20"
            :class="[
              'shrink-0 transition-all duration-200 group-hover:scale-110',
              isActive(item.to) ? 'text-red-400' : ''
            ]"
          />
          <transition name="fade">
            <span v-if="sidebarOpen || isMobile" class="whitespace-nowrap">{{ item.label }}</span>
          </transition>

          <!-- Active indicator -->
          <div
            v-if="isActive(item.to)"
            class="ml-auto w-1.5 h-1.5 rounded-full bg-red-400"
          />
        </button>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-white/5 shrink-0">
        <button
          @click="appStore.toggleTheme"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all duration-200"
        >
          <Sun v-if="appStore.isDark" :size="20" class="shrink-0 text-amber-400" />
          <Moon v-else :size="20" class="shrink-0 text-indigo-400" />
          <transition name="fade">
            <span v-if="sidebarOpen || isMobile" class="whitespace-nowrap">
              {{ appStore.isDark ? 'Chế độ sáng' : 'Chế độ tối' }}
            </span>
          </transition>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100 dark:bg-surface-900">
      <!-- Top Navbar -->
      <header class="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-surface-800 border-b border-gray-200 dark:border-surface-700 z-30">
        <!-- Left -->
        <div class="flex items-center gap-3">
          <button 
            @click="mobileSidebarOpen = true"
            class="p-2 -ml-2 mr-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors lg:hidden"
          >
            <MenuIcon v-if="!mobileSidebarOpen" :size="22" />
            <X v-else :size="22" />
          </button>
          <button
            class="hidden lg:flex p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            @click="sidebarOpen = !sidebarOpen"
          >
            <MenuIcon :size="22" />
          </button>

          <!-- Breadcrumb -->
          <div class="hidden sm:flex items-center gap-2 text-sm">
            <span class="text-gray-400">Admin</span>
            <span class="text-gray-300 dark:text-surface-600">/</span>
            <span class="font-medium text-gray-700 dark:text-gray-300">{{ $route.meta.title }}</span>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <button class="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <Bell :size="20" />
            <span v-if="appStore.unreadNotifications > 0" class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {{ appStore.unreadNotifications }}
            </span>
          </button>

          <!-- User -->
          <div class="relative">
            <button
              class="user-trigger flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
              @click.stop="showUserMenu = !showUserMenu"
            >
              <UserAvatar v-if="appStore.user" :user="appStore.user" size="sm" class="ring-2 ring-red-500/30" />
              <div class="hidden sm:block text-left">
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ appStore.user?.name }}</p>
                <p class="text-[10px] text-red-500 font-medium uppercase">Administrator</p>
              </div>
              <ChevronDown :size="14" class="hidden sm:block text-gray-400" />
            </button>

            <transition name="slide-up">
              <div
                v-if="showUserMenu"
                class="user-menu absolute right-0 top-12 w-56 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-50"
              >
                <div class="px-4 py-3 border-b border-gray-200 dark:border-surface-700">
                  <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ appStore.user?.name }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ appStore.user?.email }}</p>
                </div>
                <div class="py-2">
                  <button
                    @click="navigateTo('/profile'); showUserMenu = false"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
                  >
                    <User :size="16" /> Trang cá nhân
                  </button>
                  <button
                    @click="navigateTo('/'); showUserMenu = false"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
                  >
                    <ChevronLeft :size="16" /> Về trang chính
                  </button>
                </div>
                <div class="border-t border-gray-200 dark:border-surface-700 py-2">
                  <button
                    @click="logout(); showUserMenu = false"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut :size="16" /> Đăng xuất
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-scroll">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

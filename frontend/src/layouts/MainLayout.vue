<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  Home, TrendingUp, Bookmark, PenSquare, Users, MessageCircle,
  MapPin, Search, Bell, Sun, Moon, Menu, X, LogOut,
  Settings, User, ChevronDown, Shield, ChevronLeft, ChevronRight
} from '@lucide/vue'

const router = useRouter()
const appStore = useAppStore()

const showNotifications = ref(false)
const showUserMenu = ref(false)
const isMobile = ref(false)

const navItems = [
  { icon: Home, label: 'Trang chủ', to: '/' },
  { icon: TrendingUp, label: 'Thịnh hành', to: '/trending' },
  { icon: Bookmark, label: 'Đã lưu', to: '/bookmarks' },
  { icon: PenSquare, label: 'Viết bài', to: '/posts/create' },
  { icon: Users, label: 'Nhóm', to: '/groups' },
  { icon: MessageCircle, label: 'Tin nhắn', to: '/chat' },
  { icon: MapPin, label: 'Bản đồ', to: '/map' },
]

// Admin link is now in user dropdown menu only

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    appStore.isSidebarOpen = false
  }
}

const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.notification-panel') && !target.closest('.notification-trigger')) {
    showNotifications.value = false
  }
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
  if (isMobile.value) appStore.closeMobileSidebar()
}

const logout = () => {
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar Overlay (mobile) -->
    <transition name="fade">
      <div
        v-if="appStore.isMobileSidebarOpen && isMobile"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        @click="appStore.closeMobileSidebar"
      />
    </transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700 transition-all duration-300 ease-in-out',
        isMobile
          ? (appStore.isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72')
          : (appStore.isSidebarOpen ? 'w-64' : 'w-20')
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-gray-200 dark:border-surface-700 shrink-0">
        <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-sm shrink-0">
          <span class="text-white font-bold text-lg">V</span>
        </div>
        <transition name="fade">
          <span v-if="appStore.isSidebarOpen || isMobile" class="text-xl font-bold text-gradient whitespace-nowrap">
            VietBlog
          </span>
        </transition>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.to"
          @click="navigateTo(item.to)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
            $route.path === item.to
              ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
        >
          <component
            :is="item.icon"
            :size="20"
            :class="[
              'shrink-0 transition-transform duration-200 group-hover:scale-110',
              $route.path === item.to ? 'text-primary-500' : ''
            ]"
          />
          <transition name="fade">
            <span v-if="appStore.isSidebarOpen || isMobile" class="whitespace-nowrap">{{ item.label }}</span>
          </transition>

          <!-- Active indicator -->
          <div
            v-if="$route.path === item.to"
            class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-glow"
          />
        </button>


      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-gray-200 dark:border-surface-700 shrink-0">
        <button
          @click="appStore.toggleTheme"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all duration-200"
        >
          <Sun v-if="appStore.isDark" :size="20" class="shrink-0 text-amber-400" />
          <Moon v-else :size="20" class="shrink-0 text-indigo-500" />
          <transition name="fade">
            <span v-if="appStore.isSidebarOpen || isMobile" class="whitespace-nowrap">
              {{ appStore.isDark ? 'Chế độ sáng' : 'Chế độ tối' }}
            </span>
          </transition>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Navbar -->
      <header class="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-surface-700 z-30">
        <!-- Left: Hamburger + Search -->
        <div class="flex items-center gap-3">
          <!-- Mobile hamburger -->
          <button
            class="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            @click="appStore.toggleMobileSidebar"
          >
            <Menu v-if="!appStore.isMobileSidebarOpen" :size="22" />
            <X v-else :size="22" />
          </button>

          <!-- Desktop sidebar toggle -->
          <button
            class="hidden lg:flex p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all duration-200"
            @click="appStore.toggleSidebar"
            :title="appStore.isSidebarOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'"
          >
            <ChevronLeft v-if="appStore.isSidebarOpen" :size="22" class="transition-transform duration-200" />
            <ChevronRight v-else :size="22" class="transition-transform duration-200" />
          </button>

          <!-- Search Bar -->
          <div class="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-4 py-2 w-64 lg:w-96 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:bg-white dark:focus-within:bg-surface-600">
            <Search :size="18" class="text-gray-400 shrink-0" />
            <input
              v-model="appStore.searchQuery"
              type="text"
              placeholder="Tìm kiếm bài viết, người dùng..."
              class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
            <kbd class="hidden lg:inline-flex items-center px-2 py-0.5 text-xs font-mono text-gray-400 bg-gray-200 dark:bg-surface-600 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <!-- Mobile search -->
          <button class="sm:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <Search :size="20" />
          </button>

          <!-- Write button -->
          <button
            @click="navigateTo('/posts/create')"
            class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-500/25"
          >
            <PenSquare :size="16" />
            <span>Viết bài</span>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              class="notification-trigger relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
              @click.stop="showNotifications = !showNotifications"
            >
              <Bell :size="20" />
              <span
                v-if="appStore.unreadNotifications > 0"
                class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse"
              >
                {{ appStore.unreadNotifications }}
              </span>
            </button>

            <!-- Notification Dropdown -->
            <transition name="slide-up">
              <div
                v-if="showNotifications"
                class="notification-panel absolute right-0 top-12 w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-50"
              >
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-surface-700">
                  <h3 class="font-semibold text-sm">Thông báo</h3>
                  <button
                    @click="appStore.markAllRead"
                    class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  <div
                    v-for="notif in appStore.notifications"
                    :key="notif.id"
                    @click="appStore.markNotificationRead(notif.id); showNotifications = false"
                    :class="[
                      'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-surface-700 last:border-0',
                      !notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    ]"
                  >
                    <img
                      v-if="notif.avatar"
                      :src="notif.avatar"
                      class="w-9 h-9 rounded-full shrink-0"
                    />
                    <div v-else class="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <Bell :size="16" class="text-primary-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{{ notif.message }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ notif.createdAt }}</p>
                    </div>
                    <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- User Avatar / Menu -->
          <div class="relative">
            <button
              class="user-trigger flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
              @click.stop="showUserMenu = !showUserMenu"
            >
              <img
                :src="appStore.user?.avatar"
                class="w-8 h-8 rounded-full ring-2 ring-primary-500/30"
              />
              <ChevronDown :size="14" class="hidden sm:block text-gray-400" />
            </button>

            <!-- User Dropdown -->
            <transition name="slide-up">
              <div
                v-if="showUserMenu"
                class="user-menu absolute right-0 top-12 w-56 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-50"
              >
                <div class="px-4 py-3 border-b border-gray-200 dark:border-surface-700">
                  <p class="font-semibold text-sm">{{ appStore.user?.name }}</p>
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
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
                  >
                    <Settings :size="16" /> Cài đặt
                  </button>
                  <button
                    v-if="appStore.isAdmin"
                    @click="navigateTo('/admin'); showUserMenu = false"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                  >
                    <Shield :size="16" /> Trang quản trị
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
      <main class="flex-1 overflow-y-auto">
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

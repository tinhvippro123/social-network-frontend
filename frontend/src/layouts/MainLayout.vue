<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatRelativeTime } from '@/utils/formatters'
import {
  Home, TrendingUp, Bookmark, PenSquare, Users, MessageCircle,
  MapPin, SearchIcon, Bell, Sun, Moon, MenuIcon, X, LogOut,
  Settings, User, ChevronDown, Shield, ChevronLeft, ChevronRight
} from '@lucide/vue'
import { NAV_ITEMS } from '@/constants/ui'
import { useMainLayout } from '@/composables/useMainLayout'
import ScrollToTop from '@/components/ScrollToTop.vue'

const { user } = useAuth()
const navItems = NAV_ITEMS

const {
  uiStore,
  showNotifications,
  showUserMenu,
  isMobile,
  initEvents,
  cleanupEvents,
  navigateTo,
  logout
} = useMainLayout()
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar Overlay (mobile) -->
    <transition name="fade">
      <div
        v-if="uiStore.isMobileSidebarOpen && isMobile"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        @click="uiStore.closeMobileSidebar"
      />
    </transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700 transition-all duration-300 ease-in-out',
        isMobile
          ? (uiStore.isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72')
          : (uiStore.isSidebarOpen ? 'w-64' : 'w-20')
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-gray-200 dark:border-surface-700 shrink-0">
        <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-sm shrink-0">
          <span class="text-white font-bold text-lg">V</span>
        </div>
        <transition name="fade">
          <span v-if="uiStore.isSidebarOpen || isMobile" class="text-xl font-bold text-gradient whitespace-nowrap">
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
            <span v-if="uiStore.isSidebarOpen || isMobile" class="whitespace-nowrap">{{ item.label }}</span>
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
          @click="uiStore.toggleTheme"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all duration-200"
        >
          <Sun v-if="uiStore.isDark" :size="20" class="shrink-0 text-amber-400" />
          <Moon v-else :size="20" class="shrink-0 text-indigo-500" />
          <transition name="fade">
            <span v-if="uiStore.isSidebarOpen || isMobile" class="whitespace-nowrap">
              {{ uiStore.isDark ? 'Chế độ sáng' : 'Chế độ tối' }}
            </span>
          </transition>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Navbar -->
      <header class="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-surface-700 z-30">
        <!-- Left: Hamburger + Search -->
        <div class="flex items-center gap-3">
          <!-- Mobile hamburger -->
          <button
            class="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            @click="uiStore.toggleMobileSidebar"
          >
            <MenuIcon v-if="!uiStore.isMobileSidebarOpen" :size="22" />
            <X v-else :size="22" />
          </button>

          <!-- Desktop sidebar toggle -->
          <button
            class="hidden lg:flex p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all duration-200"
            @click="uiStore.toggleSidebar"
            :title="uiStore.isSidebarOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'"
          >
            <ChevronLeft v-if="uiStore.isSidebarOpen" :size="22" class="transition-transform duration-200" />
            <ChevronRight v-else :size="22" class="transition-transform duration-200" />
          </button>

          <!-- Search Bar -->
          <div class="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-4 py-2 w-64 lg:w-96 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:bg-white dark:focus-within:bg-surface-600">
            <SearchIcon :size="18" class="text-gray-400 shrink-0" />
            <input
              v-model="uiStore.searchQuery"
              @keydown.enter="uiStore.searchQuery.trim() && navigateTo(`/search?q=${encodeURIComponent(uiStore.searchQuery.trim())}`)"
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
            <SearchIcon :size="20" />
          </button>

          <!-- Write button -->
          <button
            v-if="user"
            @click="navigateTo('/posts/create')"
            class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-sm"
          >
            <PenSquare :size="16" />
            <span>Viết bài</span>
          </button>

          <!-- Notifications & User Menu (Logged In) -->
          <template v-if="user">
            <!-- Notifications -->
            <div class="relative">
              <button
                class="notification-trigger relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
                @click.stop="showNotifications = !showNotifications"
              >
                <Bell :size="20" />
                <span
                  v-if="uiStore.unreadCount > 0"
                  class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse"
                >
                  {{ uiStore.unreadCount }}
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
                      @click="uiStore.markAllRead"
                      class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>
                  <div class="max-h-80 overflow-y-auto">
                    <div v-if="uiStore.notifications.length === 0" class="py-8 text-center text-gray-500 dark:text-gray-400">
                      <Bell class="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p class="text-sm">Không có thông báo nào</p>
                    </div>
                    <div
                      v-else
                      v-for="notif in uiStore.notifications"
                      :key="notif.id"
                      @click="uiStore.markNotificationRead(notif.id); showNotifications = false"
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
                        <p class="text-xs text-gray-400 mt-1">{{ formatRelativeTime(notif.createdAt) }}</p>
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
                <UserAvatar
                  :user="user"
                  size="sm"
                  class="ring-2 ring-primary-500/30"
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
                    <p class="font-semibold text-sm">{{ user?.name }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ user?.email }}</p>
                  </div>
                  <div class="py-2">
                    <button
                      @click="navigateTo('/profile'); showUserMenu = false"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      <User :size="16" /> Trang cá nhân
                    </button>
                    <button
                      @click="navigateTo('/settings'); showUserMenu = false"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      <Settings :size="16" /> Cài đặt
                    </button>
                    <button
                      v-if="user?.role === 'admin'"
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
          </template>

          <!-- Login/Register Buttons (Guest) -->
          <div v-else class="flex items-center gap-2 sm:gap-3">
            <button
              @click="uiStore.openAuthModal('login')"
              class="hidden sm:flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            >
              Đăng nhập
            </button>
            <button
              @click="uiStore.openAuthModal('register')"
              class="flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
      <ScrollToTop />
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

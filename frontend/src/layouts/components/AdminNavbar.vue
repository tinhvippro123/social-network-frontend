<script setup lang="ts">
import { Bell, Menu as MenuIcon, X, LogOut, ChevronLeft, User, ChevronDown } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps<{
  user: any
  uiStore: any
  mobileSidebarOpen: boolean
  sidebarOpen: boolean
  showUserMenu: boolean
  title: string
}>()

const emit = defineEmits<{
  (e: 'update:mobileSidebarOpen', value: boolean): void
  (e: 'update:sidebarOpen', value: boolean): void
  (e: 'update:showUserMenu', value: boolean): void
  (e: 'navigate', path: string): void
  (e: 'logout'): void
}>()
</script>

<template>
  <header class="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-surface-800 border-b border-gray-200 dark:border-surface-700 z-30">
    <!-- Left -->
    <div class="flex items-center gap-3">
      <button 
        @click="emit('update:mobileSidebarOpen', true)"
        class="p-2 -ml-2 mr-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors lg:hidden"
      >
        <MenuIcon v-if="!mobileSidebarOpen" :size="22" />
        <X v-else :size="22" />
      </button>
      <button
        class="hidden lg:flex p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
        @click="emit('update:sidebarOpen', !sidebarOpen)"
      >
        <MenuIcon :size="22" />
      </button>

      <!-- Breadcrumb -->
      <div class="hidden sm:flex items-center gap-2 text-sm">
        <span class="text-gray-400">Admin</span>
        <span class="text-gray-300 dark:text-surface-600">/</span>
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ title }}</span>
      </div>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-2">
      <!-- Notifications -->
      <button class="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
        <Bell :size="20" />
        <span v-if="uiStore.unreadCount > 0" class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {{ uiStore.unreadCount }}
        </span>
      </button>

      <!-- User -->
      <div class="relative">
        <button
          class="user-trigger flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
          @click.stop="emit('update:showUserMenu', !showUserMenu)"
        >
          <UserAvatar v-if="user" :user="user" size="sm" class="ring-2 ring-red-500/30" />
          <div class="hidden sm:block text-left">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ user?.name }}</p>
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
              <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ user?.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ user?.email }}</p>
            </div>
            <div class="py-2">
              <button
                @click="emit('navigate', '/profile'); emit('update:showUserMenu', false)"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
              >
                <User :size="16" /> Trang cá nhân
              </button>
              <button
                @click="emit('navigate', '/'); emit('update:showUserMenu', false)"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
              >
                <ChevronLeft :size="16" /> Về trang chính
              </button>
            </div>
            <div class="border-t border-gray-200 dark:border-surface-700 py-2">
              <button
                @click="emit('logout'); emit('update:showUserMenu', false)"
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
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

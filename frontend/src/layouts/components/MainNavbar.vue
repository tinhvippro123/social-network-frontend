<script setup lang="ts">
import {
  SearchIcon, MenuIcon, X,
  ChevronLeft, ChevronRight, PenSquare
} from '@lucide/vue'
import MainNavbarNotifications from './MainNavbarNotifications.vue'
import MainNavbarUserMenu from './MainNavbarUserMenu.vue'

defineProps<{
  user: any
  uiStore: any
  showNotifications: boolean
  showUserMenu: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showNotifications', value: boolean): void
  (e: 'update:showUserMenu', value: boolean): void
  (e: 'navigate', path: string): void
  (e: 'logout'): void
}>()
</script>

<template>
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
          @keydown.enter="uiStore.searchQuery.trim() && emit('navigate', `/search?q=${encodeURIComponent(uiStore.searchQuery.trim())}`)"
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
        @click="emit('navigate', '/posts/create')"
        class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-sm"
      >
        <PenSquare :size="16" />
        <span>Viết bài</span>
      </button>

      <!-- Notifications & User Menu (Logged In) -->
      <template v-if="user">
        <!-- Notifications -->
        <MainNavbarNotifications
          :ui-store="uiStore"
          :show-notifications="showNotifications"
          @update:show-notifications="val => emit('update:showNotifications', val)"
        />

        <!-- User Avatar / Menu -->
        <MainNavbarUserMenu
          :user="user"
          :show-user-menu="showUserMenu"
          @update:show-user-menu="val => emit('update:showUserMenu', val)"
          @navigate="path => emit('navigate', path)"
          @logout="emit('logout')"
        />
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
</template>



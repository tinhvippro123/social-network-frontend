<script setup lang="ts">
import { ref } from 'vue'
import {
  SearchIcon, MenuIcon, X,
  ChevronLeft, ChevronRight, PenSquare,
  Camera, Sparkles
} from '@lucide/vue'
import MainNavbarNotifications from './MainNavbarNotifications.vue'
import MainNavbarUserMenu from './MainNavbarUserMenu.vue'
import MainNavbarChat from './MainNavbarChat.vue'
import type { ChatConversation } from '@/types'

const props = defineProps<{
  user: any
  uiStore: any
  showNotifications: boolean
  showUserMenu: boolean
  showChat: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showNotifications', value: boolean): void
  (e: 'update:showUserMenu', value: boolean): void
  (e: 'update:showChat', value: boolean): void
  (e: 'navigate', path: string): void
  (e: 'logout'): void
  (e: 'openChatWindow', conv: ChatConversation): void
}>()

const navbarImageInput = ref<HTMLInputElement | null>(null)

function handleSearchSubmit() {
  const q = props.uiStore.searchQuery?.trim()
  if (q) {
    emit('navigate', `/search?q=${encodeURIComponent(q)}`)
  } else {
    emit('navigate', '/search')
  }
}

function onNavbarImagePicked(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    props.uiStore.setPendingSearchFile(target.files[0], 'image')
    emit('navigate', '/search')
    target.value = ''
  }
}
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
      <div class="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-1.5 w-64 lg:w-96 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:bg-white dark:focus-within:bg-surface-600">
        <button
          type="button"
          @click="handleSearchSubmit"
          class="text-gray-400 hover:text-primary-500 transition-colors shrink-0 cursor-pointer"
          title="Tìm kiếm"
        >
          <SearchIcon :size="18" />
        </button>
        <input
          v-model="uiStore.searchQuery"
          @keydown.enter="handleSearchSubmit"
          type="text"
          placeholder="Tìm kiếm bài viết, người dùng, AI..."
          class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
        />
        <!-- Image search button directly in Navbar -->
        <button
          type="button"
          @click="navbarImageInput?.click()"
          class="p-1 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors shrink-0 cursor-pointer"
          title="Tìm kiếm bằng hình ảnh (AI)"
        >
          <Camera :size="16" />
        </button>
        <!-- AI Badge button -->
        <button
          type="button"
          @click="emit('navigate', '/search')"
          class="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors shrink-0"
          title="Mở trang tìm kiếm AI"
        >
          <Sparkles :size="12" />
          <span>AI</span>
        </button>
      </div>

      <!-- Hidden file input for image search -->
      <input
        ref="navbarImageInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        class="hidden"
        @change="onNavbarImagePicked"
      />
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <!-- Mobile search -->
      <button
        @click="emit('navigate', '/search')"
        class="sm:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
        title="Tìm kiếm AI"
      >
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

      <!-- Notifications & Chat & User Menu (Logged In) -->
      <template v-if="user">
        <!-- Chat (Messenger icon) -->
        <MainNavbarChat
          :show-chat="showChat"
          @update:show-chat="val => { emit('update:showChat', val); if (val) { emit('update:showNotifications', false); emit('update:showUserMenu', false) } }"
          @open-chat-window="conv => emit('openChatWindow', conv)"
        />

        <!-- Notifications -->
        <MainNavbarNotifications
          :ui-store="uiStore"
          :show-notifications="showNotifications"
          @update:show-notifications="val => { emit('update:showNotifications', val); if (val) { emit('update:showChat', false); emit('update:showUserMenu', false) } }"
        />

        <!-- User Avatar / Menu -->
        <MainNavbarUserMenu
          :user="user"
          :show-user-menu="showUserMenu"
          @update:show-user-menu="val => { emit('update:showUserMenu', val); if (val) { emit('update:showChat', false); emit('update:showNotifications', false) } }"
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



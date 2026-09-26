<script setup lang="ts">
import { Settings, User, Shield, LogOut, ChevronDown } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps<{
  user: any
  showUserMenu: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showUserMenu', value: boolean): void
  (e: 'navigate', path: string): void
  (e: 'logout'): void
}>()
</script>

<template>
  <div class="relative">
    <button
      class="user-trigger flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
      @click.stop="emit('update:showUserMenu', !showUserMenu)"
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
            @click="emit('navigate', '/profile'); emit('update:showUserMenu', false)"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
          >
            <User :size="16" /> Trang cá nhân
          </button>
          <button
            @click="emit('navigate', '/settings'); emit('update:showUserMenu', false)"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
          >
            <Settings :size="16" /> Cài đặt
          </button>
          <button
            v-if="user?.role === 'admin'"
            @click="emit('navigate', '/admin'); emit('update:showUserMenu', false)"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
          >
            <Shield :size="16" /> Trang quản trị
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

<script setup lang="ts">
import { Sun, Moon, Shield } from '@lucide/vue'
import { NAV_ITEMS } from '@/constants/ui'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const props = defineProps<{
  isMobile: boolean
  isMobileSidebarOpen: boolean
  isSidebarOpen: boolean
  isDark: boolean
  currentPath: string
}>()

const emit = defineEmits<{
  (e: 'navigate', path: string): void
  (e: 'toggleTheme'): void
}>()

function isItemActive(to: string) {
  if (to === '/') return props.currentPath === '/'
  return props.currentPath === to || props.currentPath.startsWith(`${to}/`)
}
</script>

<template>
  <aside
    :class="[
      'fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-surface-700 transition-all duration-300 ease-in-out',
      isMobile
        ? (isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72')
        : (isSidebarOpen ? 'w-64' : 'w-20')
    ]"
  >
    <!-- Logo -->
    <div
      @click="emit('navigate', '/')"
      class="flex items-center gap-3 px-5 h-16 border-b border-gray-200 dark:border-surface-700 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
      title="Về trang chủ"
    >
      <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-sm shrink-0">
        <span class="text-white font-bold text-lg">V</span>
      </div>
      <transition name="fade">
        <span v-if="isSidebarOpen || isMobile" class="text-xl font-bold text-gradient whitespace-nowrap">
          VietBlog
        </span>
      </transition>
    </div>

    <!-- Nav Items -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <button
        v-for="item in NAV_ITEMS"
        :key="item.to"
        @click="emit('navigate', item.to)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer',
          isItemActive(item.to)
            ? 'bg-primary-600 text-white shadow-xs'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-900 dark:hover:text-gray-200'
        ]"
      >
        <component
          :is="item.icon"
          :size="20"
          :class="[
            'shrink-0 transition-transform duration-200 group-hover:scale-110',
            isItemActive(item.to) ? 'text-white' : ''
          ]"
        />
        <transition name="fade">
          <span v-if="isSidebarOpen || isMobile" class="whitespace-nowrap">{{ item.label }}</span>
        </transition>

        <!-- Active indicator -->
        <div
          v-if="isItemActive(item.to)"
          class="ml-auto w-1.5 h-1.5 rounded-full bg-white"
        />
      </button>

      <!-- Admin link if user is admin -->
      <button
        v-if="authStore.isModerator"
        @click="emit('navigate', authStore.isAdmin ? '/admin' : '/admin/moderation')"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group border mt-3 cursor-pointer',
          currentPath.startsWith('/admin')
            ? 'bg-primary-600 text-white shadow-xs border-primary-600'
            : 'text-primary-700 dark:text-primary-400 bg-primary-50/70 dark:bg-primary-950/30 border-primary-200 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/40'
        ]"
      >
        <Shield :size="20" class="shrink-0 transition-transform duration-200 group-hover:scale-110" />
        <transition name="fade">
          <span v-if="isSidebarOpen || isMobile" class="whitespace-nowrap">{{ authStore.isAdmin ? 'Trang quản trị' : 'Kiểm duyệt' }}</span>
        </transition>
      </button>
    </nav>

    <!-- Sidebar Footer -->
    <div class="p-3 border-t border-gray-200 dark:border-surface-700 shrink-0">
      <button
        @click="emit('toggleTheme')"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all duration-200 cursor-pointer"
      >
        <Sun v-if="isDark" :size="20" class="shrink-0 text-amber-400" />
        <Moon v-else :size="20" class="shrink-0 text-slate-500" />
        <transition name="fade">
          <span v-if="isSidebarOpen || isMobile" class="whitespace-nowrap">
            {{ isDark ? 'Chế độ sáng' : 'Chế độ tối' }}
          </span>
        </transition>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

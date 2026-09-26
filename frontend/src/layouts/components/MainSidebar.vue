<script setup lang="ts">
import { Sun, Moon } from '@lucide/vue'
import { NAV_ITEMS } from '@/constants/ui'

defineProps<{
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
    <div class="flex items-center gap-3 px-5 h-16 border-b border-gray-200 dark:border-surface-700 shrink-0">
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
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
          currentPath === item.to
            ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-900 dark:hover:text-gray-200'
        ]"
      >
        <component
          :is="item.icon"
          :size="20"
          :class="[
            'shrink-0 transition-transform duration-200 group-hover:scale-110',
            currentPath === item.to ? 'text-primary-500' : ''
          ]"
        />
        <transition name="fade">
          <span v-if="isSidebarOpen || isMobile" class="whitespace-nowrap">{{ item.label }}</span>
        </transition>

        <!-- Active indicator -->
        <div
          v-if="currentPath === item.to"
          class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-glow"
        />
      </button>
    </nav>

    <!-- Sidebar Footer -->
    <div class="p-3 border-t border-gray-200 dark:border-surface-700 shrink-0">
      <button
        @click="emit('toggleTheme')"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all duration-200"
      >
        <Sun v-if="isDark" :size="20" class="shrink-0 text-amber-400" />
        <Moon v-else :size="20" class="shrink-0 text-indigo-500" />
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

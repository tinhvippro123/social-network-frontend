<script setup lang="ts">
import { Home, Users, FileText, Settings, ShieldAlert, FolderTree, MessageCircle, BarChart3, ChevronLeft, Sun, Moon } from '@lucide/vue'

defineProps<{
  isMobile: boolean
  mobileSidebarOpen: boolean
  sidebarOpen: boolean
  isDark: boolean
  isActive: (path: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'navigate', path: string): void
  (e: 'toggleTheme'): void
  (e: 'navigateHome'): void
}>()

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
</script>

<template>
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
        @click="emit('navigateHome')"
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
        @click="emit('navigate', item.to)"
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
        @click="emit('toggleTheme')"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all duration-200"
      >
        <Sun v-if="isDark" :size="20" class="shrink-0 text-amber-400" />
        <Moon v-else :size="20" class="shrink-0 text-indigo-400" />
        <transition name="fade">
          <span v-if="sidebarOpen || isMobile" class="whitespace-nowrap">
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

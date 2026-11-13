<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/auth/useAuth'

import { useAdminLayout } from '@/composables/admin/useAdminLayout'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminNavbar from './components/AdminNavbar.vue'

const router = useRouter()
const { user } = useAuth()

const {
  uiStore,
  isMobile,
  sidebarOpen,
  mobileSidebarOpen,
  showUserMenu,
  pendingReportsCount,
  navigateTo,
  logout,
  isActive
} = useAdminLayout()


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
    <AdminSidebar
      :is-mobile="isMobile"
      :mobile-sidebar-open="mobileSidebarOpen"
      :sidebar-open="sidebarOpen"
      :is-dark="uiStore.isDark"
      :is-active="isActive"
      @navigate="navigateTo"
      @toggle-theme="uiStore.toggleTheme"
      @navigate-home="router.push('/')"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100 dark:bg-surface-900">
      <!-- Top Navbar -->
      <AdminNavbar
        :user="user"
        :ui-store="uiStore"
        :pending-reports-count="pendingReportsCount"
        v-model:mobile-sidebar-open="mobileSidebarOpen"
        v-model:sidebar-open="sidebarOpen"
        v-model:show-user-menu="showUserMenu"
        :title="$route.meta.title as string"
        @navigate="navigateTo"
        @logout="logout"
      />

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
</style>

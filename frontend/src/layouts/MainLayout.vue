<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/auth/useAuth'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatRelativeTime } from '@/utils/formatters'
import { useMainLayout } from '@/composables/ui/useMainLayout'
import ScrollToTop from '@/components/ScrollToTop.vue'
import MainSidebar from './components/MainSidebar.vue'
import MainNavbar from './components/MainNavbar.vue'

const { user } = useAuth()

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
    <MainSidebar
      :is-mobile="isMobile"
      :is-mobile-sidebar-open="uiStore.isMobileSidebarOpen"
      :is-sidebar-open="uiStore.isSidebarOpen"
      :is-dark="uiStore.isDark"
      :current-path="$route.path"
      @navigate="navigateTo"
      @toggle-theme="uiStore.toggleTheme"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Navbar -->
      <MainNavbar
        :user="user"
        :ui-store="uiStore"
        v-model:show-notifications="showNotifications"
        v-model:show-user-menu="showUserMenu"
        @navigate="navigateTo"
        @logout="logout"
      />

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
</style>

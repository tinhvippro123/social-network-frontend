<script setup lang="ts">
import { computed } from 'vue'
import { useSettings } from '@/composables/ui/useSettings'

// Import Tab Components
import ProfileTab from './tabs/ProfileTab.vue'
import AccountTab from './tabs/AccountTab.vue'
import AppearanceTab from './tabs/AppearanceTab.vue'
import NotificationsTab from './tabs/NotificationsTab.vue'
import PrivacyTab from './tabs/PrivacyTab.vue'

const { activeTab, tabs } = useSettings()

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'profile': return ProfileTab
    case 'account': return AccountTab
    case 'appearance': return AppearanceTab
    case 'notifications': return NotificationsTab
    case 'privacy': return PrivacyTab
    default: return ProfileTab
  }
})
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý tài khoản và tuỳ chỉnh trải nghiệm của bạn</p>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar Tabs -->
      <nav class="w-full md:w-56 shrink-0">
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-2 space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700'
            ]"
          >
            <component :is="tab.icon" :size="18" />
            {{ tab.label }}
          </button>
        </div>
      </nav>

      <!-- Content Area -->
      <div class="flex-1 min-w-0">
        <transition name="fade" mode="out-in">
          <component :is="currentTabComponent" />
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

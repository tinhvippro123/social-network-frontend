<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToastProvider from '@/components/ui/ToastProvider.vue'
import AuthModal from '@/components/AuthModal.vue'

const route = useRoute()
const uiStore = useUiStore()
const authStore = useAuthStore()

const layout = computed(() => {
  if (route.meta.layout === 'auth') return 'auth'
  if (route.meta.layout === 'admin') return 'admin'
  return 'main'
})

onMounted(() => {
  uiStore.initTheme()
  authStore.initAuth()
})
</script>

<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <ToastProvider />
    <AuthModal />
    
    <AuthLayout v-if="layout === 'auth'">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </AuthLayout>

    <AdminLayout v-else-if="layout === 'admin'">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </AdminLayout>

    <MainLayout v-else>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </MainLayout>
  </div>
</template>

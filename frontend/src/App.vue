<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToastProvider from '@/components/ui/ToastProvider.vue'

const route = useRoute()
const appStore = useAppStore()

const layout = computed(() => {
  if (route.meta.layout === 'auth') return 'auth'
  if (route.meta.layout === 'admin') return 'admin'
  return 'main'
})

onMounted(() => {
  appStore.initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <ToastProvider />
    
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

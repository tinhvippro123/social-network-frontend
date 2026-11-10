<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden py-4">
    <!-- Background -->
    <div class="absolute inset-0 bg-surface-50 dark:bg-surface-900">
      <!-- Subtle Grid pattern -->
      <div class="absolute inset-0 opacity-10 dark:opacity-5"
        style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 40px 40px;"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <!-- Logo -->
      <div class="text-center mb-4 animate-slide-up">
        <div
          @click="router.push('/')"
          class="inline-flex items-center gap-2.5 mb-1 cursor-pointer hover:opacity-90 transition-opacity"
          title="Về trang chủ"
        >
          <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-lg">V</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Viet<span class="text-gradient">Blog</span>
          </h1>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-xs">Nền tảng chia sẻ kiến thức cho cộng đồng</p>
      </div>

      <!-- Auth Card -->
      <div class="bg-white dark:bg-surface-800/80 backdrop-blur-2xl rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-xl animate-slide-up" style="animation-delay: 0.1s;">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, ArrowLeft, ShieldAlert } from '@lucide/vue'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center space-y-8">
      <!-- Illustration / Number -->
      <div class="relative">
        <h1 class="text-9xl font-black text-red-100 dark:text-red-900/30 tracking-tighter">403</h1>
        <div class="absolute inset-0 flex items-center justify-center flex-col">
          <div class="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert :size="48" class="text-red-500" />
          </div>
        </div>
      </div>
      
      <!-- Text -->
      <div class="space-y-3">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Truy cập bị từ chối</h2>
        <p class="text-gray-500 dark:text-gray-400">
          Bạn không có đủ quyền hạn để truy cập vào khu vực này. Vui lòng liên hệ quản trị viên nếu đây là sự nhầm lẫn.
        </p>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button 
          @click="router.back()"
          class="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 dark:border-surface-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-800 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft :size="20" />
          Quay lại
        </button>
        <button 
          @click="router.push('/')"
          class="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
        >
          <Home :size="20" />
          Về trang chủ
        </button>
      </div>
    </div>
  </div>
</template>

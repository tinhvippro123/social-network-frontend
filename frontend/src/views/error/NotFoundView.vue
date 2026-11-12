<script setup lang="ts">
import { Home, Search, ArrowLeft } from '@lucide/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <!-- 404 Illustration -->
      <div class="relative mb-8">
        <div class="text-[150px] font-black leading-none text-primary-600 dark:text-primary-400 select-none">
          404
        </div>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Trang không tồn tại
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.
      </p>

      <div class="flex items-center justify-center gap-3">
        <button
          @click="router.back()"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all"
        >
          <ArrowLeft :size="16" />
          Quay lại
        </button>
        <router-link
          to="/"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-xs transition-colors"
        >
          <Home :size="16" />
          Trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

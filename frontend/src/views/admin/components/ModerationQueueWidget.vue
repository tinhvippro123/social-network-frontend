<script setup lang="ts">
import { ShieldAlert, Check, X, Ban } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'

defineProps<{
  reports: any[]
  isLoading: boolean
}>()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
    <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
      <ShieldAlert :size="18" class="text-red-500" />
      Hàng đợi kiểm duyệt
    </h3>
    <div v-if="isLoading" class="space-y-3">
      <Skeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
    </div>
    <div v-else-if="reports.length" class="space-y-3">
      <div
        v-for="report in reports"
        :key="report.id"
        :class="[
          'p-3 rounded-xl border transition-all',
          report.status === 'pending'
            ? 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/5'
            : 'border-gray-200 dark:border-surface-700'
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span :class="[
                'text-xs font-medium px-2 py-0.5 rounded-md',
                report.type === 'post' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                report.type === 'comment' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                'bg-purple-100 dark:bg-purple-900/20 text-purple-600'
              ]">
                {{ report.type === 'post' ? 'Bài viết' : report.type === 'comment' ? 'Bình luận' : 'Người dùng' }}
              </span>
              <span :class="[
                'text-xs font-medium px-2 py-0.5 rounded-md',
                report.status === 'pending' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-green-100 dark:bg-green-900/20 text-green-600'
              ]">
                {{ report.status === 'pending' ? 'Đang chờ' : 'Đã xử lý' }}
              </span>
            </div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{{ report.targetTitle }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ report.reason }}</p>
          </div>
        </div>
        <div v-if="report.status === 'pending'" class="flex gap-2 mt-3">
          <button class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all">
            <Check :size="12" /> Giữ lại
          </button>
          <button class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            <X :size="12" /> Xóa
          </button>
          <button class="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
            <Ban :size="12" />
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-sm text-gray-500 text-center py-8">
      Không có báo cáo nào đang chờ xử lý
    </div>
  </div>
</template>

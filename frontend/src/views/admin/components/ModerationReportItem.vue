<script setup lang="ts">
import { Eye, Check, X, Ban, Clock } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDateTime } from '@/utils/formatters'
import type { Report } from '@/types'

defineProps<{
  report: Report & {
    targetTitle: string
    reporter: {
      name: string
      avatar: string
    }
  }
}>()
</script>

<template>
  <div
    :class="['bg-white dark:bg-surface-800 rounded-2xl border p-5 transition-all',
      report.status === 'pending' ? 'border-red-200 dark:border-red-900/30' : 'border-gray-200 dark:border-surface-700']">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <!-- Badges -->
        <div class="flex items-center gap-2 mb-3">
          <span :class="['px-2.5 py-1 rounded-lg text-xs font-semibold',
            report.type === 'post' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
            report.type === 'comment' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
            'bg-purple-100 dark:bg-purple-900/20 text-purple-600']">
            {{ report.type === 'post' ? '📄 Bài viết' : report.type === 'comment' ? '💬 Bình luận' : '👤 Người dùng' }}
          </span>
          <span :class="['px-2.5 py-1 rounded-lg text-xs font-semibold',
            report.status === 'pending' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
            report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
            'bg-gray-100 dark:bg-surface-700 text-gray-500']">
            {{ report.status === 'pending' ? '⏳ Đang chờ' : report.status === 'resolved' ? '✅ Đã xử lý' : '❌ Bỏ qua' }}
          </span>
        </div>

        <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ report.targetTitle }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span class="font-medium">Lý do:</span> {{ report.reason }}
        </p>
        <div class="flex items-center gap-3">
          <UserAvatar :user="report.reporter as any" size="sm" />
          <div class="flex-1 min-w-0 flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ report.reporter.name }}</span>
            <span class="text-xs text-gray-500">đã báo cáo</span>
            <span class="text-sm font-medium text-blue-500 hover:underline cursor-pointer">{{ report.targetTitle }}</span>
          </div>
          <span class="text-xs text-gray-400 flex items-center gap-1"><Clock :size="12" /> {{ formatDateTime(report.createdAt) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="report.status === 'pending'" class="flex flex-col gap-2 shrink-0">
        <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
          <Eye :size="12" /> Xem nội dung
        </button>
        <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all">
          <Check :size="12" /> Giữ lại
        </button>
        <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
          <X :size="12" /> Xóa nội dung
        </button>
        <button class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
          <Ban :size="12" /> Cấm người đăng
        </button>
      </div>
    </div>
  </div>
</template>

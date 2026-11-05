<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShieldAlert, Check, X, Ban, ExternalLink } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useAuthStore } from '@/stores/auth.store'

defineProps<{
  reports: any[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'resolve', reportId: string, action: 'keep' | 'delete' | 'ban'): void
}>()

const router = useRouter()
const authStore = useAuthStore()

function viewTarget(report: any) {
  const type = (report.type || '').toLowerCase()
  let path = '/'
  if (type === 'post') path = `/posts/${report.targetId}`
  else if (type === 'comment') path = report.targetPostId ? `/posts/${report.targetPostId}#comment-${report.targetId}` : '/'
  else if (type === 'group') path = `/groups/${report.targetId}`
  else if (type === 'user') path = `/profile/${report.targetId}`
  window.open(router.resolve(path).href, '_blank', 'noopener')
}
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
                report.type === 'group' ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-600' :
                'bg-purple-100 dark:bg-purple-900/20 text-purple-600'
              ]">
                {{ report.type === 'post' ? 'Bài viết' : report.type === 'comment' ? 'Bình luận' : report.type === 'group' ? 'Nhóm' : 'Người dùng' }}
              </span>
              <span :class="[
                'text-xs font-medium px-2 py-0.5 rounded-md',
                report.status === 'pending' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                'bg-gray-100 dark:bg-surface-700 text-gray-500'
              ]">
                {{ report.status === 'pending' ? 'Đang chờ' : report.status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua' }}
              </span>
            </div>
            <p @click="report.targetId && viewTarget(report)" class="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1 hover:text-primary-500 hover:underline cursor-pointer inline-flex items-center gap-1" title="Xem đối tượng bị báo cáo">{{ report.targetTitle }} <ExternalLink v-if="report.targetId" :size="11" class="shrink-0 opacity-60" /></p>
            <p class="text-xs text-gray-400 mt-1">{{ report.reason }}</p>
          </div>
        </div>
        <div v-if="report.status === 'pending'" class="flex gap-2 mt-3">
          <button
            type="button"
            @click="emit('resolve', report.id, 'keep')"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all cursor-pointer"
            title="Giữ lại nội dung"
          >
            <Check :size="12" /> Giữ lại
          </button>
          <button
            v-if="report.type !== 'group' || authStore.isAdmin"
            type="button"
            @click="emit('resolve', report.id, 'delete')"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
            title="Xóa / Ẩn nội dung vi phạm"
          >
            <X :size="12" /> Xóa
          </button>
          <button
            type="button"
            @click="emit('resolve', report.id, 'ban')"
            class="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
            title="Cấm tác giả"
          >
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

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldAlert, Check, X, Ban, ExternalLink } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/ui/useToast'

const props = defineProps<{
  reports: any[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'resolve', reportId: string, action: 'keep' | 'delete' | 'ban'): void
  (e: 'dismiss', reportId: string): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const allPendingReports = computed(() =>
  (props.reports || []).filter((r: any) => (r.status || 'pending').toLowerCase() === 'pending')
)

const totalPendingCount = computed(() => allPendingReports.value.length)

const pendingReports = computed(() => allPendingReports.value.slice(0, 6))

function viewTarget(report: any) {
  const type = (report.type || '').toLowerCase()
  let path = '/'
  if (type === 'post') path = `/posts/${report.targetId}`
  else if (type === 'comment') {
    if (!report.targetPostId) {
      toast.info('Bình luận hoặc bài viết gốc đã bị xóa')
      return
    }
    path = `/posts/${report.targetPostId}#comment-${report.targetId}`
  }
  else if (type === 'group') path = `/groups/${report.targetId}`
  else if (type === 'user') path = `/profile/${report.targetId}`
  window.open(router.resolve(path).href, '_blank', 'noopener')
}
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
    <div class="flex items-center justify-between gap-2 mb-4">
      <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <ShieldAlert :size="18" class="text-amber-500 shrink-0" />
        <span>Báo cáo vi phạm chờ duyệt</span>
      </h3>
      <span
        v-if="totalPendingCount > 0"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50 shrink-0"
      >
        {{ totalPendingCount }}
      </span>
    </div>
    <div v-if="isLoading" class="space-y-3">
      <Skeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
    </div>
    <div v-else-if="pendingReports.length" class="space-y-3">
      <div
        v-for="report in pendingReports"
        :key="report.id"
        class="p-3.5 rounded-xl border border-gray-200/80 dark:border-surface-700 bg-gray-50/70 dark:bg-surface-700/40 hover:border-gray-300 dark:hover:border-surface-600 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <div class="flex items-center gap-1.5">
                <span :class="[
                  'text-[11px] font-semibold px-2 py-0.5 rounded-md border',
                  report.type === 'post' ? 'bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50' :
                  report.type === 'comment' ? 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-surface-600 dark:text-gray-200 dark:border-surface-500' :
                  'bg-teal-50 text-teal-700 border-teal-200/70 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50'
                ]">
                  {{ report.type === 'post' ? 'Bài viết' : report.type === 'comment' ? 'Bình luận' : report.type === 'group' ? 'Nhóm' : 'Người dùng' }}
                </span>
                <span :class="[
                  'text-[11px] font-semibold px-2 py-0.5 rounded-md border',
                  report.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50' :
                  report.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50' :
                  'bg-gray-100 text-gray-600 border-gray-200 dark:bg-surface-700 dark:text-gray-400 dark:border-surface-600'
                ]">
                  {{ report.status === 'pending' ? 'Chờ duyệt' : report.status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua' }}
                </span>
              </div>
              <span
                v-if="report.reporter?.name"
                class="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-40"
                :title="`Người báo cáo: ${report.reporter.name}`"
              >
                Báo cáo bởi <span class="font-medium text-gray-700 dark:text-gray-300">{{ report.reporter.name }}</span>
              </span>
            </div>
            <p @click="report.targetId && viewTarget(report)" class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 hover:underline cursor-pointer inline-flex items-center gap-1" title="Xem đối tượng bị báo cáo">{{ report.targetTitle }} <ExternalLink v-if="report.targetId" :size="11" class="shrink-0 opacity-60" /></p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              <span class="font-medium text-gray-700 dark:text-gray-300">Lý do báo cáo:</span> {{ report.reason }}
            </p>
          </div>
        </div>
        <div v-if="report.status === 'pending'" class="flex flex-wrap gap-1.5 mt-3">
          <button
            type="button"
            @click="emit('resolve', report.id, 'keep')"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-surface-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
            title="Giữ lại nội dung"
          >
            <Check :size="12" /> Giữ lại
          </button>
          <button
            v-if="report.type !== 'user' && (report.type !== 'group' || authStore.isAdmin)"
            type="button"
            @click="emit('resolve', report.id, 'delete')"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-surface-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Xóa / Ẩn nội dung vi phạm"
          >
            <X :size="12" /> Xóa
          </button>
          <button
            v-if="!(report.type === 'user' && String(report.targetId) === String(authStore.user?.id))"
            type="button"
            @click="emit('resolve', report.id, 'ban')"
            class="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-surface-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
            title="Khóa tác giả"
          >
            <Ban :size="12" />
            <span class="hidden xl:inline">Khóa tác giả</span>
          </button>
          <button
            type="button"
            @click="emit('dismiss', report.id)"
            class="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            title="Bỏ qua báo cáo"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-sm text-gray-500 text-center py-8">
      Không có báo cáo nào chờ duyệt
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShieldAlert, AlertTriangle } from '@lucide/vue'
import { useModeration } from '@/composables/core/useModeration'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import ModerationReportItem from './components/ModerationReportItem.vue'
import ModerationSkeletonItem from './components/ModerationSkeletonItem.vue'

const {
  extendedReports,
  isLoading,
  filterStatus,
  reportFilters,
  pendingCount
} = useModeration()
</script>

<template>
  <div class="p-6">
    <AdminPageHeader
      title="Kiểm duyệt nội dung"
      subtitle="Xem xét và xử lý các báo cáo vi phạm"
    >
      <template #title-icon>
        <ShieldAlert :size="24" class="text-red-500" />
      </template>
      <template #actions>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-xl">
          <AlertTriangle :size="14" class="text-red-500" />
          <span class="text-sm font-medium text-red-600 dark:text-red-400">{{ pendingCount }} đang chờ</span>
        </div>
      </template>
      <template #filters>
        <button v-for="f in reportFilters" :key="f.key" @click="filterStatus = f.key as any"
          :class="['px-4 py-2.5 rounded-xl text-sm font-medium transition-all', filterStatus === f.key ? 'bg-red-500 text-white' : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700']">
          {{ f.label }} <span class="ml-1 text-xs opacity-70">({{ f.count }})</span>
        </button>
      </template>
    </AdminPageHeader>

    <!-- Reports -->
    <div class="space-y-4">
      <template v-if="isLoading">
        <ModerationSkeletonItem v-for="i in 3" :key="i" />
      </template>
      <template v-else-if="extendedReports.length">
        <ModerationReportItem
          v-for="report in extendedReports.filter(r => filterStatus === 'all' || r.status === filterStatus)"
          :key="report.id"
          :report="report"
        />
      </template>
      <div v-else class="text-center py-16 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
        <ShieldAlert class="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Không có báo cáo nào</h3>
        <p class="text-gray-500">Hệ thống hiện tại sạch sẽ, không có vi phạm nào cần xử lý.</p>
      </div>
    </div>
  </div>
</template>

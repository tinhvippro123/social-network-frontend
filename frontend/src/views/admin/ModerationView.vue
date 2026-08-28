<script setup lang="ts">
import { ref } from 'vue'
import { ShieldAlert, Check, X, Ban, Eye, AlertTriangle, Clock } from '@lucide/vue'
import { mockReports } from '@/data/mockData'

const filterStatus = ref('pending')

const extendedReports = [
  ...mockReports,
  { id: 'r4', type: 'post' as const, reason: 'Nội dung sai sự thật, gây hiểu lầm', reporter: mockReports[0].reporter, targetId: 'p11', targetTitle: 'Bài viết quảng cáo thuốc...', status: 'pending' as const, createdAt: '2025-08-27T10:00:00' },
  { id: 'r5', type: 'comment' as const, reason: 'Spam link quảng cáo', reporter: mockReports[1].reporter, targetId: 'cm11', targetTitle: 'Comment chứa link quảng cáo...', status: 'pending' as const, createdAt: '2025-08-27T11:30:00' },
  { id: 'r6', type: 'post' as const, reason: 'Vi phạm bản quyền', reporter: mockReports[0].reporter, targetId: 'p12', targetTitle: 'Copy bài viết từ blog khác...', status: 'dismissed' as const, createdAt: '2025-08-24T09:00:00' },
]

const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert :size="24" class="text-red-500" />
          Kiểm duyệt nội dung
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Xem xét và xử lý các báo cáo vi phạm</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-xl">
        <AlertTriangle :size="14" class="text-red-500" />
        <span class="text-sm font-medium text-red-600 dark:text-red-400">{{ extendedReports.filter(r => r.status === 'pending').length }} đang chờ</span>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2 mb-6">
      <button v-for="f in [{key:'pending',label:'Đang chờ',count:extendedReports.filter(r=>r.status==='pending').length},{key:'resolved',label:'Đã xử lý',count:extendedReports.filter(r=>r.status==='resolved').length},{key:'dismissed',label:'Bỏ qua',count:extendedReports.filter(r=>r.status==='dismissed').length}]" :key="f.key" @click="filterStatus = f.key"
        :class="['px-4 py-2.5 rounded-xl text-sm font-medium transition-all', filterStatus === f.key ? 'bg-red-500 text-white' : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700']">
        {{ f.label }} <span class="ml-1 text-xs opacity-70">({{ f.count }})</span>
      </button>
    </div>

    <!-- Reports -->
    <div class="space-y-4">
      <div v-for="report in extendedReports.filter(r => filterStatus === 'all' || r.status === filterStatus)" :key="report.id"
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
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <img :src="report.reporter.avatar" class="w-4 h-4 rounded-full" />
                Báo cáo bởi {{ report.reporter.name }}
              </span>
              <span class="flex items-center gap-1"><Clock :size="10" /> {{ formatDate(report.createdAt) }}</span>
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
    </div>
  </div>
</template>

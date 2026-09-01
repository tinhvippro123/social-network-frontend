<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Users, FileText, Flag, BarChart3, TrendingUp, TrendingDown,
  Eye, ShieldAlert, Ban, Check, X, MoreVertical, Search as SearchIcon,
  ArrowUp, ArrowDown, UserPlus, AlertTriangle
} from '@lucide/vue'
import { useAdmin } from '@/composables/useAdmin'
import { onMounted } from 'vue'
import { formatNumber } from '@/utils/formatters'
import UserAvatar from '@/components/UserAvatar.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

const { stats, users, reports, fetchStats, fetchUsers, fetchReports } = useAdmin()

onMounted(async () => {
  await fetchStats()
  await fetchUsers()
  await fetchReports()
})
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const activeTab = ref('overview')

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Tổng người dùng', value: formatNumber(stats.value.totalUsers), change: `+${stats.value.newUsersToday} hôm nay`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Tổng bài viết', value: formatNumber(stats.value.totalPosts), change: `+${stats.value.newPostsToday} hôm nay`, icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Tổng nhóm', value: stats.value.totalGroups.toString(), change: '+3 tuần này', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Report đang chờ', value: stats.value.pendingReports.toString(), change: '2 cần xử lý gấp', icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10' },
  ]
})

const selectedPeriod = ref('7d')

const chartData = computed(() => ({
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [
    {
      label: 'Người dùng mới',
      data: stats.value?.userGrowth || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    },
    {
      label: 'Bài viết mới',
      data: stats.value?.postGrowth || [],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        color: '#9ca3af'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9ca3af'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      padding: 12,
      titleFont: { size: 13 },
      bodyFont: { size: 13 },
      cornerRadius: 8
    }
  }
}
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Quản trị</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổng quan hệ thống VietBlog</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="hidden sm:inline text-xs text-gray-400 bg-gray-100 dark:bg-surface-700 px-3 py-1.5 rounded-lg">
          Cập nhật: {{ new Date().toLocaleTimeString('vi-VN') }}
        </span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div
        v-for="stat in statCards"
        :key="stat.label"
        class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
            <p class="text-xs mt-2 flex items-center gap-1" :class="stat.color">
              <TrendingUp :size="12" />
              {{ stat.change }}
            </p>
          </div>
          <div :class="['p-3 rounded-xl', stat.bg]">
            <component :is="stat.icon" :size="22" :class="stat.color" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Placeholder -->
      <div class="lg:col-span-2 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 :size="18" class="text-primary-500" />
            Thống kê tuần này
          </h3>
          <select class="text-xs bg-gray-100 dark:bg-surface-700 border-none rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-400">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>3 tháng qua</option>
          </select>
        </div>

        <!-- Chart bars -->
        <div class="h-64 mt-4 relative w-full">
          <Line :data="chartData" :options="chartOptions" />
        </div>

        <div class="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-surface-700">
          <span class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span class="w-3 h-3 rounded-sm bg-blue-500" /> Người dùng mới
          </span>
          <span class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span class="w-3 h-3 rounded-sm bg-green-500" /> Bài viết mới
          </span>
        </div>
      </div>

      <!-- Moderation Queue -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <ShieldAlert :size="18" class="text-red-500" />
          Hàng đợi kiểm duyệt
        </h3>
        <div class="space-y-3">
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
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mt-6 overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-surface-700">
        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users :size="18" class="text-primary-500" />
          Quản lý người dùng
        </h3>
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-1.5">
          <SearchIcon :size="14" class="text-gray-400" />
          <input type="text" placeholder="Tìm kiếm..." class="bg-transparent border-none outline-none text-xs text-gray-600 dark:text-gray-400 placeholder-gray-400 w-32" />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-surface-700">
              <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Người dùng</th>
              <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden sm:table-cell">Email</th>
              <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Vai trò</th>
              <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden md:table-cell">Bài viết</th>
              <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b border-gray-100 dark:border-surface-700/50 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <UserAvatar :user="user" size="sm" />
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
                    <p class="text-xs text-gray-400">Tham gia {{ new Date(user.joinedAt).toLocaleDateString('vi-VN') }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ user.email }}</td>
              <td class="px-5 py-3">
                <span :class="[
                  'px-2.5 py-1 rounded-lg text-xs font-medium',
                  user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                  user.role === 'moderator' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                  'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
                ]">
                  {{ user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Mod' : 'User' }}
                </span>
              </td>
              <td class="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{{ user.postsCount }}</td>
              <td class="px-5 py-3">
                <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                  <MoreVertical :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

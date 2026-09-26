<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Users, FileText, Flag, BarChart3, TrendingUp, TrendingDown,
  Eye, ShieldAlert, Ban, Check, X, MoreVertical, Search as SearchIcon,
  ArrowUp, ArrowDown, UserPlus, AlertTriangle
} from '@lucide/vue'
import { useAdminDashboard } from '@/composables/admin/useAdminDashboard'
import { formatNumber } from '@/utils/formatters'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import ModerationQueueWidget from './components/ModerationQueueWidget.vue'
import UsersTableWidget from './components/UsersTableWidget.vue'
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

const {
  stats,
  users,
  reports,
  isLoading,
  activeTab,
  selectedPeriod,
  statCards,
  chartData,
  chartOptions
} = useAdminDashboard()

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
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <Skeleton class="h-4 w-24 mb-2 rounded" />
          <Skeleton class="h-8 w-16 mb-2 rounded" />
          <Skeleton class="h-4 w-32 rounded" />
        </div>
      </template>
      <template v-else-if="statCards.length">
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
      </template>
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
          <Skeleton v-if="isLoading" class="w-full h-full rounded-xl" />
          <Line v-else :data="chartData" :options="chartOptions" />
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
      <ModerationQueueWidget :reports="reports" :isLoading="isLoading" />
    </div>

    <!-- Users Table -->
    <UsersTableWidget :users="users" :isLoading="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BarChart3, TrendingUp, Users, FileText, Eye, ArrowUp, MessageCircle } from '@lucide/vue'
import { useAdmin } from '@/composables/useAdmin'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useAdminAnalytics } from '@/composables/useAdminAnalytics'

const { stats, isLoading, timeRange } = useAdminAnalytics()

</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 :size="24" class="text-red-500" />
          Thống kê chi tiết
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Phân tích dữ liệu hoạt động hệ thống</p>
      </div>
      <select v-model="timeRange" class="bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl px-4 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50">
        <option value="7d">7 ngày qua</option>
        <option value="30d">30 ngày qua</option>
        <option value="90d">3 tháng qua</option>
        <option value="1y">1 năm qua</option>
      </select>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <Skeleton class="h-4 w-24 mb-2 rounded" />
          <Skeleton class="h-8 w-16 mb-2 rounded" />
        </div>
      </template>
      <template v-else-if="stats">
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Tổng người dùng</h3>
          <div class="flex items-end gap-3">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.totalUsers.toLocaleString() }}</span>
            <span class="text-sm font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">
              +{{ stats.newUsersToday }}
            </span>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Tổng bài viết</h3>
          <div class="flex items-end gap-3">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.totalPosts.toLocaleString() }}</span>
            <span class="text-sm font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">
              +{{ stats.newPostsToday }}
            </span>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Lượt xem hôm nay</h3>
          <div class="flex items-end gap-3">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.viewsToday.total.toLocaleString() }}</span>
            <span class="text-sm font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">
              +{{ stats.viewsToday.growthPct }}%
            </span>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Báo cáo chờ xử lý</h3>
          <div class="flex items-end gap-3">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.pendingReports }}</span>
            <span class="text-sm font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg">
              Cần xử lý
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <template v-if="isLoading">
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <Skeleton class="h-6 w-48 mb-6 rounded" />
          <Skeleton class="h-48 w-full rounded-lg" />
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <Skeleton class="h-6 w-48 mb-6 rounded" />
          <Skeleton class="h-48 w-full rounded-lg" />
        </div>
      </template>
      <template v-else-if="stats">
        <!-- User Growth Chart -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="font-bold text-gray-900 dark:text-white mb-6">Tăng trưởng người dùng</h3>
          <div class="flex items-end justify-between gap-2 h-48">
            <div v-for="(val, i) in stats.userGrowth" :key="i" class="flex-1 flex flex-col items-center gap-2">
              <span class="text-xs text-gray-400 font-medium">{{ val }}</span>
              <div class="w-full bg-linear-to-t from-red-500 to-orange-400 rounded-t-lg transition-all duration-700" :style="{ height: `${(val / Math.max(...stats.userGrowth)) * 140}px` }" />
              <span class="text-xs text-gray-400">{{ ['T2','T3','T4','T5','T6','T7','CN'][i] }}</span>
            </div>
          </div>
        </div>

        <!-- Post Growth Chart -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="font-bold text-gray-900 dark:text-white mb-6">Bài viết mới theo ngày</h3>
          <div class="flex items-end justify-between gap-2 h-48">
            <div v-for="(val, i) in stats.postGrowth" :key="i" class="flex-1 flex flex-col items-center gap-2">
              <span class="text-xs text-gray-400 font-medium">{{ val }}</span>
              <div class="w-full bg-linear-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-700" :style="{ height: `${(val / Math.max(...stats.postGrowth)) * 140}px` }" />
              <span class="text-xs text-gray-400">{{ ['T2','T3','T4','T5','T6','T7','CN'][i] }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Top content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Top danh mục</h3>
        <div class="space-y-3" v-if="stats">
          <div v-for="(cat, i) in stats.topCategories" :key="i" class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">{{ cat.name }}</span>
            <div class="flex-1 h-2 bg-gray-100 dark:bg-surface-700 rounded-full overflow-hidden">
              <div class="h-full rounded-full bg-linear-to-r from-red-500 to-orange-400 transition-all duration-700" :style="{ width: `${cat.pct}%` }" />
            </div>
            <span class="text-xs text-gray-400 w-16 text-right">{{ cat.count }} bài</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Hoạt động gần đây</h3>
        <div class="space-y-3" v-if="stats">
          <div v-for="(act, i) in stats.recentActivities" :key="i" class="flex items-start gap-3">
            <div :class="['w-2 h-2 rounded-full mt-1.5 shrink-0', act.color.replace('text-', 'bg-')]" />
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ act.text }}</p>
              <p class="text-xs text-gray-400">{{ act.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BarChart3, TrendingUp, Users, FileText, Eye, ArrowUp, MessageCircle } from '@lucide/vue'
import { mockAdminStats } from '@/data/mockData'

const stats = ref(mockAdminStats)
const timeRange = ref('7d')

const recentActivities = [
  { text: 'Nguyễn Văn An đăng bài mới', time: '5 phút trước', color: 'text-green-500' },
  { text: '3 báo cáo mới cần xử lý', time: '15 phút trước', color: 'text-red-500' },
  { text: 'Nhóm Vue.js Vietnam đạt 5000 thành viên', time: '1 giờ trước', color: 'text-blue-500' },
  { text: 'Trần Thị Mai được nâng lên Moderator', time: '2 giờ trước', color: 'text-purple-500' },
  { text: 'Bài viết Docker đạt 5000 lượt xem', time: '3 giờ trước', color: 'text-orange-500' },
]
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
      <div v-for="s in [
        { label: 'Lượt xem', value: '45.2k', change: '+12%', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Bài viết mới', value: '324', change: '+8%', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Upvotes', value: '12.8k', change: '+23%', icon: ArrowUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Bình luận', value: '5.6k', change: '+15%', icon: MessageCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      ]" :key="s.label"
        class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <div class="flex items-center justify-between mb-3">
          <div :class="['p-2.5 rounded-xl', s.bg]"><component :is="s.icon" :size="18" :class="s.color" /></div>
          <span class="text-xs font-medium text-green-500 flex items-center gap-0.5"><TrendingUp :size="10" /> {{ s.change }}</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ s.value }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ s.label }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>

    <!-- Top content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Top danh mục</h3>
        <div class="space-y-3">
          <div v-for="(cat, i) in [{name:'Lập trình',count:256,pct:35},{name:'AI & ML',count:145,pct:20},{name:'Công nghệ',count:128,pct:17},{name:'Mobile',count:93,pct:13},{name:'Thiết kế',count:89,pct:12}]" :key="i" class="flex items-center gap-3">
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
        <div class="space-y-3">
          <div v-for="(act, i) in recentActivities" :key="i" class="flex items-start gap-3">
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

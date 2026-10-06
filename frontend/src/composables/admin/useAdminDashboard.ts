import { ref, computed, onMounted } from 'vue'
import {
  Users, FileText, Flag
} from '@lucide/vue'
import { useAdmin } from './useAdmin'
import { formatNumber } from '@/utils/formatters'

export function useAdminDashboard() {
  const { stats, users, reports, isLoading, fetchStats, fetchUsers, fetchReports } = useAdmin()
  
  const activeTab = ref('overview')
  const selectedPeriod = ref('7d')

  const statCards = computed(() => {
    if (!stats.value) return []
    return [
      { label: 'Tổng người dùng', value: formatNumber(stats.value.totalUsers), change: `+${stats.value.newUsersToday} hôm nay`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Tổng bài viết', value: formatNumber(stats.value.totalPosts), change: `+${stats.value.newPostsToday} hôm nay`, icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
      { label: 'Tổng nhóm', value: stats.value.totalGroups.toString(), change: '+3 tuần này', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { label: 'Report đang chờ', value: stats.value.pendingReports.toString(), change: '2 cần xử lý gấp', icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10' },
    ]
  })

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
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          color: '#9ca3af'
        }
      }
    }
  }

  const initData = async () => {
    await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchReports()
    ])
  }

  onMounted(async () => {
    await initData()
  })

  return {
    stats,
    users,
    reports,
    isLoading,
    activeTab,
    selectedPeriod,
    statCards,
    chartData,
    chartOptions,
    initData
  }
}

import { ref, computed, onMounted, watch } from 'vue'
import {
  Users, FileText, Flag
} from '@lucide/vue'
import { useAdmin } from './useAdmin'
import adminApi from '@/api/admin.api'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'
import { formatNumber } from '@/utils/formatters'

export function useAdminDashboard() {
  const toast = useToast()
  const { confirm } = useConfirm()
  const { stats, users, reports, isLoading, fetchStats, fetchUsers, fetchReports } = useAdmin()
  
  const activeTab = ref('overview')
  const selectedPeriod = ref<'7d' | '30d' | '90d'>('7d')

  const periodTitle = computed(() => {
    switch (selectedPeriod.value) {
      case '30d':
        return 'Thống kê 30 ngày qua'
      case '90d':
        return 'Thống kê 3 tháng qua'
      default:
        return 'Thống kê 7 ngày qua'
    }
  })

  watch(selectedPeriod, async (newVal) => {
    const days = newVal === '90d' ? 90 : newVal === '30d' ? 30 : 7
    await fetchStats(days)
  })

  const statCards = computed(() => {
    if (!stats.value) return []
    return [
      { label: 'Tổng người dùng', value: formatNumber(stats.value.totalUsers), change: `+${stats.value.newUsersToday} hôm nay`, trend: (stats.value.newUsersToday > 0 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Tổng bài viết', value: formatNumber(stats.value.totalPosts), change: `+${stats.value.newPostsToday} hôm nay`, trend: (stats.value.newPostsToday > 0 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
      { label: 'Tổng nhóm', value: stats.value.totalGroups.toString(), change: `${formatNumber(stats.value.totalComments)} bình luận`, trend: 'neutral' as 'up' | 'down' | 'neutral', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { label: 'Report đang chờ', value: stats.value.pendingReports.toString(), change: stats.value.pendingReports > 0 ? `${stats.value.pendingReports} cần xử lý` : 'Đã xử lý hết', trend: (stats.value.pendingReports > 0 ? 'down' : 'up') as 'up' | 'down' | 'neutral', icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10' },
    ]
  })

  const chartData = computed(() => ({
    labels: stats.value?.growthLabels || [],
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

  const resolveReport = async (reportId: string, action: 'keep' | 'delete' | 'ban') => {
    if (action === 'delete' || action === 'ban') {
      const ok = await confirm({
        title: action === 'ban' ? 'Cấm tác giả & xử lý báo cáo' : 'Xóa nội dung bị báo cáo',
        message: action === 'ban' ? 'Bạn có chắc muốn cấm tài khoản vi phạm này?' : 'Bạn có chắc muốn xóa/ẩn nội dung vi phạm này?',
        confirmText: action === 'ban' ? 'Cấm tài khoản' : 'Xóa nội dung',
        variant: 'danger'
      })
      if (!ok) return
    }
    try {
      await adminApi.resolveReport(reportId, action)
      toast.success('Đã xử lý báo cáo thành công!')
      const days = selectedPeriod.value === '90d' ? 90 : selectedPeriod.value === '30d' ? 30 : 7
      await Promise.all([fetchStats(days), fetchReports({ limit: 100 })])
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xử lý báo cáo')
    }
  }

  const initData = async () => {
    const days = selectedPeriod.value === '90d' ? 90 : selectedPeriod.value === '30d' ? 30 : 7
    await Promise.all([
      fetchStats(days),
      fetchUsers(),
      fetchReports({ limit: 100 })
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
    periodTitle,
    statCards,
    chartData,
    chartOptions,
    initData,
    resolveReport
  }
}

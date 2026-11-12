import { ref, watch, onMounted } from 'vue'
import { useAdmin } from './useAdmin'

export type AnalyticsRange = '7d' | '30d' | '90d' | '1y'

const RANGE_DAYS: Record<AnalyticsRange, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }

export function useAdminAnalytics() {
  const { stats, isLoading, fetchStats } = useAdmin()
  const timeRange = ref<AnalyticsRange>('7d')

  const initData = () => fetchStats(RANGE_DAYS[timeRange.value])

  // Đổi khoảng thời gian → gọi lại API với số ngày tương ứng
  watch(timeRange, () => initData())

  onMounted(initData)

  return {
    stats,
    isLoading,
    timeRange,
    initData
  }
}

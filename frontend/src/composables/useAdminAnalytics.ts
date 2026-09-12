import { ref, onMounted } from 'vue'
import { useAdmin } from './useAdmin'

export function useAdminAnalytics() {
  const { stats, isLoading, fetchStats } = useAdmin()
  const timeRange = ref('7d')

  const initData = () => {
    fetchStats()
  }

  onMounted(async () => {
    await initData()
  })

  return {
    stats,
    isLoading,
    timeRange,
    initData
  }
}

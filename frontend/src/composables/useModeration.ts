import { ref, computed, onMounted } from 'vue'
import { ADMIN_REPORT_FILTERS } from '@/constants/ui'
import { useAdmin } from './useAdmin'

export function useModeration() {
  const { reports: extendedReports, isLoading, fetchReports } = useAdmin()
  const filterStatus = ref('pending')

  const reportFilters = computed(() => {
    return ADMIN_REPORT_FILTERS.map(filter => {
      let count = 0
      if (filter.key === 'all') count = extendedReports.value.length
      else count = extendedReports.value.filter(r => r.status === filter.key).length
      return { ...filter, count }
    })
  })

  const pendingCount = computed(() => 
    extendedReports.value.filter(r => r.status === 'pending').length
  )

  const initData = async () => {
    await fetchReports()
  }

  onMounted(async () => {
    await initData()
  })

  return {
    extendedReports,
    isLoading,
    filterStatus,
    reportFilters,
    pendingCount,
    initData
  }
}

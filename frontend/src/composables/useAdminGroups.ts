import { onMounted } from 'vue'
import { useGroups } from './useGroups'

export function useAdminGroups() {
  const { groups, isLoading, fetchGroups } = useGroups()

  const initData = () => {
    fetchGroups()
  }

  onMounted(async () => {
    await initData()
  })

  return {
    groups,
    isLoading,
    initData
  }
}

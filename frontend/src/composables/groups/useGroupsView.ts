import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroups } from './useGroups'
import { useGroupFilter } from './useGroupFilter'

export function useGroupsView() {
  const { groups, isLoading, fetchGroups } = useGroups()
  const router = useRouter()
  const showCreateModal = ref(false)
  const { searchGroup, filterType, filteredGroups } = useGroupFilter(groups)

  const initData = async () => {
    await fetchGroups()
  }

  onMounted(() => {
    initData()
  })

  return {
    router,
    isLoading,
    showCreateModal,
    searchGroup,
    filterType,
    filteredGroups,
    initData
  }
}

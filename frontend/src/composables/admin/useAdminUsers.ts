import { ref, onMounted } from 'vue'
import { useAdmin } from './useAdmin'

export function useAdminUsers() {
  const { users: allUsers, isLoading, fetchUsers } = useAdmin()
  const searchQuery = ref('')
  const filterRole = ref('all')
  const currentPage = ref(1)

  const initData = () => {
    fetchUsers()
  }

  onMounted(async () => {
    await initData()
  })

  return {
    allUsers,
    isLoading,
    searchQuery,
    filterRole,
    currentPage,
    initData
  }
}

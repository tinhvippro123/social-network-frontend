import { ref } from 'vue'
import usersApi from '@/api/users.api'
import { useAsyncState } from './useAsyncState'

export function useUsers() {
  const users = ref<any[]>([])
  const { isLoading, error, execute } = useAsyncState()

  async function fetchUsers() {
    await execute(async () => {
      const { data } = await usersApi.getAll()
      users.value = data.data
    }, 'Không thể tải danh sách người dùng')
  }

  return {
    users,
    isLoading,
    error,
    fetchUsers,
  }
}

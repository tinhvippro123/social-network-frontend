import { ref } from 'vue'
import { mockUsers } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function useUsers() {
  const users = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    isLoading.value = true
    error.value = null
    try {
      await delay(500)
      users.value = mockUsers
    } catch (err: any) {
      error.value = err.message || 'Không thể tải danh sách người dùng'
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    isLoading,
    error,
    fetchUsers,
  }
}

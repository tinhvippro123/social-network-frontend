import { ref } from 'vue'
import adminApi from '@/api/admin.api'
import type { AdminStats, Report, User } from '@/types'

import { useAsyncState } from './useAsyncState'

export function useAdmin() {
  const stats = ref<AdminStats | null>(null)
  const users = ref<User[]>([])
  const reports = ref<Report[]>([])
  const { isLoading, error, execute } = useAsyncState()

  async function fetchStats() {
    await execute(async () => {
      const { data } = await adminApi.getStats()
      stats.value = data.data
    }, 'Không thể tải thống kê')
  }

  async function fetchUsers(params?: any) {
    await execute(async () => {
      const { data } = await adminApi.getUsers(params)
      users.value = data.data
    }, 'Không thể tải người dùng')
  }

  async function fetchReports(params?: any) {
    await execute(async () => {
      const { data } = await adminApi.getReports(params)
      reports.value = data.data
    }, 'Không thể tải báo cáo')
  }

  return {
    stats,
    users,
    reports,
    isLoading,
    error,
    fetchStats,
    fetchUsers,
    fetchReports,
  }
}

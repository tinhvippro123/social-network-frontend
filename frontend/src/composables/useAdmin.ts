import { ref } from 'vue'
import adminApi from '@/api/admin.api'
import type { AdminStats, Report, User } from '@/types'

export function useAdmin() {
  const stats = ref<AdminStats | null>(null)
  const users = ref<User[]>([])
  const reports = ref<Report[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    isLoading.value = true
    try {
      const { data } = await adminApi.getStats()
      stats.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không thể tải thống kê'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUsers(params?: any) {
    isLoading.value = true
    try {
      const { data } = await adminApi.getUsers(params)
      users.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không thể tải người dùng'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReports(params?: any) {
    isLoading.value = true
    try {
      const { data } = await adminApi.getReports(params)
      reports.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không thể tải báo cáo'
    } finally {
      isLoading.value = false
    }
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

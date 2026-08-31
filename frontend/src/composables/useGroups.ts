import { ref, reactive } from 'vue'
import groupsApi from '@/api/groups.api'
import type { Group } from '@/types'

export function useGroups() {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchGroups(params?: any) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await groupsApi.getAll(params)
      groups.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không thể tải danh sách nhóm'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGroup(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await groupsApi.getById(id)
      currentGroup.value = data.data
    } catch (err: any) {
      error.value = err.message || 'Không tìm thấy nhóm'
    } finally {
      isLoading.value = false
    }
  }

  return {
    groups,
    currentGroup,
    isLoading,
    error,
    fetchGroups,
    fetchGroup,
  }
}

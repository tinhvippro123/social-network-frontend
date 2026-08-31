import { ref, reactive } from 'vue'
import groupsApi from '@/api/groups.api'
import type { Group } from '@/types'

import { useAsyncState } from './useAsyncState'

export function useGroups() {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const { isLoading, error, execute } = useAsyncState()

  async function fetchGroups(params?: any) {
    await execute(async () => {
      const { data } = await groupsApi.getAll(params)
      groups.value = data.data
    }, 'Không thể tải danh sách nhóm')
  }

  async function fetchGroup(id: string) {
    await execute(async () => {
      const { data } = await groupsApi.getById(id)
      currentGroup.value = data.data
    }, 'Không tìm thấy nhóm')
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

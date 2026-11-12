import { ref } from 'vue'
import groupsApi, { type CreateGroupRequest, type GroupMemberItem, type GroupPostItem } from '@/api/groups.api'
import type { Group } from '@/types'
import { useAsyncState } from '../core/useAsyncState'

export function useGroups() {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const groupPosts = ref<GroupPostItem[]>([])
  const groupMembers = ref<GroupMemberItem[]>([])
  const { isLoading, error, execute } = useAsyncState()

  async function fetchGroups(params?: any) {
    await execute(async () => {
      const { data } = await groupsApi.getAll(params)
      groups.value = data.data || []
    }, 'Không thể tải danh sách nhóm')
  }

  async function fetchGroup(id: string) {
    await execute(async () => {
      const { data } = await groupsApi.getById(id)
      currentGroup.value = data.data
    }, 'Không tìm thấy nhóm')
  }

  async function joinGroup(id: string) {
    try {
      const { data } = await groupsApi.join(id)
      if (currentGroup.value && currentGroup.value.id === id) {
        currentGroup.value = data.data
      }
      const g = groups.value.find(item => item.id === id)
      if (g) {
        g.isJoined = true
        g.membersCount += 1
      }
    } catch (err) {
      console.error('Lỗi tham gia nhóm:', err)
      throw err
    }
  }

  async function leaveGroup(id: string) {
    try {
      await groupsApi.leave(id)
      if (currentGroup.value && currentGroup.value.id === id) {
        currentGroup.value.isJoined = false
        currentGroup.value.membersCount = Math.max(0, currentGroup.value.membersCount - 1)
      }
      const g = groups.value.find(item => item.id === id)
      if (g) {
        g.isJoined = false
        g.membersCount = Math.max(0, g.membersCount - 1)
      }
    } catch (err) {
      console.error('Lỗi rời nhóm:', err)
      throw err
    }
  }

  async function createGroup(payload: CreateGroupRequest) {
    return await execute(async () => {
      const { data } = await groupsApi.create(payload)
      groups.value.unshift(data.data)
      return data.data
    }, 'Không thể tạo nhóm mới')
  }

  async function fetchGroupPosts(groupId: string, page = 1, limit = 20) {
    try {
      const { data } = await groupsApi.getPosts(groupId, { page, limit })
      groupPosts.value = data.data || []
    } catch (err) {
      console.error('Lỗi lấy bài viết nhóm:', err)
      groupPosts.value = []
    }
  }

  async function fetchGroupMembers(groupId: string, page = 1, limit = 20) {
    try {
      const { data } = await groupsApi.getMembers(groupId, { page, limit })
      groupMembers.value = data.data || []
    } catch (err) {
      console.error('Lỗi lấy thành viên nhóm:', err)
      groupMembers.value = []
    }
  }

  return {
    groups,
    currentGroup,
    groupPosts,
    groupMembers,
    isLoading,
    error,
    fetchGroups,
    fetchGroup,
    joinGroup,
    leaveGroup,
    createGroup,
    fetchGroupPosts,
    fetchGroupMembers
  }
}

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroups } from './useGroups'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'
import groupsApi from '@/api/groups.api'

export function useGroupDetail() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const toast = useToast()
  const { confirm } = useConfirm()
  const {
    currentGroup: group,
    groupPosts: posts,
    groupMembers: users,
    isLoading: isGroupLoading,
    fetchGroup,
    fetchGroupPosts,
    fetchGroupMembers,
    joinGroup,
    leaveGroup
  } = useGroups()

  const isPostsLoading = ref(false)
  const isUsersLoading = ref(false)
  const activeTab = ref('posts')

  const isGroupOwner = computed(() => {
    const myId = authStore.user?.id
    if (!myId || !group.value) return false
    return (group.value as any).myRole === 'OWNER' || group.value.owner?.id === myId
  })

  const isGroupManager = computed(() => {
    const role = (group.value as any)?.myRole
    return isGroupOwner.value || role === 'ADMIN'
  })

  const initData = async () => {
    const groupId = (route.params.id as string) || ''
    if (!groupId) return

    isPostsLoading.value = true
    isUsersLoading.value = true

    try {
      await fetchGroup(groupId)
    } finally {
      Promise.all([
        fetchGroupPosts(groupId).finally(() => { isPostsLoading.value = false }),
        fetchGroupMembers(groupId).finally(() => { isUsersLoading.value = false })
      ])
    }
  }

  async function handleToggleJoin() {
    if (!group.value?.id) return
    if (group.value.isJoined) {
      await leaveGroup(group.value.id)
    } else {
      await joinGroup(group.value.id)
    }
    fetchGroupMembers(group.value.id)
  }

  async function handleToggleMemberRole(memberItem: any) {
    if (!group.value?.id || !isGroupOwner.value) return
    const targetUser = memberItem.user || memberItem
    const nextRole: 'ADMIN' | 'MEMBER' = memberItem.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
    try {
      await groupsApi.updateMemberRole(group.value.id, targetUser.id, nextRole)
      memberItem.role = nextRole
      toast.success(
        nextRole === 'ADMIN'
          ? `Đã bổ nhiệm ${targetUser.name} làm Quản trị viên nhóm`
          : `Đã chuyển ${targetUser.name} về Thành viên`
      )
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thay đổi vai trò thành viên')
    }
  }

  async function handleRemoveMember(memberItem: any) {
    if (!group.value?.id || !isGroupManager.value) return
    const targetUser = memberItem.user || memberItem
    const ok = await confirm({
      title: 'Mời khỏi nhóm',
      message: `Bạn có chắc muốn mời "${targetUser.name}" ra khỏi nhóm?`,
      confirmText: 'Mời khỏi nhóm',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await groupsApi.removeMember(group.value.id, targetUser.id)
      users.value = users.value.filter((u: any) => (u.user?.id || u.id) !== targetUser.id)
      if (group.value.membersCount > 0) {
        group.value.membersCount -= 1
      }
      toast.success(`Đã mời ${targetUser.name} khỏi nhóm`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa thành viên khỏi nhóm')
    }
  }

  onMounted(async () => {
    await initData()
  })

  return {
    router,
    group,
    isGroupLoading,
    posts,
    isPostsLoading,
    users,
    isUsersLoading,
    activeTab,
    isGroupOwner,
    isGroupManager,
    initData,
    handleToggleJoin,
    handleToggleMemberRole,
    handleRemoveMember
  }
}

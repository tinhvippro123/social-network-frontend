import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroups } from './useGroups'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'
import groupsApi from '@/api/groups.api'

export function useGroupDetail() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const uiStore = useUiStore()
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

  const isSystemMod = computed(() =>
    ['admin', 'moderator'].includes((authStore.user?.role || '').toLowerCase())
  )

  const isGroupOwner = computed(() => {
    const myId = authStore.user?.id
    if (!myId || !group.value) return false
    const role = (group.value as any).memberRole || (group.value as any).myRole
    return role === 'OWNER' || group.value.owner?.id === myId
  })

  const isGroupManager = computed(() => {
    const role = (group.value as any)?.memberRole || (group.value as any)?.myRole
    return isGroupOwner.value || role === 'ADMIN' || isSystemMod.value
  })

  const canViewContent = computed(() => {
    if (!group.value) return false
    return Boolean(group.value.isPublic || group.value.isJoined || isGroupManager.value)
  })

  const initData = async () => {
    const groupId = (route.params.id as string) || ''
    if (!groupId) return

    isPostsLoading.value = true
    isUsersLoading.value = true

    try {
      await fetchGroup(groupId)
      if (canViewContent.value) {
        await Promise.all([
          fetchGroupPosts(groupId).finally(() => { isPostsLoading.value = false }),
          fetchGroupMembers(groupId).finally(() => { isUsersLoading.value = false })
        ])
      } else {
        posts.value = []
        users.value = []
        isPostsLoading.value = false
        isUsersLoading.value = false
      }
    } catch {
      isPostsLoading.value = false
      isUsersLoading.value = false
    }
  }

  async function handleToggleJoin() {
    if (!group.value?.id) return
    if (!authStore.isLoggedIn) {
      toast.info('Vui lòng đăng nhập để tham gia nhóm')
      uiStore.openAuthModal('login')
      return
    }
    try {
      if (group.value.isJoined) {
        if (isGroupOwner.value) {
          toast.info('Trưởng nhóm không thể rời nhóm. Bạn có thể giải tán nhóm nếu muốn.')
          return
        }
        const ok = await confirm({
          title: 'Rời khỏi nhóm',
          message: `Bạn có chắc chắn muốn rời khỏi nhóm "${group.value.name}"?`,
          confirmText: 'Rời nhóm',
          variant: 'danger'
        })
        if (!ok) return

        await leaveGroup(group.value.id)
        toast.info(`Đã rời khỏi nhóm "${group.value.name}"`)
        if (canViewContent.value) {
          await fetchGroupMembers(group.value.id)
        } else {
          posts.value = []
          users.value = []
        }
      } else {
        await joinGroup(group.value.id)
        toast.success(`Đã tham gia nhóm "${group.value.name}"`)
        await Promise.all([
          fetchGroupPosts(group.value.id),
          fetchGroupMembers(group.value.id)
        ])
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái tham gia nhóm')
    }
  }

  async function handleUpdateGroup(payload: {
    name: string
    description?: string
    avatar?: string
    coverImage?: string
    isPublic?: boolean
  }) {
    if (!group.value?.id || !isGroupManager.value) return false
    try {
      const res = await groupsApi.update(group.value.id, payload)
      if (res.data?.data) {
        group.value = { ...group.value, ...res.data.data }
      }
      toast.success('Đã cập nhật thông tin nhóm')
      return true
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật thông tin nhóm')
      return false
    }
  }

  async function handleDeleteGroup() {
    if (!group.value?.id || (!isGroupOwner.value && !isSystemMod.value)) return
    const ok = await confirm({
      title: 'Giải tán nhóm',
      message: `Bạn có chắc chắn muốn giải tán nhóm "${group.value.name}"? Toàn bộ bài thảo luận và thành viên trong nhóm sẽ bị xóa vĩnh viễn.`,
      confirmText: 'Giải tán nhóm',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await groupsApi.delete(group.value.id)
      toast.success(`Đã giải tán nhóm "${group.value.name}"`)
      router.push('/groups')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể giải tán nhóm')
    }
  }

  async function handleDeleteGroupPost(postId: string) {
    if (!group.value?.id || !postId) return false
    const ok = await confirm({
      title: 'Xóa bài thảo luận',
      message: 'Bạn có chắc chắn muốn xóa bài thảo luận này khỏi nhóm?',
      confirmText: 'Xóa bài viết',
      variant: 'danger'
    })
    if (!ok) return false

    try {
      await groupsApi.deletePost(group.value.id, postId)
      posts.value = posts.value.filter((p: any) => p.id !== postId)
      if (group.value.postsCount > 0) {
        group.value.postsCount -= 1
      }
      toast.success('Đã xóa bài thảo luận khỏi nhóm')
      return true
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa bài thảo luận')
      return false
    }
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

  watch(() => route.params.id, async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await initData()
    }
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
    isSystemMod,
    isGroupOwner,
    isGroupManager,
    canViewContent,
    initData,
    handleToggleJoin,
    handleUpdateGroup,
    handleDeleteGroup,
    handleDeleteGroupPost,
    handleToggleMemberRole,
    handleRemoveMember
  }
}

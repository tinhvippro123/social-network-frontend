import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroups } from './useGroups'
import { useGroupFilter } from './useGroupFilter'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'

export function useGroupsView() {
  const { groups, isLoading, fetchGroups, joinGroup, leaveGroup } = useGroups()
  const router = useRouter()
  const authStore = useAuthStore()
  const toast = useToast()
  const { confirm } = useConfirm()
  const showCreateModal = ref(false)
  const { searchGroup, filterType, filteredGroups } = useGroupFilter(groups)

  const initData = async () => {
    await fetchGroups()
  }

  const openCreateModal = () => {
    if (!authStore.isLoggedIn) {
      toast.info('Vui lòng đăng nhập để tạo nhóm mới')
      router.push('/login')
      return
    }
    showCreateModal.value = true
  }

  const handleToggleJoin = async (targetGroup: any) => {
    if (!targetGroup?.id) return
    if (!authStore.isLoggedIn) {
      toast.info('Vui lòng đăng nhập để tham gia nhóm')
      router.push('/login')
      return
    }
    const myId = authStore.user?.id
    const role = targetGroup.memberRole || targetGroup.myRole
    const isOwner = myId && (role === 'OWNER' || targetGroup.owner?.id === myId)

    try {
      if (targetGroup.isJoined) {
        if (isOwner) {
          router.push(`/groups/${targetGroup.id}`)
          return
        }
        const ok = await confirm({
          title: 'Rời khỏi nhóm',
          message: `Bạn có chắc chắn muốn rời khỏi nhóm "${targetGroup.name}"?`,
          confirmText: 'Rời nhóm',
          variant: 'danger'
        })
        if (!ok) return

        await leaveGroup(targetGroup.id)
        toast.info(`Đã rời khỏi nhóm "${targetGroup.name}"`)
      } else {
        await joinGroup(targetGroup.id)
        toast.success(`Đã tham gia nhóm "${targetGroup.name}"`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái tham gia nhóm')
    }
  }

  onMounted(() => {
    initData()
  })

  return {
    router,
    isLoading,
    showCreateModal,
    searchGroup,
    filterType,
    filteredGroups,
    initData,
    openCreateModal,
    handleToggleJoin
  }
}

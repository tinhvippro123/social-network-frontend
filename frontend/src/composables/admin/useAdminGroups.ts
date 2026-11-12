import { matchesQuery } from '@/utils/textSearch'
import { ref, computed, onMounted } from 'vue'
import { useGroups } from '../groups/useGroups'
import groupsApi from '@/api/groups.api'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'

export function useAdminGroups() {
  const { groups, isLoading, fetchGroups } = useGroups()
  const toast = useToast()
  const { confirm } = useConfirm()

  const searchQuery = ref('')
  const privacyFilter = ref<'all' | 'public' | 'private'>('all')

  const filteredGroups = computed(() => {
    return (groups.value || []).filter((g: any) => {
      const matchesSearch = matchesQuery(searchQuery.value, g.name, g.description)
      const isPublic = g.isPublic !== false && g.privacy !== 'private'
      const matchesPrivacy = privacyFilter.value === 'all' ||
        (privacyFilter.value === 'public' && isPublic) ||
        (privacyFilter.value === 'private' && !isPublic)
      return matchesSearch && matchesPrivacy
    })
  })

  const initData = () => {
    fetchGroups()
  }

  const deleteGroup = async (group: any) => {
    const ok = await confirm({
      title: 'Giải tán nhóm',
      message: `Bạn có chắc muốn giải tán nhóm "${group.name}"? Hành động này sẽ xóa các bài thảo luận và dữ liệu thành viên trong nhóm.`,
      confirmText: 'Giải tán',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await groupsApi.delete(group.id)
      toast.success('Đã giải tán nhóm thành công!')
      await fetchGroups()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể giải tán nhóm')
    }
  }

  onMounted(async () => {
    await initData()
  })

  return {
    groups: filteredGroups,
    searchQuery,
    privacyFilter,
    isLoading,
    initData,
    deleteGroup
  }
}

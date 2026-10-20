import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroups } from './useGroups'

export function useGroupDetail() {
  const router = useRouter()
  const route = useRoute()
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

  const initData = async () => {
    const groupId = (route.params.id as string) || ''
    if (!groupId) return

    isPostsLoading.value = true
    isUsersLoading.value = true

    try {
      await fetchGroup(groupId)
    } finally {
      // Tải song song danh sách bài viết và thành viên của chính nhóm này
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
    // Cập nhật lại danh sách thành viên
    fetchGroupMembers(group.value.id)
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
    initData,
    handleToggleJoin
  }
}

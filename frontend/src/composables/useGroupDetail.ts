import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroups } from './useGroups'
import { usePosts } from './usePosts'
import { useUsers } from './useUsers'

export function useGroupDetail() {
  const router = useRouter()
  const route = useRoute()
  const { currentGroup: group, isLoading: isGroupLoading, fetchGroup } = useGroups()
  const { posts, isLoading: isPostsLoading, fetchPosts } = usePosts()
  const { users, isLoading: isUsersLoading, fetchUsers } = useUsers()
  const activeTab = ref('posts')

  const initData = async () => {
    const groupId = route.params.id as string || '1'
    await Promise.all([
      fetchGroup(groupId),
      fetchPosts(),
      fetchUsers()
    ])
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
    initData
  }
}

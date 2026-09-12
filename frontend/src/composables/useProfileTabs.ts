import { ref, computed } from 'vue'
import { FileText, Bookmark, Users } from '@lucide/vue'
import { useAuth } from './useAuth'
import { usePosts } from './usePosts'

export function useProfileTabs() {
  const { user: currentUser } = useAuth()
  const { posts, isLoading, fetchPosts } = usePosts()
  const activeTab = ref('posts')

  const tabs = computed(() => [
    { key: 'posts', label: 'Bài viết', icon: FileText, count: currentUser.value?.postsCount || 0 },
    { key: 'bookmarks', label: 'Đã lưu', icon: Bookmark, count: 12 },
    { key: 'groups', label: 'Nhóm', icon: Users, count: 5 },
  ])

  return {
    currentUser,
    activeTab,
    tabs,
    posts,
    isLoading,
    fetchPosts
  }
}

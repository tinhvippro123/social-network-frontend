import { ref, computed } from 'vue'
import { FileText, Bookmark, Users, FilePenLine } from '@lucide/vue'
import { useAuth } from '../auth/useAuth'
import { usePosts } from '../posts/usePosts'

export function useProfileTabs(isOwnProfile: boolean = true) {
  const { user: currentUser } = useAuth()
  const { posts, isLoading, fetchPosts } = usePosts()
  const activeTab = ref('posts')

  const tabs = computed(() => {
    const baseTabs = [
      { key: 'posts', label: 'Bài viết', icon: FileText, count: currentUser.value?.postsCount || 0 },
    ]

    // Only show drafts tab on own profile
    if (isOwnProfile) {
      baseTabs.push({ key: 'drafts', label: 'Nháp', icon: FilePenLine, count: 3 })
    }

    baseTabs.push(
      { key: 'bookmarks', label: 'Đã lưu', icon: Bookmark, count: 12 },
      { key: 'groups', label: 'Nhóm', icon: Users, count: 5 },
    )

    return baseTabs
  })

  return {
    currentUser,
    activeTab,
    tabs,
    posts,
    isLoading,
    fetchPosts
  }
}

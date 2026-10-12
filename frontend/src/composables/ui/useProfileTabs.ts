import { ref, computed } from 'vue'
import { FileText, Bookmark, Users, FilePenLine } from '@lucide/vue'
import { useAuth } from '../auth/useAuth'
import usersApi from '@/api/users.api'
import type { Post, UserProfile } from '@/types'
import type { Ref } from 'vue'

export function useProfileTabs(isOwnProfile: boolean = true, targetUserRef?: Ref<UserProfile | null>) {
  const { user: currentUser } = useAuth()
  const posts = ref<Post[]>([])
  const isLoading = ref(false)
  const activeTab = ref('posts')

  const tabs = computed(() => {
    const postCount = targetUserRef?.value?.postsCount ?? (isOwnProfile ? (currentUser.value?.postsCount ?? 0) : 0)
    const baseTabs = [
      { key: 'posts', label: 'Bài viết', icon: FileText, count: postCount },
    ]

    // Only show drafts tab on own profile
    if (isOwnProfile) {
      baseTabs.push({ key: 'drafts', label: 'Nháp', icon: FilePenLine, count: 0 })
    }

    baseTabs.push(
      { key: 'bookmarks', label: 'Đã lưu', icon: Bookmark, count: 0 },
      { key: 'groups', label: 'Nhóm', icon: Users, count: 0 },
    )

    return baseTabs
  })

  async function fetchPosts(userId?: string) {
    const uid = userId || targetUserRef?.value?.id || (isOwnProfile ? currentUser.value?.id : undefined)
    if (!uid) return
    isLoading.value = true
    try {
      const res = await usersApi.getUserPosts(uid, 1, 10)
      posts.value = res.data.data || []
    } catch {
      posts.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentUser,
    activeTab,
    tabs,
    posts,
    isLoading,
    fetchPosts
  }
}


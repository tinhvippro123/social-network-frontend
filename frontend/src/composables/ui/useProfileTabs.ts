import { ref, computed, unref, watch } from 'vue'
import { FileText, Bookmark, Users, FilePenLine } from '@lucide/vue'
import { useAuth } from '../auth/useAuth'
import usersApi from '@/api/users.api'
import postsApi from '@/api/posts.api'
import groupsApi from '@/api/groups.api'
import { normalizePost } from '../posts/usePosts'
import type { Post, UserProfile, Group } from '@/types'
import type { Ref, ComputedRef } from 'vue'

export function useProfileTabs(
  isOwnProfile: Ref<boolean> | ComputedRef<boolean> | boolean = true,
  targetUserRef?: Ref<UserProfile | null>
) {
  const { user: currentUser } = useAuth()
  const posts = ref<Post[]>([])
  const drafts = ref<Post[]>([])
  const bookmarkedPosts = ref<Post[]>([])
  const joinedGroups = ref<Group[]>([])
  const isLoading = ref(false)
  const activeTab = ref('posts')

  watch(() => unref(isOwnProfile), (own) => {
    if (!own && activeTab.value !== 'posts') {
      activeTab.value = 'posts'
    }
  })

  const tabs = computed(() => {
    const postCount = targetUserRef?.value?.postsCount ?? posts.value.length ?? 0
    const baseTabs = [
      { key: 'posts', label: 'Bài viết', icon: FileText, count: postCount },
    ]

    if (unref(isOwnProfile)) {
      baseTabs.push(
        { key: 'drafts', label: 'Nháp', icon: FilePenLine, count: drafts.value.length },
        { key: 'bookmarks', label: 'Đã lưu', icon: Bookmark, count: bookmarkedPosts.value.length },
        { key: 'groups', label: 'Nhóm', icon: Users, count: joinedGroups.value.length }
      )
    }

    return baseTabs
  })

  async function fetchPosts(userId?: string) {
    const own = unref(isOwnProfile)
    const uid = userId || targetUserRef?.value?.id || (own ? currentUser.value?.id : undefined)
    if (!uid) return
    isLoading.value = true
    try {
      const tasks: Promise<any>[] = [
        usersApi.getUserPosts(uid, 1, 20, 'PUBLISHED').then(res => {
          posts.value = (res.data.data || []).map(normalizePost)
        }).catch(() => { posts.value = [] })
      ]

      if (own && currentUser.value?.id === uid) {
        tasks.push(
          usersApi.getUserPosts(uid, 1, 20, 'DRAFT').then(res => {
            drafts.value = (res.data.data || []).map(normalizePost)
          }).catch(() => { drafts.value = [] }),
          postsApi.getBookmarkedPosts(1, 20).then(res => {
            bookmarkedPosts.value = (res.data.data || []).map(dto => ({
              ...normalizePost(dto),
              bookmarked: true
            }))
          }).catch(() => { bookmarkedPosts.value = [] }),
          groupsApi.getAll({ joined: true, limit: 20 }).then(res => {
            joinedGroups.value = res.data.data || []
          }).catch(() => { joinedGroups.value = [] })
        )
      } else {
        drafts.value = []
        bookmarkedPosts.value = []
        joinedGroups.value = []
      }

      await Promise.allSettled(tasks)
    } finally {
      isLoading.value = false
    }
  }

  async function deleteDraft(postId: string) {
    await postsApi.delete(postId)
    drafts.value = drafts.value.filter(p => p.id !== postId)
  }

  return {
    currentUser,
    activeTab,
    tabs,
    posts,
    drafts,
    bookmarkedPosts,
    joinedGroups,
    isLoading,
    fetchPosts,
    deleteDraft
  }
}

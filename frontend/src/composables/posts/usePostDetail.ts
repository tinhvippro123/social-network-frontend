import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts, mapCommentResponse } from './usePosts'
import { useAuth } from '../auth/useAuth'
import { COMMENT_EMOJIS } from '@/constants'
import postsApi from '@/api/posts.api'

export function usePostDetail() {
  const router = useRouter()
  const { user } = useAuth()
  const route = useRoute()
  const { currentPost: post, posts, comments, isLoading, fetchPost, fetchComments, fetchPosts } = usePosts()
  
  const newComment = ref('')
  const isBookmarked = ref(false)
  const replyingTo = ref<{ commentId: string; authorName: string } | null>(null)
  const activeEmojiPicker = ref<string | null>(null)
  const emojiList = COMMENT_EMOJIS

  // Report modal state
  const showReportModal = ref(false)

  const initData = async () => {
    const postId = route.params.id as string || '1'
    await Promise.all([
      fetchPost(postId),
      fetchComments(postId),
      fetchPosts({ limit: 4 })
    ])

    // Load actual reaction summary from backend
    try {
      const summaryRes = await postsApi.getReactionSummary(postId)
      if (summaryRes.data?.success && post.value) {
        const summaryMap = summaryRes.data.data
        // Convert map { "LIKE": 5, "HEART": 2 } to array format expected by UI
        post.value.reactions = Object.entries(summaryMap).map(([emoji, count]) => ({
          emoji,
          count: Number(count),
          reacted: false // To accurately know if the *current* user reacted, we would need to check backend, but this is a summary
        }))
      }
    } catch (e) {
      console.warn("Could not fetch reaction summary", e)
    }

    // Load bookmark status from backend if user is authenticated
    if (user.value) {
      try {
        const bookmarkRes = await postsApi.checkBookmark(postId)
        if (bookmarkRes.data?.success && typeof bookmarkRes.data.data === 'boolean') {
          isBookmarked.value = bookmarkRes.data.data
          if (post.value) {
            post.value.bookmarked = bookmarkRes.data.data
          }
        }
      } catch (e) {
        console.warn('Could not check bookmark status', e)
      }
    }
  }

  onMounted(async () => {
    await initData()
  })

  const toggleBookmark = async () => {
    if (!post.value) return
    if (!user.value) {
      router.push('/auth/login')
      return
    }

    const previousState = isBookmarked.value
    isBookmarked.value = !isBookmarked.value
    if (post.value) {
      post.value.bookmarked = isBookmarked.value
    }

    try {
      const res = await postsApi.toggleBookmark(post.value.id)
      if (res.data?.success && typeof res.data.data === 'boolean') {
        isBookmarked.value = res.data.data
        if (post.value) {
          post.value.bookmarked = res.data.data
        }
      }
    } catch (e) {
      isBookmarked.value = previousState
      if (post.value) {
        post.value.bookmarked = previousState
      }
      console.error('Failed to toggle bookmark', e)
    }
  }

  const toggleEmojiPicker = (commentId: string | null) => {
    if (commentId === null || activeEmojiPicker.value === commentId) {
      activeEmojiPicker.value = null
    } else {
      activeEmojiPicker.value = commentId
    }
  }

  /** Toggle reaction on the current post */
  const toggleReaction = async (emoji: string) => {
    if (!post.value) return

    const existingReaction = post.value.reactions.find(r => r.emoji === emoji)
    if (existingReaction) {
      // Toggle: if already reacted, un-react; otherwise react
      if (existingReaction.reacted) {
        existingReaction.count = Math.max(0, existingReaction.count - 1)
        existingReaction.reacted = false
        // Remove reaction if count is 0
        if (existingReaction.count === 0) {
          post.value.reactions = post.value.reactions.filter(r => r.emoji !== emoji)
        }
      } else {
        existingReaction.count += 1
        existingReaction.reacted = true
      }
    } else {
      // Add new reaction
      post.value.reactions.push({ emoji, count: 1, reacted: true })
    }

    // Fire API call (fire-and-forget for optimistic UI)
    postsApi.toggleReaction(post.value.id, emoji)
  }

  /** Report the current post */
  const reportPost = async (reason: string, description?: string) => {
    if (!post.value) return
    await postsApi.reportPost(post.value.id, { reason, description })
  }

  /** Scroll to comments section */
  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const setReplyingTo = (commentId: string, authorName: string) => {
    replyingTo.value = { commentId, authorName }
  }

  const clearReplyingTo = () => {
    replyingTo.value = null
  }

  const addReplyToTree = (list: any[], parentId: string, reply: any): boolean => {
    for (const item of list) {
      if (item.id === parentId) {
        if (!item.replies) item.replies = []
        item.replies.push(reply)
        return true
      }
      if (item.replies && item.replies.length > 0) {
        if (addReplyToTree(item.replies, parentId, reply)) {
          return true
        }
      }
    }
    return false
  }

  const addComment = async (content: string, _image: File | null) => {
    if (!post.value) return
    if (!user.value) {
      router.push('/auth/login')
      return
    }

    try {
      const parentId = replyingTo.value?.commentId || null
      const res = await postsApi.addComment(post.value.id, { content, parentId })
      if (res.data?.success && res.data.data) {
        const newComment = mapCommentResponse(res.data.data)
        if (parentId) {
          addReplyToTree(comments.value, parentId, newComment)
        } else {
          comments.value.unshift(newComment)
        }
        if (post.value.commentsCount !== undefined) {
          post.value.commentsCount += 1
        }
      }
    } catch (e) {
      console.error('Failed to add comment', e)
    }
  }

  const replyComment = async (parentId: string, content: string, _image: File | null) => {
    if (!post.value) return
    if (!user.value) {
      router.push('/auth/login')
      return
    }

    try {
      const res = await postsApi.addComment(post.value.id, { content, parentId })
      if (res.data?.success && res.data.data) {
        const newReply = mapCommentResponse(res.data.data)
        addReplyToTree(comments.value, parentId, newReply)
        if (post.value.commentsCount !== undefined) {
          post.value.commentsCount += 1
        }
      }
    } catch (e) {
      console.error('Failed to reply comment', e)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!post.value) return
    try {
      await postsApi.deleteComment(post.value.id, commentId)
      const removeFromTree = (list: any[]): boolean => {
        const idx = list.findIndex(c => c.id === commentId)
        if (idx !== -1) {
          list.splice(idx, 1)
          return true
        }
        for (const item of list) {
          if (item.replies && removeFromTree(item.replies)) {
            return true
          }
        }
        return false
      }
      removeFromTree(comments.value)
      if (post.value.commentsCount !== undefined && post.value.commentsCount > 0) {
        post.value.commentsCount -= 1
      }
    } catch (e) {
      console.error('Failed to delete comment', e)
    }
  }

  return {
    user,
    router,
    post,
    posts,
    comments,
    isLoading,
    newComment,
    isBookmarked,
    replyingTo,
    activeEmojiPicker,
    emojiList,
    showReportModal,
    initData,
    toggleBookmark,
    toggleEmojiPicker,
    toggleReaction,
    reportPost,
    scrollToComments,
    setReplyingTo,
    clearReplyingTo,
    addComment,
    replyComment,
    deleteComment
  }
}

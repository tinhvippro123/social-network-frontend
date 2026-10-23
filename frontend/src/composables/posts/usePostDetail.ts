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
  const userVote = ref<'UPVOTE' | 'DOWNVOTE' | null>(null)
  const currentUserReaction = ref<string | null>(null)

  // Report modal state
  const showReportModal = ref(false)

  const initData = async () => {
    const postId = route.params.id as string || '1'
    await Promise.all([
      fetchPost(postId),
      fetchComments(postId),
      fetchPosts({ limit: 4 })
    ])

    // Load user vote, current reaction, and bookmark status from backend if user is authenticated
    if (user.value) {
      try {
        const [voteRes, reactionRes, bookmarkRes] = await Promise.allSettled([
          postsApi.getUserVote(postId),
          postsApi.getCurrentUserReaction(postId),
          postsApi.checkBookmark(postId)
        ])

        if (voteRes.status === 'fulfilled' && voteRes.value.data?.success && voteRes.value.data.data) {
          userVote.value = voteRes.value.data.data as 'UPVOTE' | 'DOWNVOTE'
        }

        if (reactionRes.status === 'fulfilled' && reactionRes.value.data?.success && reactionRes.value.data.data) {
          const emoji = reactionRes.value.data.data
          if (emoji !== 'UPVOTE' && emoji !== 'DOWNVOTE') {
            currentUserReaction.value = emoji
          }
        }

        if (bookmarkRes.status === 'fulfilled' && bookmarkRes.value.data?.success && typeof bookmarkRes.value.data.data === 'boolean') {
          isBookmarked.value = bookmarkRes.value.data.data
          if (post.value) {
            post.value.bookmarked = bookmarkRes.value.data.data
          }
        }
      } catch (e) {
        console.warn('Error fetching user post interactions', e)
      }
    }

    // Load actual reaction summary from backend
    try {
      const summaryRes = await postsApi.getReactionSummary(postId)
      if (summaryRes.data?.success && post.value) {
        const summaryMap = summaryRes.data.data
        post.value.reactions = Object.entries(summaryMap).map(([emoji, count]) => ({
          emoji,
          count: Number(count),
          reacted: currentUserReaction.value === emoji
        }))
      }
    } catch (e) {
      console.warn("Could not fetch reaction summary", e)
    }
  }

  onMounted(async () => {
    await initData()
    if (route.hash) {
      setTimeout(() => {
        const el = document.querySelector(route.hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('ring-2', 'ring-primary-500', 'transition-all')
          setTimeout(() => el.classList.remove('ring-2', 'ring-primary-500'), 2500)
        }
      }, 400)
    }
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

  /** Toggle reaction on the current post (Single reaction rule) */
  const toggleReaction = async (emoji: string) => {
    if (!post.value) return
    if (!user.value) {
      router.push('/login')
      return
    }

    if (!Array.isArray(post.value.reactions)) {
      post.value.reactions = []
    }

    const prevUserReaction = currentUserReaction.value
    const prevReactions = JSON.parse(JSON.stringify(post.value.reactions))

    if (currentUserReaction.value === emoji) {
      // Toggle OFF: Clicked the same emoji again -> remove reaction
      currentUserReaction.value = null
      const target = post.value.reactions.find((r: any) => r.emoji === emoji)
      if (target) {
        target.count = Math.max(0, target.count - 1)
        target.reacted = false
        if (target.count === 0) {
          post.value.reactions = post.value.reactions.filter((r: any) => r.emoji !== emoji)
        }
      }
    } else {
      // Switching or new reaction:
      // 1. If previously had another emoji, decrement and unmark old one
      if (currentUserReaction.value) {
        const oldEmoji = currentUserReaction.value
        const oldTarget = post.value.reactions.find((r: any) => r.emoji === oldEmoji)
        if (oldTarget) {
          oldTarget.count = Math.max(0, oldTarget.count - 1)
          oldTarget.reacted = false
          if (oldTarget.count === 0) {
            post.value.reactions = post.value.reactions.filter((r: any) => r.emoji !== oldEmoji)
          }
        }
      }

      // 2. Increment and mark new emoji
      currentUserReaction.value = emoji
      const newTarget = post.value.reactions.find((r: any) => r.emoji === emoji)
      if (newTarget) {
        newTarget.count += 1
        newTarget.reacted = true
      } else {
        post.value.reactions.push({ emoji, count: 1, reacted: true })
      }
    }

    // Fire API call
    try {
      await postsApi.toggleReaction(post.value.id, emoji)
    } catch (e) {
      // Rollback on failure
      currentUserReaction.value = prevUserReaction
      post.value.reactions = prevReactions
      console.error('Failed to toggle reaction', e)
    }
  }

  /** Upvote the post */
  const handleUpvote = async () => {
    if (!post.value) return
    if (!user.value) {
      router.push('/login')
      return
    }

    const prevVote = userVote.value
    const prevUp = Number(post.value.upvotesCount) || 0
    const prevDown = Number(post.value.downvotesCount) || 0

    if (userVote.value === 'UPVOTE') {
      // Toggle off
      userVote.value = null
      post.value.upvotesCount = Math.max(0, prevUp - 1)
    } else if (userVote.value === 'DOWNVOTE') {
      // Switch from downvote to upvote
      userVote.value = 'UPVOTE'
      post.value.downvotesCount = Math.max(0, prevDown - 1)
      post.value.upvotesCount = prevUp + 1
    } else {
      // First upvote
      userVote.value = 'UPVOTE'
      post.value.upvotesCount = prevUp + 1
    }

    try {
      await postsApi.upvote(post.value.id)
    } catch (e) {
      // Revert on failure
      userVote.value = prevVote
      post.value.upvotesCount = prevUp
      post.value.downvotesCount = prevDown
      console.error('Failed to upvote', e)
    }
  }

  /** Downvote the post */
  const handleDownvote = async () => {
    if (!post.value) return
    if (!user.value) {
      router.push('/login')
      return
    }

    const prevVote = userVote.value
    const prevUp = Number(post.value.upvotesCount) || 0
    const prevDown = Number(post.value.downvotesCount) || 0

    if (userVote.value === 'DOWNVOTE') {
      // Toggle off
      userVote.value = null
      post.value.downvotesCount = Math.max(0, prevDown - 1)
    } else if (userVote.value === 'UPVOTE') {
      // Switch from upvote to downvote
      userVote.value = 'DOWNVOTE'
      post.value.upvotesCount = Math.max(0, prevUp - 1)
      post.value.downvotesCount = prevDown + 1
    } else {
      // First downvote
      userVote.value = 'DOWNVOTE'
      post.value.downvotesCount = prevDown + 1
    }

    try {
      await postsApi.downvote(post.value.id)
    } catch (e) {
      // Revert on failure
      userVote.value = prevVote
      post.value.upvotesCount = prevUp
      post.value.downvotesCount = prevDown
      console.error('Failed to downvote', e)
    }
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
    userVote,
    currentUserReaction,
    handleUpvote,
    handleDownvote,
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

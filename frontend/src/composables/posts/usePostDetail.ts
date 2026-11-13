import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts, mapCommentResponse } from './usePosts'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../ui/useToast'
import { useUiStore } from '@/stores/ui.store'
import { COMMENT_EMOJIS } from '@/constants'
import postsApi from '@/api/posts.api'
import filesApi from '@/api/files.api'

export function usePostDetail() {
  const router = useRouter()
  const { user } = useAuth()
  const uiStore = useUiStore()
  const toast = useToast()
  const route = useRoute()
  const { currentPost: post, posts, comments, isLoading, fetchPost, fetchComments, fetchPosts } = usePosts()
  
  const newComment = ref('')
  const isBookmarked = ref(false)
  const replyingTo = ref<{ commentId: string; authorName: string } | null>(null)
  const emojiList = COMMENT_EMOJIS
  const userVote = ref<'UPVOTE' | 'DOWNVOTE' | null>(null)
  const currentUserReaction = ref<string | null>(null)

  // Report modal state
  const showReportModal = ref(false)

  const promptGuestLogin = (msg = 'Vui lòng đăng nhập để thực hiện thao tác này') => {
    toast.info(msg)
    uiStore.openAuthModal('login')
  }

  const initData = async () => {
    const postId = route.params.id as string || '1'
    userVote.value = null
    currentUserReaction.value = null
    isBookmarked.value = false
    replyingTo.value = null
    showReportModal.value = false
    await Promise.all([
      fetchPost(postId),
      fetchPosts({ limit: 4 })
    ])

    if (!post.value) {
      comments.value = []
      return
    }

    if (post.value.bookmarked != null) {
      isBookmarked.value = Boolean(post.value.bookmarked)
    }

    const isPublished = (post.value.status || 'published').toLowerCase() === 'published'
    if (!isPublished) {
      comments.value = []
      return
    }

    await fetchComments(postId)

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

  const highlightAndScrollToComment = (targetPayload?: string | { targetHash?: string; authorName?: string }) => {
    let targetHash = ''
    let authorName = ''

    if (typeof targetPayload === 'string') {
      targetHash = targetPayload
    } else if (targetPayload && typeof targetPayload === 'object') {
      targetHash = targetPayload.targetHash || ''
      authorName = targetPayload.authorName || ''
    }

    if (!targetHash && route.hash) {
      targetHash = route.hash
    }
    if (!authorName && route.query.highlightAuthor) {
      authorName = String(route.query.highlightAuthor)
    }

    const cleanId = targetHash.replace(/^#comment-/, '').replace(/^#/, '').trim()
    const cleanAuthor = authorName.toLowerCase().trim()

    let attempts = 0
    const maxAttempts = 35 // Check every 100ms for up to 3.5s

    const findCommentByAuthor = (list: any[], author: string): any => {
      for (const c of list) {
        if (c.author?.name && c.author.name.toLowerCase().includes(author)) {
          return c
        }
        if (c.replies && c.replies.length > 0) {
          const found = findCommentByAuthor(c.replies, author)
          if (found) return found
        }
      }
      return null
    }

    const tryScroll = () => {
      let el: HTMLElement | null = null

      // 1. Try finding by comment ID if specified and not just generic comments section
      if (cleanId && cleanId !== 'comments-section' && cleanId !== 'comments') {
        el = document.getElementById(`comment-${cleanId}`) || document.getElementById(cleanId)
      }

      // 2. If not found by ID or no ID, search in loaded comments by author name
      if (!el && cleanAuthor && comments.value.length > 0) {
        const matched = findCommentByAuthor(comments.value, cleanAuthor)
        if (matched) {
          el = document.getElementById(`comment-${matched.id}`)
        }
      }

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.remove('highlight-comment-target')
        void el.offsetWidth // Trigger reflow to restart animation
        el.classList.add('highlight-comment-target')
        setTimeout(() => {
          el?.classList.remove('highlight-comment-target')
        }, 3500)
        return true
      }

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(tryScroll, 100)
      } else {
        // Fallback: Scroll down to comments section
        const commentsSec = document.getElementById('comments-section') || document.getElementById('comments')
        if (commentsSec) {
          commentsSec.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      return false
    }

    tryScroll()
  }

  const onJumpToComment = (e: any) => {
    const detail = e?.detail
    if (detail) {
      highlightAndScrollToComment(detail)
    }
  }

  onMounted(async () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('jump-to-comment', onJumpToComment)
    }
    await initData()
    if (route.hash || route.query.highlightAuthor) {
      highlightAndScrollToComment()
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('jump-to-comment', onJumpToComment)
    }
  })

  // Refresh user-specific interaction state if user logs in or out on this page
  watch(user, (newUser, oldUser) => {
    if (newUser && !oldUser && post.value) {
      initData()
    } else if (!newUser && oldUser) {
      userVote.value = null
      currentUserReaction.value = null
      isBookmarked.value = false
      if (post.value) {
        post.value.bookmarked = false
        if (Array.isArray(post.value.reactions)) {
          post.value.reactions.forEach((r: any) => { r.reacted = false })
        }
      }
    }
  })

  // Watch for post ID changes when clicking related posts
  watch(
    () => route.params.id,
    async (newId, oldId) => {
      if (newId && newId !== oldId) {
        await initData()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  )

  // Watch for hash or highlightAuthor changes while user is already on the post page
  watch(
    () => [route.hash, route.query.highlightAuthor],
    ([newHash, newAuthor]) => {
      if (newHash || newAuthor) {
        highlightAndScrollToComment()
      }
    }
  )

  // Watch when comments finish loading, re-run scroll check
  watch(comments, (newComments) => {
    if ((route.hash || route.query.highlightAuthor) && newComments.length > 0) {
      highlightAndScrollToComment()
    }
  })

  const toggleBookmark = async () => {
    if (!post.value) return
    if (!user.value) {
      promptGuestLogin('Vui lòng đăng nhập để lưu bài viết')
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
        toast.success(isBookmarked.value ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết')
      }
    } catch (e) {
      isBookmarked.value = previousState
      if (post.value) {
        post.value.bookmarked = previousState
      }
      console.error('Failed to toggle bookmark', e)
    }
  }

  /** Toggle reaction on the current post (Single reaction rule — mutually exclusive with Upvote/Downvote in backend) */
  const toggleReaction = async (emoji: string) => {
    if (!post.value) return
    if (!user.value) {
      promptGuestLogin('Vui lòng đăng nhập để thả cảm xúc')
      return
    }

    if (!Array.isArray(post.value.reactions)) {
      post.value.reactions = []
    }

    const prevUserReaction = currentUserReaction.value
    const prevReactions = JSON.parse(JSON.stringify(post.value.reactions))
    const prevVote = userVote.value
    const prevUp = Number(post.value.upvotesCount) || 0
    const prevDown = Number(post.value.downvotesCount) || 0

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
      // 0. If user previously had an upvote/downvote, backend replaces it with this emoji reaction
      if (userVote.value === 'UPVOTE') {
        userVote.value = null
        post.value.upvotesCount = Math.max(0, prevUp - 1)
      } else if (userVote.value === 'DOWNVOTE') {
        userVote.value = null
        post.value.downvotesCount = Math.max(0, prevDown - 1)
      }

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
      userVote.value = prevVote
      post.value.upvotesCount = prevUp
      post.value.downvotesCount = prevDown
      console.error('Failed to toggle reaction', e)
    }
  }

  /** Upvote the post */
  const handleUpvote = async () => {
    if (!post.value) return
    if (!user.value) {
      promptGuestLogin('Vui lòng đăng nhập để bình chọn bài viết')
      return
    }

    const prevVote = userVote.value
    const prevUp = Number(post.value.upvotesCount) || 0
    const prevDown = Number(post.value.downvotesCount) || 0
    const prevUserReaction = currentUserReaction.value
    const prevReactions = Array.isArray(post.value.reactions) ? JSON.parse(JSON.stringify(post.value.reactions)) : []

    if (currentUserReaction.value && Array.isArray(post.value.reactions)) {
      const oldEmoji = currentUserReaction.value
      const oldTarget = post.value.reactions.find((r: any) => r.emoji === oldEmoji)
      if (oldTarget) {
        oldTarget.count = Math.max(0, oldTarget.count - 1)
        oldTarget.reacted = false
        if (oldTarget.count === 0) {
          post.value.reactions = post.value.reactions.filter((r: any) => r.emoji !== oldEmoji)
        }
      }
      currentUserReaction.value = null
    }

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
      currentUserReaction.value = prevUserReaction
      post.value.reactions = prevReactions
      console.error('Failed to upvote', e)
    }
  }

  /** Downvote the post */
  const handleDownvote = async () => {
    if (!post.value) return
    if (!user.value) {
      promptGuestLogin('Vui lòng đăng nhập để bình chọn bài viết')
      return
    }

    const prevVote = userVote.value
    const prevUp = Number(post.value.upvotesCount) || 0
    const prevDown = Number(post.value.downvotesCount) || 0
    const prevUserReaction = currentUserReaction.value
    const prevReactions = Array.isArray(post.value.reactions) ? JSON.parse(JSON.stringify(post.value.reactions)) : []

    if (currentUserReaction.value && Array.isArray(post.value.reactions)) {
      const oldEmoji = currentUserReaction.value
      const oldTarget = post.value.reactions.find((r: any) => r.emoji === oldEmoji)
      if (oldTarget) {
        oldTarget.count = Math.max(0, oldTarget.count - 1)
        oldTarget.reacted = false
        if (oldTarget.count === 0) {
          post.value.reactions = post.value.reactions.filter((r: any) => r.emoji !== oldEmoji)
        }
      }
      currentUserReaction.value = null
    }

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
      currentUserReaction.value = prevUserReaction
      post.value.reactions = prevReactions
      console.error('Failed to downvote', e)
    }
  }

  /** Report the current post */
  const reportPost = async (reason: string, description?: string) => {
    if (!post.value) return
    if (!user.value) {
      promptGuestLogin('Vui lòng đăng nhập để gửi báo cáo')
      return
    }
    try {
      await postsApi.reportPost(post.value.id, { reason, description })
      toast.success('Đã gửi báo cáo bài viết thành công!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi báo cáo bài viết')
    }
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

  const buildCommentContentWithImage = async (rawContent: string, image: File | null): Promise<string> => {
    let finalContent = rawContent.trim()
    if (image) {
      const uploadRes = await filesApi.uploadFile(image)
      const imageUrl = uploadRes.data?.data?.fileUrl
      if (imageUrl) {
        finalContent = finalContent ? `${finalContent}\n[img:${imageUrl}]` : `[img:${imageUrl}]`
      }
    }
    return finalContent
  }

  const addComment = async (content: string, image: File | null) => {
    if (!post.value) return
    if (!user.value) {
      promptGuestLogin('Vui lòng đăng nhập để bình luận')
      return
    }

    try {
      const parentId = replyingTo.value?.commentId || null
      const finalContent = await buildCommentContentWithImage(content, image)
      if (!finalContent) return
      const res = await postsApi.addComment(post.value.id, { content: finalContent, parentId })
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
      toast.error((e as any)?.response?.data?.message || 'Không thể gửi bình luận')
    }
  }

  const replyComment = async (parentId: string, content: string, image: File | null) => {
    if (!post.value) return
    if (!user.value) {
      promptGuestLogin('Vui lòng đăng nhập để trả lời bình luận')
      return
    }

    try {
      const finalContent = await buildCommentContentWithImage(content, image)
      if (!finalContent) return
      const res = await postsApi.addComment(post.value.id, { content: finalContent, parentId })
      if (res.data?.success && res.data.data) {
        const newReply = mapCommentResponse(res.data.data)
        addReplyToTree(comments.value, parentId, newReply)
        if (post.value.commentsCount !== undefined) {
          post.value.commentsCount += 1
        }
      }
    } catch (e) {
      console.error('Failed to reply comment', e)
      toast.error((e as any)?.response?.data?.message || 'Không thể gửi phản hồi bình luận')
    }
  }

  const countCommentBranch = (node: any): number => {
    if (!node) return 0
    let count = 1
    if (Array.isArray(node.replies)) {
      for (const child of node.replies) {
        count += countCommentBranch(child)
      }
    }
    return count
  }

  const deleteComment = async (commentId: string) => {
    if (!post.value) return
    try {
      await postsApi.deleteComment(post.value.id, commentId)
      let removedTotal = 1
      const removeFromTree = (list: any[]): boolean => {
        const idx = list.findIndex(c => c.id === commentId)
        if (idx !== -1) {
          removedTotal = countCommentBranch(list[idx])
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
        post.value.commentsCount = Math.max(0, post.value.commentsCount - removedTotal)
      }
      toast.info('Đã xóa bình luận')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể xóa bình luận')
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
    emojiList,
    showReportModal,
    initData,
    toggleBookmark,
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

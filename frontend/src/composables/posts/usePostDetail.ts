import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts } from './usePosts'
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
  }

  onMounted(async () => {
    await initData()
  })

  const toggleBookmark = () => {
    isBookmarked.value = !isBookmarked.value
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

  const addComment = async (content: string, image: File | null) => {
    const newCommentObj = {
      id: Date.now().toString(),
      author: user.value || { id: 'guest', name: 'Khách', avatar: '', isVerified: false, roles: ['user'] },
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      replies: []
    }
    
    if (replyingTo.value) {
      const parent = comments.value.find(c => c.id === replyingTo.value?.commentId)
      if (parent) {
        if (!parent.replies) parent.replies = []
        parent.replies.push(newCommentObj)
      }
    } else {
      comments.value.unshift(newCommentObj)
    }
  }

  const replyComment = async (parentId: string, content: string, image: File | null) => {
    const parent = comments.value.find(c => c.id === parentId)
    if (parent) {
      if (!parent.replies) parent.replies = []
      parent.replies.push({
        id: Date.now().toString(),
        author: user.value || { id: 'guest', name: 'Khách', avatar: '', isVerified: false, roles: ['user'] },
        content,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        userVote: 0,
        replies: []
      })
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
    replyComment
  }
}

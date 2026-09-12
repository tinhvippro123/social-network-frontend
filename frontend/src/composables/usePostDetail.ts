import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts } from './usePosts'
import { useAuth } from './useAuth'
import { COMMENT_EMOJIS } from '@/constants'

export function usePostDetail() {
  const router = useRouter()
  const { user } = useAuth()
  const route = useRoute()
  const { currentPost: post, posts, comments, isLoading, fetchPost, fetchComments, fetchPosts } = usePosts()
  
  const newComment = ref('')
  const isBookmarked = ref(false)
  const isUpvoted = ref(false)
  const replyingTo = ref<{ commentId: string; authorName: string } | null>(null)
  const activeEmojiPicker = ref<string | null>(null)
  const emojiList = COMMENT_EMOJIS

  const initData = async () => {
    const postId = route.params.id as string || '1'
    await Promise.all([
      fetchPost(postId),
      fetchComments(postId),
      fetchPosts({ limit: 4 })
    ])
  }

  onMounted(async () => {
    await initData()
  })

  const toggleUpvote = () => {
    isUpvoted.value = !isUpvoted.value
  }

  const toggleBookmark = () => {
    isBookmarked.value = !isBookmarked.value
  }

  const toggleEmojiPicker = (commentId: string) => {
    if (activeEmojiPicker.value === commentId) {
      activeEmojiPicker.value = null
    } else {
      activeEmojiPicker.value = commentId
    }
  }

  const setReplyingTo = (commentId: string, authorName: string) => {
    replyingTo.value = { commentId, authorName }
  }

  const clearReplyingTo = () => {
    replyingTo.value = null
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
    isUpvoted,
    replyingTo,
    activeEmojiPicker,
    emojiList,
    initData,
    toggleUpvote,
    toggleBookmark,
    toggleEmojiPicker,
    setReplyingTo,
    clearReplyingTo
  }
}

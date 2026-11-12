import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts } from '../posts/usePosts'
import { useUsers } from '../core/useUsers'
import { useAuthStore } from '@/stores/auth.store'

export function useTrendingSidebar() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { posts, fetchTrending, tags, fetchPopularTags } = usePosts()
  const { users, fetchUsers } = useUsers()
  
  const isLoading = ref(true)

  const initData = async () => {
    isLoading.value = true
    const [trendingPosts] = await Promise.all([
      fetchTrending(5),
      fetchUsers(),
      fetchPopularTags()
    ])
    posts.value = trendingPosts
    isLoading.value = false
  }

  onMounted(() => {
    initData()
  })

  watch(() => authStore.user?.id, () => {
    initData()
  })

  return {
    router,
    posts,
    tags,
    users,
    isLoading,
    initData
  }
}

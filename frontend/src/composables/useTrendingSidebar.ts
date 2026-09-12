import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts } from './usePosts'
import { useUsers } from './useUsers'

export function useTrendingSidebar() {
  const router = useRouter()
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

  return {
    router,
    posts,
    tags,
    users,
    isLoading,
    initData
  }
}

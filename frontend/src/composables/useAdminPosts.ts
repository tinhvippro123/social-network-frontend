import { ref, onMounted } from 'vue'
import { usePosts } from './usePosts'

export function useAdminPosts() {
  const { posts, isLoading, fetchPosts } = usePosts()
  const searchQuery = ref('')
  const filterStatus = ref('all')
  const currentPage = ref(1)

  const initData = () => {
    fetchPosts()
  }

  onMounted(async () => {
    await initData()
  })

  return {
    posts,
    isLoading,
    searchQuery,
    filterStatus,
    currentPage,
    initData
  }
}

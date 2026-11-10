import { ref, watch, onMounted } from 'vue'
import adminApi from '@/api/admin.api'
import postsApi from '@/api/posts.api'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'

export function useAdminPosts() {
  const toast = useToast()
  const { confirm } = useConfirm()
  const posts = ref<any[]>([])
  const isLoading = ref(false)
  const totalItems = ref(0)
  const pageSize = ref(10)
  const currentPage = ref(1)
  const searchQuery = ref('')
  const filterStatus = ref<'all' | 'published' | 'draft' | 'hidden'>('all')

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  async function fetchPosts() {
    isLoading.value = true
    try {
      const statusParam = filterStatus.value === 'all' ? undefined : filterStatus.value.toUpperCase()
      const res = await adminApi.getPosts({
        page: currentPage.value,
        limit: pageSize.value,
        status: statusParam,
        search: searchQuery.value.trim() || undefined
      })
      if (res.data?.success) {
        posts.value = (res.data.data || []).map((item: any) => ({
          ...item,
          status: (item.status || 'published').toLowerCase(),
          author: item.author || {
            id: item.authorId,
            name: item.authorName || 'Người dùng',
            avatar: item.authorAvatar || ''
          },
          category: item.category || {
            id: item.categoryId,
            name: item.categoryName || 'Chung'
          }
        }))
        totalItems.value = res.data.meta?.total ?? posts.value.length
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách bài viết:', err)
      toast.error(err.response?.data?.message || 'Không thể tải danh sách bài viết')
    } finally {
      isLoading.value = false
    }
  }

  async function togglePostStatus(post: any) {
    if ((post.status || '').toLowerCase() === 'draft') {
      toast.info('Không thể thay đổi trạng thái công khai của bản nháp cá nhân')
      return
    }
    const isCurrentlyHidden = (post.status || '').toLowerCase() === 'hidden'
    const newStatus = isCurrentlyHidden ? 'PUBLISHED' : 'HIDDEN'
    const actionLabel = isCurrentlyHidden ? 'Hiện bài viết' : 'Ẩn bài viết'

    const ok = await confirm({
      title: actionLabel,
      message: `Bạn có chắc muốn ${actionLabel.toLowerCase()} "${post.title}"?`,
      confirmText: actionLabel,
      variant: isCurrentlyHidden ? 'info' : 'warning'
    })
    if (!ok) return

    try {
      await adminApi.updatePostStatus(post.id, newStatus)
      post.status = newStatus.toLowerCase()
      const idx = posts.value.findIndex(p => p.id === post.id)
      if (idx !== -1) posts.value[idx].status = newStatus.toLowerCase()
      toast.success(`Đã ${actionLabel.toLowerCase()} thành công!`)
      if (filterStatus.value !== 'all') {
        posts.value = posts.value.filter(p => p.id !== post.id)
        totalItems.value = Math.max(0, totalItems.value - 1)
        if (posts.value.length === 0 && currentPage.value > 1) {
          currentPage.value -= 1
        } else {
          await fetchPosts()
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Thao tác ${actionLabel.toLowerCase()} thất bại`)
    }
  }

  async function deletePost(post: any) {
    const ok = await confirm({
      title: 'Xóa bài viết',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn bài viết "${post.title}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa vĩnh viễn',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await postsApi.delete(post.id)
      posts.value = posts.value.filter(p => p.id !== post.id)
      totalItems.value = Math.max(0, totalItems.value - 1)
      if (posts.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
      } else {
        await fetchPosts()
      }
      toast.success('Đã xóa bài viết thành công!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xóa bài viết thất bại')
    }
  }

  watch(filterStatus, () => {
    currentPage.value = 1
    fetchPosts()
  })

  watch(searchQuery, () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      currentPage.value = 1
      fetchPosts()
    }, 350)
  })

  watch(currentPage, () => {
    fetchPosts()
  })

  onMounted(() => {
    fetchPosts()
  })

  return {
    posts,
    isLoading,
    totalItems,
    pageSize,
    searchQuery,
    filterStatus,
    currentPage,
    fetchPosts,
    togglePostStatus,
    deletePost
  }
}

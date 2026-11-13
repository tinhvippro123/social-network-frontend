import { ref, onMounted } from 'vue'
import { useCategories } from '../core/useCategories'
import adminApi from '@/api/admin.api'
import postsApi from '@/api/posts.api'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'

export function useAdminCategories() {
  const { categories, isLoading, fetchCategories } = useCategories()
  const toast = useToast()
  const { confirm } = useConfirm()
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const editingCategory = ref<any | null>(null)

  const newCategoryName = ref('')
  const newCategoryDescription = ref('')

  const editCategoryName = ref('')
  const editCategoryDescription = ref('')

  // Tag Management state
  const tags = ref<{ id: string; name: string; postsCount: number }[]>([])
  const isTagsLoading = ref(false)
  const showRenameTagModal = ref(false)
  const editingTagName = ref('')
  const replacementTagName = ref('')

  const fetchTags = async () => {
    isTagsLoading.value = true
    try {
      const res = await postsApi.getPopularTags()
      const list = Array.isArray(res.data?.data) ? res.data.data : []
      tags.value = list.map((t: any, idx: number) => ({
        id: t.id || String(idx),
        name: t.name || String(t),
        postsCount: Number(t.postsCount ?? t.count ?? 0)
      }))
    } catch {
      tags.value = []
    } finally {
      isTagsLoading.value = false
    }
  }

  const initData = () => {
    fetchCategories()
    fetchTags()
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.value.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      await adminApi.createCategory({
        name: newCategoryName.value.trim(),
        description: newCategoryDescription.value.trim() || undefined
      })
      toast.success('Đã thêm danh mục mới thành công!')
      showAddModal.value = false
      newCategoryName.value = ''
      newCategoryDescription.value = ''
      await fetchCategories()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo danh mục')
    }
  }

  const openEditModal = (category: any) => {
    editingCategory.value = category
    editCategoryName.value = category.name || ''
    editCategoryDescription.value = category.description || ''
    showEditModal.value = true
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory.value) return
    if (!editCategoryName.value.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      const targetId = editingCategory.value.id || editingCategory.value.slug
      await adminApi.updateCategory(targetId, {
        name: editCategoryName.value.trim(),
        description: editCategoryDescription.value.trim()
      })
      toast.success('Đã cập nhật danh mục thành công!')
      showEditModal.value = false
      editingCategory.value = null
      await fetchCategories()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật danh mục')
    }
  }

  const handleDeleteCategory = async (category: any) => {
    const ok = await confirm({
      title: 'Xóa danh mục',
      message: `Bạn có chắc muốn xóa danh mục "${category.name}"? Các bài viết thuộc danh mục này có thể bị ảnh hưởng.`,
      confirmText: 'Xóa danh mục',
      variant: 'danger'
    })
    if (!ok) return

    try {
      const targetId = category.id || category.slug
      await adminApi.deleteCategory(targetId)
      toast.success('Đã xóa danh mục thành công!')
      await fetchCategories()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xóa danh mục thất bại')
    }
  }

  const openRenameTagModal = (tagName: string) => {
    editingTagName.value = tagName
    replacementTagName.value = tagName
    showRenameTagModal.value = true
  }

  const handleRenameTag = async () => {
    const oldName = editingTagName.value.trim()
    const newName = replacementTagName.value.trim().replace(/^#/, '')
    if (!oldName || !newName) {
      toast.error('Vui lòng nhập tên thẻ tag mới')
      return
    }
    if (oldName === newName) {
      showRenameTagModal.value = false
      return
    }
    try {
      await adminApi.renameTag(oldName, newName)
      toast.success(`Đã đổi thẻ #${oldName} thành #${newName}`)
      showRenameTagModal.value = false
      await fetchTags()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể đổi tên thẻ tag')
    }
  }

  const handleDeleteTag = async (tagName: string) => {
    const ok = await confirm({
      title: 'Xóa thẻ Tag',
      message: `Bạn có chắc muốn gỡ bỏ thẻ "#${tagName}" khỏi toàn bộ bài viết trong hệ thống?`,
      confirmText: 'Xóa Tag',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await adminApi.deleteTag(tagName)
      toast.success(`Đã xóa thẻ #${tagName} thành công!`)
      await fetchTags()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xóa thẻ tag thất bại')
    }
  }

  onMounted(async () => {
    await initData()
  })

  return {
    categories,
    isLoading,
    showAddModal,
    showEditModal,
    editingCategory,
    newCategoryName,
    newCategoryDescription,
    editCategoryName,
    editCategoryDescription,
    tags,
    isTagsLoading,
    showRenameTagModal,
    editingTagName,
    replacementTagName,
    initData,
    handleAddCategory,
    openEditModal,
    handleUpdateCategory,
    handleDeleteCategory,
    openRenameTagModal,
    handleRenameTag,
    handleDeleteTag
  }
}

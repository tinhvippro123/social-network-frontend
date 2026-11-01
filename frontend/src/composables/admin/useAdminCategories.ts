import { ref, onMounted } from 'vue'
import { useCategories } from '../core/useCategories'
import adminApi from '@/api/admin.api'
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
  const newCategoryIcon = ref('')

  const editCategoryName = ref('')
  const editCategoryIcon = ref('')

  const initData = () => {
    fetchCategories()
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.value.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      await adminApi.createCategory({
        name: newCategoryName.value.trim(),
        icon: newCategoryIcon.value.trim() || '📁'
      })
      toast.success('Đã thêm danh mục mới thành công!')
      showAddModal.value = false
      newCategoryName.value = ''
      newCategoryIcon.value = ''
      await fetchCategories()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo danh mục')
    }
  }

  const openEditModal = (category: any) => {
    editingCategory.value = category
    editCategoryName.value = category.name || ''
    editCategoryIcon.value = category.icon || ''
    showEditModal.value = true
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory.value || !editCategoryName.value.trim()) return

    try {
      const targetId = editingCategory.value.id || editingCategory.value.slug
      await adminApi.updateCategory(targetId, {
        name: editCategoryName.value.trim(),
        icon: editCategoryIcon.value.trim() || '📁'
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
    newCategoryIcon,
    editCategoryName,
    editCategoryIcon,
    initData,
    handleAddCategory,
    openEditModal,
    handleUpdateCategory,
    handleDeleteCategory
  }
}

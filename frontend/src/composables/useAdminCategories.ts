import { ref, onMounted } from 'vue'
import { useCategories } from './useCategories'
import { useToast } from './useToast'

export function useAdminCategories() {
  const { categories, isLoading, fetchCategories } = useCategories()
  const toast = useToast()
  const showAddModal = ref(false)
  const newCategoryName = ref('')
  const newCategoryIcon = ref('')

  const initData = () => {
    fetchCategories()
  }

  const handleAddCategory = () => {
    if (!newCategoryName.value.trim() || !newCategoryIcon.value.trim()) return
    toast.success('Đã thêm danh mục thành công!')
    showAddModal.value = false
    newCategoryName.value = ''
    newCategoryIcon.value = ''
  }

  onMounted(async () => {
    await initData()
  })

  return {
    categories,
    isLoading,
    showAddModal,
    newCategoryName,
    newCategoryIcon,
    initData,
    handleAddCategory
  }
}

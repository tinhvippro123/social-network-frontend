import { ref, onMounted } from 'vue'
import { useCategories } from './useCategories'

export function useCategoryTabs() {
  const { categories, fetchCategories } = useCategories()

  const categoryContainer = ref<HTMLElement | null>(null)

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryContainer.value) return
    const scrollAmount = 200
    categoryContainer.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const initData = async () => {
    await fetchCategories()
  }

  onMounted(async () => {
    await initData()
  })

  return {
    categories,
    categoryContainer,
    scrollCategories,
    initData
  }
}

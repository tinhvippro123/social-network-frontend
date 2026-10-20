import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useCategories } from '../core/useCategories'

export function useCategoryTabs() {
  const { categories, fetchCategories } = useCategories()
  const categoryContainer = ref<HTMLElement | null>(null)
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  const checkOverflow = () => {
    const el = categoryContainer.value
    if (!el) {
      canScrollLeft.value = false
      canScrollRight.value = false
      return
    }
    // Chỉ bật cuộn khi nội dung thực sự vượt quá chiều rộng container
    const isOverflowing = el.scrollWidth > el.clientWidth + 2
    if (!isOverflowing) {
      canScrollLeft.value = false
      canScrollRight.value = false
      return
    }

    canScrollLeft.value = el.scrollLeft > 4
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
  }

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryContainer.value) return
    const scrollAmount = 240
    categoryContainer.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
    setTimeout(checkOverflow, 300)
  }

  let resizeObserver: ResizeObserver | null = null

  const initData = async () => {
    await fetchCategories()
    await nextTick()
    checkOverflow()
  }

  onMounted(async () => {
    await initData()

    if (categoryContainer.value) {
      categoryContainer.value.addEventListener('scroll', checkOverflow, { passive: true })
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          checkOverflow()
        })
        resizeObserver.observe(categoryContainer.value)
      }
    }
    window.addEventListener('resize', checkOverflow, { passive: true })
  })

  onUnmounted(() => {
    if (categoryContainer.value) {
      categoryContainer.value.removeEventListener('scroll', checkOverflow)
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    window.removeEventListener('resize', checkOverflow)
  })

  return {
    categories,
    categoryContainer,
    canScrollLeft,
    canScrollRight,
    scrollCategories,
    checkOverflow,
    initData
  }
}

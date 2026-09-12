import { computed } from 'vue'

export function useAdminPagination(
  props: { currentPage: number; totalItems: number; itemsPerPage?: number; itemName?: string },
  emit: (event: 'update:currentPage', value: number) => void
) {
  const limit = computed(() => props.itemsPerPage || 10)
  const totalPages = computed(() => Math.ceil(props.totalItems / limit.value) || 1)
  const startItem = computed(() => (props.currentPage - 1) * limit.value + 1)
  const endItem = computed(() => Math.min(props.currentPage * limit.value, props.totalItems))

  const handlePrev = () => {
    if (props.currentPage > 1) {
      emit('update:currentPage', props.currentPage - 1)
    }
  }

  const handleNext = () => {
    if (props.currentPage < totalPages.value) {
      emit('update:currentPage', props.currentPage + 1)
    }
  }

  return {
    limit,
    totalPages,
    startItem,
    endItem,
    handlePrev,
    handleNext
  }
}

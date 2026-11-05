import { ref, computed } from 'vue'

export function useAsyncState() {
  const pendingCount = ref(0)
  const isLoading = computed({
    get: () => pendingCount.value > 0,
    set: (val: boolean) => {
      pendingCount.value = val ? Math.max(1, pendingCount.value) : 0
    }
  })
  const error = ref<string | null>(null)

  const execute = async <T>(
    asyncFn: () => Promise<T>,
    errorMessage: string = 'Có lỗi xảy ra, vui lòng thử lại!'
  ): Promise<T | undefined> => {
    pendingCount.value++
    error.value = null
    try {
      return await asyncFn()
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || errorMessage
      return undefined
    } finally {
      pendingCount.value = Math.max(0, pendingCount.value - 1)
    }
  }

  return {
    isLoading,
    error,
    execute
  }
}

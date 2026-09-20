import { ref } from 'vue'

export function useAsyncState() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const execute = async <T>(
    asyncFn: () => Promise<T>,
    errorMessage: string = 'Có lỗi xảy ra, vui lòng thử lại!'
  ): Promise<T | undefined> => {
    isLoading.value = true
    error.value = null
    try {
      return await asyncFn()
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || errorMessage
      return undefined
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    execute
  }
}

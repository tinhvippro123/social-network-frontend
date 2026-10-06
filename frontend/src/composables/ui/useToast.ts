import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Global state để lưu danh sách các toast
const toasts = ref<Toast[]>([])

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    toasts.value.push(newToast)

    const duration = toast.duration || 3000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => addToast({ type: 'success', message, duration })
  const error = (message: string, duration?: number) => addToast({ type: 'error', message, duration })
  const info = (message: string, duration?: number) => addToast({ type: 'info', message, duration })
  const warning = (message: string, duration?: number) => addToast({ type: 'warning', message, duration })

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}

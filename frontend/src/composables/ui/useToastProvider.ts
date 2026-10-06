import { useToast } from './useToast'
import { CheckCircle2, XCircle, Info, AlertTriangle } from '@lucide/vue'

export function useToastProvider() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle2
      case 'error': return XCircle
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return Info
    }
  }

  const getToastClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-white dark:bg-surface-800 border-green-500 text-green-700 dark:text-green-400'
      case 'error': return 'bg-white dark:bg-surface-800 border-red-500 text-red-700 dark:text-red-400'
      case 'warning': return 'bg-white dark:bg-surface-800 border-yellow-500 text-yellow-700 dark:text-yellow-400'
      case 'info': return 'bg-white dark:bg-surface-800 border-blue-500 text-blue-700 dark:text-blue-400'
      default: return 'bg-white dark:bg-surface-800 border-gray-500 text-gray-700 dark:text-gray-400'
    }
  }

  return {
    toasts,
    removeToast,
    getIcon,
    getToastClass
  }
}

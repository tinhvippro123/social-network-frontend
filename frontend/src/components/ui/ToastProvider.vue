<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from '@lucide/vue'

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
</script>

<template>
  <div class="fixed top-4 right-4 z-9999 flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
    <TransitionGroup 
      name="toast"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-full opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border-l-4 shadow-black/5 dark:shadow-black/20',
          getToastClass(toast.type)
        ]"
        role="alert"
      >
        <component :is="getIcon(toast.type)" class="w-5 h-5 shrink-0 mt-0.5" />
        <p class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{{ toast.message }}</p>
        <button 
          @click="removeToast(toast.id)"
          class="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

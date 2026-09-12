<script setup lang="ts">
import { X } from '@lucide/vue'
import { useToastProvider } from '@/composables/useToastProvider'

const { toasts, removeToast, getIcon, getToastClass } = useToastProvider()
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

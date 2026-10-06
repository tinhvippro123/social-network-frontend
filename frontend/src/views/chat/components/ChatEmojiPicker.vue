<script setup lang="ts">
import { Smile as SmileIcon } from '@lucide/vue'

withDefaults(defineProps<{
  show: boolean
  emojis?: string[]
}>(), {
  emojis: () => ['😀', '😂', '😅', '😍', '😒', '😘', '😭', '😎', '😢', '😡', '👍', '🙏', '🔥', '❤️', '✨', '🎉']
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'select', emoji: string): void
}>()
</script>

<template>
  <div class="relative inline-block">
    <button @click.stop="emit('update:show', !show)" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
      <SmileIcon :size="18" />
    </button>
    <!-- Emoji Picker -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 shadow-xl p-3 z-50"
        @click.stop
      >
        <p class="text-xs font-medium text-gray-500 mb-2">Biểu cảm</p>
        <div class="grid grid-cols-8 gap-1">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            @click="emit('select', emoji)"
            class="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

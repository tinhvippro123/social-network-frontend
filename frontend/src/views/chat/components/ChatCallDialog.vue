<script setup lang="ts">
import { Phone as PhoneIcon, Video as VideoIcon } from '@lucide/vue'

defineProps<{
  show: boolean
  type: 'audio' | 'video' | null
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="$emit('close')">
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl" @click.stop>
        <div class="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
          <component :is="type === 'audio' ? PhoneIcon : VideoIcon" :size="28" class="text-primary-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {{ type === 'audio' ? 'Gọi thoại' : 'Gọi video' }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Tính năng {{ type === 'audio' ? 'gọi thoại' : 'gọi video' }} đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo! 🚀
        </p>
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  </Transition>
</template>

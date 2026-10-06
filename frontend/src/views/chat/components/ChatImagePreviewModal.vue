<script setup lang="ts">
import { X as XIcon } from '@lucide/vue'

defineProps<{
  imagePreview: string | null
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
    <div v-if="imagePreview" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" @click="$emit('close')">
      <button class="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
        <XIcon :size="24" />
      </button>
      <img :src="imagePreview" alt="Preview" class="max-w-full max-h-full object-contain rounded-lg" />
    </div>
  </Transition>
</template>

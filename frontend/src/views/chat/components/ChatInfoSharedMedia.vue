<script setup lang="ts">
import { ImageIcon } from '@lucide/vue'
import { inject } from 'vue'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const { sharedMedia, openMediaView, imagePreview } = chatState
</script>

<template>
  <div class="p-4 border-b border-gray-100 dark:border-surface-700">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <ImageIcon :size="16" /> File phương tiện
      </h3>
    </div>
    <div class="grid grid-cols-3 gap-1.5">
      <template v-if="sharedMedia.length === 0">
        <div class="col-span-3 text-center text-xs text-gray-400 py-4">Chưa có ảnh/video nào</div>
      </template>
      <template v-else>
        <img
          v-for="media in sharedMedia.slice(0, 3)"
          :key="media.id"
          :src="media.imageUrl"
          alt=""
          class="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 dark:border-surface-700"
          @click="chatState.imagePreview = media.imageUrl || null"
        />
        <button
          v-if="sharedMedia.length > 3"
          @click="openMediaView('media')"
          class="w-full mt-1 py-1.5 col-span-3 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
        >
          Xem tất cả ({{ sharedMedia.length }})
        </button>
      </template>
    </div>
  </div>
</template>

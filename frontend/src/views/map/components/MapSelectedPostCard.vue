<script setup lang="ts">
import { useRouter } from 'vue-router'
import { X, MapPin, CalendarDays, Ruler } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDistance } from '@/composables/core/useMapView'
import type { Post } from '@/types'

const selectedPost = defineModel<Post | null>('selectedPost')

defineProps<{
  distanceTo: (post: Post) => number | null
  getCategoryEmoji: (slug: string) => string
  formatEventTime: (start: string, end?: string) => string
}>()

const router = useRouter()
</script>

<template>
  <transition name="slide-up">
    <div
      v-if="selectedPost"
      class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden z-1000"
    >
      <div class="relative">
        <img v-if="selectedPost.coverImage" :src="selectedPost.coverImage" class="w-full h-36 object-cover" />
        <div v-else class="w-full h-36 bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <MapPin :size="36" class="text-primary-500" />
        </div>
        <button
          @click="selectedPost = null"
          class="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Đóng"
        >
          <X :size="14" />
        </button>
        <!-- Category badge -->
        <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium text-white">
          {{ selectedPost.category?.name || 'Chưa phân loại' }}
        </div>
      </div>
      <div class="p-4">
        <h4 class="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{{ selectedPost.title }}</h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{{ selectedPost.excerpt }}</p>
        <div @click="selectedPost.author?.id && router.push(`/profile/${selectedPost.author.id}`)" class="flex items-center gap-2 mb-2 cursor-pointer group/author w-fit">
          <UserAvatar :user="selectedPost.author" size="sm" />
          <span class="text-sm text-gray-600 dark:text-gray-400 group-hover/author:text-primary-500 group-hover/author:underline">{{ selectedPost.author.name }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <MapPin :size="12" class="text-primary-500 shrink-0" />
          <span class="truncate">{{ selectedPost.location?.address }}</span>
        </div>
        <div v-if="distanceTo(selectedPost) !== null" class="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-semibold mb-2">
          <Ruler :size="12" />
          <span>Cách tâm tìm kiếm {{ formatDistance(distanceTo(selectedPost)!) }}</span>
        </div>
        <!-- Event time -->
        <div v-if="selectedPost.eventStartTime" class="flex items-center gap-2 text-xs text-amber-500 mb-3 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/10">
          <CalendarDays :size="12" />
          <span class="font-medium">{{ formatEventTime(selectedPost.eventStartTime, selectedPost.eventEndTime) }}</span>
        </div>
        <button
          @click="router.push(`/posts/${selectedPost.id}`)"
          class="w-full py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all"
        >
          Xem bài viết
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Calendar } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate } from '@/utils/formatters'

const props = defineProps<{
  post: any
}>()

const emit = defineEmits<{
  (e: 'select', post: any): void
}>()

const router = useRouter()

const goToProfile = (userId?: string) => {
  if (userId) {
    router.push(`/profile/${userId}`)
  }
}
</script>

<template>
  <article
    @click="emit('select', post)"
    class="flex flex-col sm:flex-row gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 hover:border-primary-500/40 hover:shadow-md transition-all group cursor-pointer"
  >
    <img
      v-if="post.coverImage"
      :src="post.coverImage"
      :alt="post.title"
      class="w-full sm:w-40 h-32 sm:h-28 rounded-xl object-cover shrink-0 bg-gray-100 dark:bg-surface-700 group-hover:scale-[1.02] transition-transform"
    />
    <div class="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 text-base leading-snug mb-1.5">
          {{ post.title }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {{ post.excerpt || post.content }}
        </p>
      </div>

      <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-surface-700/60 text-xs text-gray-400">
        <div
          @click.stop="goToProfile(post.author?.id)"
          class="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer"
          title="Xem trang cá nhân"
        >
          <UserAvatar :user="post.author" size="sm" />
          <span class="hover:underline">{{ post.author?.name || 'Thành viên' }}</span>
        </div>
        <span v-if="post.createdAt" class="flex items-center gap-1 text-gray-400">
          <Calendar :size="12" /> {{ formatDate(post.createdAt) }}
        </span>
      </div>
    </div>
  </article>
</template>

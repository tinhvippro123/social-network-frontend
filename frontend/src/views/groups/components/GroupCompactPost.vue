<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, MessageSquare, Heart } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate } from '@/utils/formatters'

const props = defineProps<{
  post: any
}>()

const emit = defineEmits<{
  (e: 'select', post: any): void
}>()

const router = useRouter()
const imageError = ref(false)

watch(
  () => props.post?.coverImage,
  () => {
    imageError.value = false
  }
)

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
    <div class="w-full sm:w-40 h-32 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-surface-700">
      <img
        v-if="post.coverImage && !imageError"
        :src="post.coverImage"
        :alt="post.title"
        @error="imageError = true"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div
        v-else
        class="w-full h-full bg-primary-50 dark:bg-surface-700 border border-primary-100/80 dark:border-surface-600/60 rounded-xl flex flex-col items-center justify-center gap-1.5 group-hover:scale-[1.02] transition-transform duration-300"
      >
        <div class="w-9 h-9 rounded-xl bg-white/85 dark:bg-surface-800/85 shadow-2xs flex items-center justify-center text-primary-500 dark:text-primary-400">
          <MessageSquare :size="18" />
        </div>
        <span class="text-[11px] font-semibold text-primary-600/80 dark:text-primary-300/80 tracking-wide">
          Thảo luận
        </span>
      </div>
    </div>
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
        <div class="ml-auto flex items-center gap-3 text-gray-400">
          <span class="flex items-center gap-1" title="Lượt thích">
            <Heart :size="12" :class="post.isLiked ? 'text-rose-500 fill-rose-500' : ''" /> {{ post.likesCount || 0 }}
          </span>
          <span class="flex items-center gap-1" title="Bình luận">
            <MessageSquare :size="12" /> {{ post.commentsCount || 0 }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

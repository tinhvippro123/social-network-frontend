<script setup lang="ts">
import { Sparkles, Hash, SmilePlus, Ghost } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatNumber } from '@/utils/formatters'
import { useRouter } from 'vue-router'

defineProps<{
  sidebarLoading: boolean
  suggestedPosts: any[]
  tags: any[]
}>()

const router = useRouter()
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0 space-y-5">
    <!-- Gợi ý cho bạn -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
        <Sparkles :size="18" class="text-amber-400" />
        Gợi ý cho bạn
      </h3>
      <div v-if="sidebarLoading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-start gap-3">
          <Skeleton type="text" class="w-7 h-7 rounded shrink-0" />
          <div class="flex-1 space-y-2">
            <Skeleton type="text" class="w-full" />
            <Skeleton type="text" class="w-24" />
          </div>
        </div>
      </div>
      <div v-else-if="suggestedPosts.length > 0" class="space-y-4">
        <div
          v-for="(post, i) in suggestedPosts"
          :key="post.id"
          @click="router.push(`/posts/${post.id}`)"
          class="flex items-start gap-3 cursor-pointer group"
        >
          <span class="text-2xl font-black text-gray-200 dark:text-surface-600 group-hover:text-primary-500 transition-colors shrink-0 w-7">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-primary-500 transition-colors">
              {{ post.title }}
            </p>
            <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span>{{ post.author.name }}</span>
              <span>·</span>
              <span class="flex items-center gap-0.5">
                <SmilePlus :size="10" /> {{ formatNumber(post.reactions?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="py-6 text-center text-gray-400">
        <Ghost :size="32" class="mx-auto mb-2 opacity-50" />
        <p class="text-sm">Chưa có bài viết gợi ý nào</p>
      </div>
    </div>

    <!-- Popular Tags -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
        <Hash :size="18" class="text-primary-500" />
        Tags phổ biến
      </h3>
      <div v-if="sidebarLoading" class="flex flex-wrap gap-2">
        <Skeleton v-for="i in 6" :key="i" type="button" class="w-20 h-8 rounded-xl" />
      </div>
      <div v-else-if="tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="tag in tags"
          :key="tag.id"
          class="px-3 py-1.5 bg-gray-50 dark:bg-surface-700 hover:bg-gray-100 dark:hover:bg-surface-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer border border-gray-200 dark:border-surface-600"
        >
          #{{ tag.name }}
        </span>
      </div>
      <div v-else class="py-4 text-center text-gray-400">
        <p class="text-sm">Chưa có tag phổ biến</p>
      </div>
    </div>
  </aside>
</template>

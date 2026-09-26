<script setup lang="ts">
import { Clock, Eye, MapPin, Edit3 } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import { useRouter } from 'vue-router'

defineProps<{
  post: any
  user: any
}>()

const router = useRouter()
</script>

<template>
  <div>
    <!-- Cover Image -->
    <div class="relative rounded-2xl overflow-hidden mb-6 h-64 sm:h-80">
      <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      <div class="absolute bottom-6 left-6 right-6">
        <span class="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-white/90 text-gray-700 mb-3">
          {{ post.category.icon }} {{ post.category.name }}
        </span>
        <h1 class="text-2xl sm:text-3xl font-bold text-white wrap-break-word">{{ post.title }}</h1>
      </div>
    </div>

    <!-- Author Info -->
    <div class="flex items-center justify-between mb-6 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4">
      <div class="flex items-center gap-3">
        <UserAvatar :user="post.author" size="lg" class="ring-2 ring-primary-500/30 cursor-pointer" @click="router.push(`/profile/${post.author.id}`)" />
        <div>
          <p class="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-primary-500 transition-colors" @click="router.push(`/profile/${post.author.id}`)">{{ post.author.name }}</p>
          <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
            <span class="flex items-center gap-1"><Clock :size="12" /> {{ formatDate(post.createdAt) }}</span>
            <span class="flex items-center gap-1"><Eye :size="12" /> {{ formatNumber(post.viewsCount) }} lượt xem</span>
            <span v-if="post.location" class="flex items-center gap-1"><MapPin :size="12" /> {{ post.location.address }}</span>
          </div>
        </div>
      </div>
      <!-- Edit button (only for own posts) -->
      <button
        v-if="user && user.id === post.author.id"
        @click="router.push(`/posts/${post.id}/edit`)"
        class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 border border-gray-200 dark:border-surface-700 transition-all"
      >
        <Edit3 :size="14" />
        <span class="hidden sm:inline">Chỉnh sửa</span>
      </button>
    </div>
  </div>
</template>

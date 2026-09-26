<script setup lang="ts">
import { Users, FileText, Globe, Lock } from '@lucide/vue'

defineProps<{
  group: any
}>()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6">
    <div class="h-48 relative overflow-hidden rounded-t-2xl">
      <img :src="group.coverImage" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
    </div>
    <div class="px-6 pb-6">
      <div class="flex items-start gap-4 -mt-10 relative z-10">
        <img :src="group.avatar" class="w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-surface-800 bg-gray-100 dark:bg-surface-700 shrink-0" />
        <div class="flex-1 pt-12">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ group.name }}</h1>
            <span :class="['flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium', group.isPublic ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400']">
              <Globe v-if="group.isPublic" :size="10" /> <Lock v-else :size="10" />
              {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ group.description }}</p>
        </div>
        <button class="shrink-0 mt-12 px-4 py-2 rounded-xl text-sm font-medium bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all">
          {{ group.isJoined ? 'Đã tham gia' : 'Tham gia' }}
        </button>
      </div>

      <div class="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-surface-700 text-sm text-gray-400">
        <span class="flex items-center gap-1"><Users :size="14" /> {{ group.membersCount.toLocaleString() }} thành viên</span>
        <span class="flex items-center gap-1"><FileText :size="14" /> {{ group.postsCount }} bài viết</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, MapPin, Link as LinkIcon, Edit3 } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { formatDate, formatNumber } from '@/utils/formatters'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps<{
  currentUser: any
}>()

const router = useRouter()
</script>

<template>
  <div class="relative bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6">
    <!-- Cover -->
    <div class="h-40 sm:h-52 bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden rounded-t-2xl">
      <div class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 20px 20px;"
      />
    </div>

    <!-- Avatar & Info -->
    <div class="px-6 pb-6">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 -mt-12 sm:-mt-16 relative z-10 text-center sm:text-left">
        <UserAvatar
          :user="currentUser"
          size="xl"
          class="ring-4 ring-white dark:ring-surface-800 shadow-xl bg-white"
        />
        <div class="flex-1 pt-2 sm:pt-20">
          <div class="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 sm:gap-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentUser.name }}</h1>
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 w-fit mx-auto sm:mx-0">
              {{ currentUser.role === 'admin' ? '👑 Admin' : '👤 Member' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentUser.bio }}</p>
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-400">
            <span class="flex items-center gap-1"><Calendar :size="12" /> Tham gia {{ formatDate(currentUser.joinedAt) }}</span>
            <span class="flex items-center gap-1"><MapPin :size="12" /> TP. Hồ Chí Minh</span>
            <span class="flex items-center gap-1"><LinkIcon :size="12" /> github.com/tinh</span>
          </div>
        </div>
        <button @click="router.push('/settings')" class="shrink-0 mt-4 sm:mt-20 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
          <Edit3 :size="14" /> Chỉnh sửa
        </button>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-surface-700">
        <div class="text-center">
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentUser.postsCount }}</p>
          <p class="text-xs text-gray-400">Bài viết</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatNumber(currentUser.followersCount) }}</p>
          <p class="text-xs text-gray-400">Followers</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentUser.followingCount }}</p>
          <p class="text-xs text-gray-400">Following</p>
        </div>
      </div>
    </div>
  </div>
</template>

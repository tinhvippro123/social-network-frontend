<script setup lang="ts">
import { Calendar, Globe, Lock, Shield } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatDate } from '@/utils/formatters'

defineProps<{
  group: any
  users: any[]
  isUsersLoading: boolean
}>()
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0 space-y-5">
    <!-- Thông tin nhóm -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3">📊 Thống kê</h3>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Thành viên</span>
          <span class="font-semibold text-gray-900 dark:text-white">{{ group.membersCount.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Bài viết</span>
          <span class="font-semibold text-gray-900 dark:text-white">{{ group.postsCount }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Ngày tạo</span>
          <span class="font-semibold text-gray-900 dark:text-white">{{ formatDate(group.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Quản trị viên -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3">👑 Quản trị viên</h3>
      <div class="flex items-center gap-3">
        <UserAvatar :user="group.owner" size="md" class="ring-2 ring-primary-500/30" />
        <div>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ group.owner.name }}</p>
          <p class="text-xs text-gray-400">{{ group.owner.postsCount }} bài viết</p>
        </div>
      </div>
    </div>

    <!-- Thành viên nổi bật -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3">⭐ Thành viên nổi bật</h3>
      <div v-if="isUsersLoading" class="space-y-3">
        <Skeleton v-for="i in 4" :key="i" class="h-10 w-full rounded-lg" />
      </div>
      <div v-else-if="users.length" class="space-y-3">
        <div v-for="user in users.slice(0, 4)" :key="user.id" class="flex items-center gap-3">
          <UserAvatar :user="user" size="sm" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</p>
            <p class="text-xs text-gray-400">{{ user.postsCount }} bài viết</p>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500 text-center py-4">Chưa có thành viên</div>
    </div>

    <!-- Quy tắc nhóm -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3">📜 Quy tắc nhóm</h3>
      <ol class="space-y-2 text-sm text-gray-500">
        <li class="flex gap-2"><span class="text-primary-500 font-bold">1.</span> Tôn trọng lẫn nhau</li>
        <li class="flex gap-2"><span class="text-primary-500 font-bold">2.</span> Không spam, quảng cáo</li>
        <li class="flex gap-2"><span class="text-primary-500 font-bold">3.</span> Bài viết phải có nội dung chất lượng</li>
        <li class="flex gap-2"><span class="text-primary-500 font-bold">4.</span> Gắn tag phù hợp với nội dung</li>
      </ol>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { User as UserIcon, BellOff as BellOffIcon, Search as SearchIcon } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatInfoQuickAction from './ChatInfoQuickAction.vue'

defineProps<{
  conversation: {
    id: string
    name: string
    avatar: string
    isOnline: boolean
  }
}>()

defineEmits<{
  (e: 'viewProfile'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center p-6 text-center">
    <UserAvatar :user="{ name: conversation.name, avatar: conversation.avatar }" size="xl" class="mb-3" />
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ conversation.name }}</h2>
    <p v-if="conversation.isOnline" class="text-sm text-green-500 font-medium mb-2">Đang hoạt động</p>
    <p v-else class="text-sm text-gray-500 mb-2">Hoạt động 15 phút trước</p>

    <!-- Quick Actions -->
    <div class="flex gap-6 mt-4">
      <ChatInfoQuickAction
        label="Trang cá nhân"
        :icon="UserIcon"
        @click="$emit('viewProfile')"
      />
      <ChatInfoQuickAction
        label="Tắt thông báo"
        :icon="BellOffIcon"
      />
      <ChatInfoQuickAction
        label="Tìm kiếm"
        :icon="SearchIcon"
      />
    </div>
  </div>
</template>

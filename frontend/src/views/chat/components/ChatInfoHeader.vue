<script setup lang="ts">
import { User as UserIcon, Bell as BellIcon, BellOff as BellOffIcon, Search as SearchIcon } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatInfoQuickAction from './ChatInfoQuickAction.vue'

defineProps<{
  conversation: {
    id: string
    name: string
    avatar: string
    isOnline: boolean
    isMuted?: boolean
    isGroup?: boolean
  }
}>()

defineEmits<{
  (e: 'viewProfile'): void
  (e: 'toggleMute'): void
  (e: 'openSearch'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center p-6 text-center">
    <UserAvatar :user="{ name: conversation.name, avatar: conversation.avatar }" size="xl" class="mb-3" />
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ conversation.name }}</h2>
    <p v-if="conversation.isOnline" class="text-sm text-green-500 font-medium mb-2">Đang hoạt động</p>
    <p v-else class="text-sm text-gray-500 mb-2">Hoạt động gần đây</p>

    <!-- Quick Actions -->
    <div class="flex gap-6 mt-4">
      <ChatInfoQuickAction
        v-if="!conversation.isGroup"
        label="Trang cá nhân"
        :icon="UserIcon"
        @click="$emit('viewProfile')"
      />
      <ChatInfoQuickAction
        :label="conversation.isMuted ? 'Bật thông báo' : 'Tắt thông báo'"
        :icon="conversation.isMuted ? BellIcon : BellOffIcon"
        @click="$emit('toggleMute')"
      />
      <ChatInfoQuickAction
        label="Tìm kiếm"
        :icon="SearchIcon"
        @click="$emit('openSearch')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/auth.store'
import type { ChatMessage, ChatConversation } from '@/types'

const props = defineProps<{
  msg: ChatMessage
  conversation: ChatConversation | null
}>()

const authStore = useAuthStore()

const otherParticipant = computed(() => {
  const parts = props.conversation?.participants || []
  return parts.find(p => p.id && p.id !== authStore.user?.id) || parts[0] || null
})
</script>

<template>
  <div class="mt-1">
    <div class="flex items-center -space-x-1">
      <template v-if="msg.readBy && msg.readBy.length > 0">
        <UserAvatar
          v-for="reader in msg.readBy.slice(0, 3)"
          :key="reader.user.id"
          :user="reader.user"
          class="w-5 h-5 ring-[1.5px] ring-white dark:ring-surface-800 relative z-10 cursor-default"
          size="sm"
          :title="reader.user.name"
        />
        <div v-if="msg.readBy.length > 3" :title="msg.readBy.slice(3).map(r => r.user.name).join(', ')" class="w-5 h-5 rounded-full bg-gray-200 dark:bg-surface-700 flex items-center justify-center text-[9px] font-semibold text-gray-600 dark:text-gray-300 ring-[1.5px] ring-white dark:ring-surface-800 relative z-0 cursor-default">
          +{{ msg.readBy.length - 3 }}
        </div>
      </template>
      <UserAvatar
        v-else-if="otherParticipant"
        :user="otherParticipant"
        class="w-5 h-5 cursor-default ring-[1.5px] ring-white dark:ring-surface-800"
        size="sm"
        :title="otherParticipant.name"
      />
    </div>
  </div>
</template>

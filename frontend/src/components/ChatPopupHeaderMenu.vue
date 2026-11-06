<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MessageCircle, User as UserIcon, Edit, Users,
  Bell, BellOff, Ban, Archive, Trash2, AlertTriangle
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'
import type { ChatConversation } from '@/types'
import { useToast } from '@/composables/ui/useToast'
import { useConfirm } from '@/composables/ui/useConfirm'
import chatApi from '@/api/chat.api'
import http from '@/api/client'

const props = defineProps<{
  conv: ChatConversation
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'clear-chat'): void
  (e: 'close-window'): void
  (e: 'open-nickname'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { confirm } = useConfirm()

const blockedUserIds = ref<Set<string>>(new Set())

async function loadBlockedUsers() {
  try {
    const res = await chatApi.getBlockedUsers()
    const list = res.data?.data || []
    blockedUserIds.value = new Set(list.map((u: any) => typeof u === 'string' ? u : u.id))
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadBlockedUsers()
  window.addEventListener('chat-block-updated', loadBlockedUsers)
})

onUnmounted(() => {
  window.removeEventListener('chat-block-updated', loadBlockedUsers)
})

const otherParticipantId = computed(() => {
  if (props.conv.isGroup) return undefined
  const other = props.conv.participants?.find(p => p.id && p.id !== authStore.user?.id)
  const rawId = other?.id || (props.conv.id.startsWith('new-') ? props.conv.id.replace(/^new-/, '') : undefined)
  return rawId?.startsWith('new-') ? rawId.replace(/^new-/, '') : rawId
})

const isBlocked = computed(() => {
  return otherParticipantId.value ? blockedUserIds.value.has(otherParticipantId.value) : false
})

const isMuted = computed(() => !!props.conv.isMuted)

const menuGroups = computed(() => {
  const isGroup = !!props.conv.isGroup
  const groups: Array<Array<{ icon: any; label: string; action: string; active?: boolean; danger?: boolean }>> = [
    [
      { icon: MessageCircle, label: 'Mở trong tab Tin nhắn', action: 'open-tab' },
      ...(!isGroup && otherParticipantId.value ? [{ icon: UserIcon, label: 'Xem trang cá nhân', action: 'profile' }] : []),
    ],
  ]

  if (!isGroup) {
    groups.push([{ icon: Edit, label: 'Biệt danh', action: 'nickname' }])
  }

  groups.push([
    ...(!isGroup ? [{ icon: Users, label: 'Tạo nhóm với người này', action: 'create-group' }] : []),
    {
      icon: isMuted.value ? Bell : BellOff,
      label: isMuted.value ? 'Bật thông báo' : 'Tắt thông báo',
      action: 'mute',
      active: isMuted.value
    },
    ...(!isGroup && otherParticipantId.value
      ? [{ icon: Ban, label: isBlocked.value ? 'Bỏ chặn' : 'Chặn', action: 'block', danger: !isBlocked.value }]
      : []),
  ])

  groups.push([
    { icon: Archive, label: 'Lưu trữ đoạn chat', action: 'archive' },
    { icon: Trash2, label: 'Xóa đoạn chat', action: 'delete', danger: true },
    ...(!isGroup && otherParticipantId.value
      ? [{ icon: AlertTriangle, label: 'Báo cáo', action: 'report', danger: true }]
      : []),
  ])

  return groups
})

const handleAction = async (action: string) => {
  const resolvedUserId = otherParticipantId.value

  switch (action) {
    case 'open-tab':
      emit('close')
      if (props.conv.id.startsWith('new-')) {
        router.push(`/chat?userId=${props.conv.id.replace(/^new-/, '')}`)
      } else {
        router.push(`/chat?id=${props.conv.id}`)
      }
      emit('close-window')
      break

    case 'profile': {
      emit('close')
      if (resolvedUserId) {
        window.open(router.resolve(`/profile/${resolvedUserId}`).href, '_blank', 'noopener')
      }
      break
    }

    case 'nickname': {
      emit('close')
      emit('open-nickname')
      break
    }

    case 'create-group': {
      emit('close')
      toast.info('Đang mở trình tạo nhóm chat...')
      router.push({
        path: '/chat',
        query: {
          createGroup: 'true',
          memberId: resolvedUserId || undefined
        }
      })
      emit('close-window')
      break
    }

    case 'mute': {
      emit('close')
      const nextState = !props.conv.isMuted
      props.conv.isMuted = nextState
      try {
        if (!props.conv.id.startsWith('new-')) {
          await chatApi.muteConversation(props.conv.id, nextState)
        }
        window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
        toast.success(nextState ? 'Đã tắt thông báo cuộc trò chuyện' : 'Đã bật lại thông báo cuộc trò chuyện')
      } catch {
        props.conv.isMuted = !nextState
      }
      break
    }

    case 'block': {
      if (!resolvedUserId) {
        emit('close')
        break
      }
      if (isBlocked.value) {
        emit('close')
        try {
          await chatApi.unblockUser(resolvedUserId)
          window.dispatchEvent(new CustomEvent('chat-block-updated'))
          toast.success(`Đã bỏ chặn ${props.conv.name}`)
        } catch {
          // Handled by axios error interceptor
        }
        break
      }
      const ok = await confirm({
        title: 'Chặn người dùng',
        message: `Bạn có chắc muốn chặn ${props.conv.name}? Hai bạn sẽ không thể gửi tin nhắn cho nhau nữa.`,
        confirmText: 'Chặn',
        variant: 'danger'
      })
      emit('close')
      if (ok) {
        try {
          await chatApi.blockUser(resolvedUserId)
          window.dispatchEvent(new CustomEvent('chat-block-updated'))
          window.dispatchEvent(new CustomEvent('chat-conversation-removed', { detail: { id: props.conv.id } }))
          toast.success(`Đã chặn ${props.conv.name}`)
          emit('close-window')
        } catch {
          // Handled by axios error interceptor
        }
      }
      break
    }

    case 'archive': {
      emit('close')
      try {
        if (!props.conv.id.startsWith('new-')) {
          await chatApi.hideConversation(props.conv.id)
        }
        window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
        window.dispatchEvent(new CustomEvent('chat-conversation-removed', { detail: { id: props.conv.id } }))
        toast.success('Đã lưu trữ và ẩn đoạn chat khỏi màn hình')
        emit('close-window')
      } catch {
        // Handled by axios error interceptor
      }
      break
    }

    case 'delete': {
      const ok = await confirm({
        title: 'Xóa đoạn chat',
        message: `Hành động này sẽ xóa các tin nhắn hiển thị trong cuộc trò chuyện với ${props.conv.name}. Bạn có chắc chắn không?`,
        confirmText: 'Xóa vĩnh viễn',
        variant: 'danger'
      })
      emit('close')
      if (ok) {
        try {
          if (!props.conv.id.startsWith('new-')) {
            await chatApi.deleteConversation(props.conv.id)
          }
          window.dispatchEvent(new CustomEvent('chat-conversations-sync'))
          window.dispatchEvent(new CustomEvent('chat-conversation-removed', { detail: { id: props.conv.id } }))
          emit('clear-chat')
          toast.success('Đã xóa đoạn chat')
          emit('close-window')
        } catch {
          // Handled by axios error interceptor
        }
      }
      break
    }

    case 'report': {
      if (!resolvedUserId) {
        emit('close')
        break
      }
      const ok = await confirm({
        title: 'Báo cáo cuộc trò chuyện',
        message: `Bạn có muốn báo cáo cuộc trò chuyện với ${props.conv.name} vì nội dung không phù hợp không?`,
        confirmText: 'Gửi báo cáo',
        variant: 'warning'
      })
      emit('close')
      if (!ok) break
      try {
        await http.post('/reports', {
          targetId: resolvedUserId,
          type: 'USER',
          reason: 'Nội dung tin nhắn không phù hợp / quấy rối',
          description: `Báo cáo cuộc trò chuyện với ${props.conv.name}`
        })
        toast.success('Đã gửi báo cáo vi phạm tới Ban Quản trị hệ thống')
      } catch {
        // Handled by axios error interceptor
      }
      break
    }
  }
}
</script>

<template>
  <div class="absolute top-2 right-full mr-2 w-72 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 shadow-2xl rounded-2xl z-100 max-h-100 overflow-y-auto scrollbar-thin animate-in fade-in zoom-in-95 duration-150">
    <div class="p-2 space-y-0.5">
      <template v-for="(group, groupIdx) in menuGroups" :key="groupIdx">
        <button 
          v-for="(item, itemIdx) in group" 
          :key="itemIdx"
          @click="handleAction(item.action)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors text-left cursor-pointer active:scale-98',
            item.danger
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700'
          ]"
        >
          <component
            :is="item.icon"
            :size="18"
            :class="item.danger ? 'text-red-500 shrink-0' : item.active ? 'text-amber-500 shrink-0' : 'text-gray-500 shrink-0'"
          />
          <span class="font-medium truncate">{{ item.label }}</span>
        </button>
        <div v-if="groupIdx < menuGroups.length - 1" class="h-px bg-gray-200 dark:bg-surface-700 my-1 mx-2"></div>
      </template>
    </div>
  </div>
</template>

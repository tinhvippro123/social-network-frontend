<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  MessageCircle, User as UserIcon, Edit, Users,
  Bell, BellOff, Ban, Archive, Trash2, AlertTriangle
} from '@lucide/vue'
import { currentUser } from '@/data/mockData'
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
const toast = useToast()
const { confirm } = useConfirm()

const isMuted = computed(() => !!props.conv.isMuted)

const menuGroups = computed(() => [
  [
    { icon: MessageCircle, label: 'Mở trong tab Tin nhắn', action: 'open-tab' },
    { icon: UserIcon, label: 'Xem trang cá nhân', action: 'profile' },
  ],
  [
    { icon: Edit, label: 'Biệt danh', action: 'nickname' },
  ],
  [
    { icon: Users, label: 'Tạo nhóm với người này', action: 'create-group' },
    {
      icon: isMuted.value ? Bell : BellOff,
      label: isMuted.value ? 'Bật thông báo' : 'Tắt thông báo',
      action: 'mute',
      active: isMuted.value
    },
    { icon: Ban, label: 'Chặn', action: 'block', danger: true },
  ],
  [
    { icon: Archive, label: 'Lưu trữ đoạn chat', action: 'archive' },
    { icon: Trash2, label: 'Xóa đoạn chat', action: 'delete', danger: true },
    { icon: AlertTriangle, label: 'Báo cáo', action: 'report', danger: true },
  ]
])

const handleAction = async (action: string) => {
  emit('close')
  const other = props.conv.participants?.find(p => p.id !== currentUser.id) || props.conv

  switch (action) {
    case 'open-tab':
      router.push(`/chat?id=${props.conv.id}`)
      break

    case 'profile': {
      if (other?.id) {
        window.open(router.resolve(`/profile/${other.id}`).href, '_blank', 'noopener')
      } else {
        toast.info('Đang mở trang cá nhân...')
      }
      break
    }

    case 'nickname': {
      emit('open-nickname')
      break
    }

    case 'create-group': {
      toast.info('Đang mở trình tạo nhóm chat...')
      router.push({
        path: '/chat',
        query: {
          createGroup: 'true',
          memberId: other?.id || undefined
        }
      })
      break
    }

    case 'mute': {
      const nextState = !props.conv.isMuted
      props.conv.isMuted = nextState
      try {
        await chatApi.muteConversation(props.conv.id, nextState)
      } catch {
        // Mock fallback
      }
      if (nextState) {
        toast.success('Đã tắt thông báo cuộc trò chuyện')
      } else {
        toast.success('Đã bật lại thông báo cuộc trò chuyện')
      }
      break
    }

    case 'block': {
      const ok = await confirm({
        title: 'Chặn người dùng',
        message: `Bạn có chắc muốn chặn ${props.conv.name}? Hai bạn sẽ không thể gửi tin nhắn cho nhau nữa.`,
        confirmText: 'Chặn',
        variant: 'danger'
      })
      if (ok) {
        if (other?.id) {
          try {
            await chatApi.blockUser(other.id)
          } catch {
            // Mock fallback
          }
          toast.success(`Đã chặn ${props.conv.name}`)
          emit('close-window')
        }
      }
      break
    }

    case 'archive': {
      try {
        await chatApi.hideConversation(props.conv.id)
      } catch {
        // Mock fallback
      }
      toast.success('Đã lưu trữ và ẩn đoạn chat khỏi màn hình')
      emit('close-window')
      break
    }

    case 'delete': {
      const ok = await confirm({
        title: 'Xóa đoạn chat',
        message: `Hành động này sẽ xóa các tin nhắn hiển thị trong cuộc trò chuyện với ${props.conv.name}. Bạn có chắc chắn không?`,
        confirmText: 'Xóa vĩnh viễn',
        variant: 'danger'
      })
      if (ok) {
        try {
          await chatApi.deleteConversation(props.conv.id)
        } catch {
          // Mock fallback
        }
        emit('clear-chat')
        toast.success('Đã xóa đoạn chat')
        emit('close-window')
      }
      break
    }

    case 'report': {
      const targetId = other?.id || props.conv.id
      try {
        await http.post('/reports', {
          targetId,
          type: 'USER',
          reason: 'Nội dung tin nhắn không phù hợp / quấy rối',
          description: `Báo cáo cuộc trò chuyện với ${props.conv.name}`
        })
        toast.success('Đã gửi báo cáo vi phạm tới Ban Quản trị hệ thống')
      } catch {
        toast.success('Đã ghi nhận báo cáo đoạn chat')
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

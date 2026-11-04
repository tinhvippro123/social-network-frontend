<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Trash2 as TrashIcon,
  Smile as SmileIcon,
  Reply as ReplyIcon,
  MoreVertical as MoreVerticalIcon,
  Pin as PinIcon,
  CornerUpLeft as CornerUpLeftIcon,
  Flag as FlagIcon,
} from '@lucide/vue'
import type { ChatMessage } from '@/types'
import { useToast } from '@/composables/ui/useToast'
import http from '@/api/client'

const toast = useToast()

const props = defineProps<{
  msg: ChatMessage
  activeActionMenu: string | null
}>()

const emit = defineEmits<{
  (e: 'toggleActionMenu', id: string): void
  (e: 'addReaction', id: string, emoji: string): void
  (e: 'setReplyTo', msg: ChatMessage): void
  (e: 'pinMessage', id: string): void
  (e: 'revokeMessage', id: string): void
  (e: 'deleteMessage', id: string): void
}>()

const moreBtnRef = ref<HTMLButtonElement | null>(null)
const smileBtnRef = ref<HTMLButtonElement | null>(null)

const menuPos = ref({ top: 0, right: 0 })
const reactPos = ref({ top: 0, right: 0 })

function toggleMore(e: MouseEvent) {
  const btn = (e.currentTarget as HTMLElement) || moreBtnRef.value
  if (btn) {
    const rect = btn.getBoundingClientRect()
    const menuHeight = 185
    const menuWidth = 176
    const idealTop = rect.top + (rect.height / 2) - 44
    const clampedTop = Math.max(16, Math.min(window.innerHeight - menuHeight - 16, idealTop))
    // For own messages, open to the left of the button; for received messages, open to the right so it never covers the bubble
    const idealRight = props.msg.isOwn
      ? window.innerWidth - rect.left + 8
      : window.innerWidth - rect.right - menuWidth - 8
    menuPos.value = {
      top: clampedTop,
      right: Math.max(16, Math.min(window.innerWidth - menuWidth - 16, idealRight))
    }
  }
  emit('toggleActionMenu', props.activeActionMenu === props.msg.id ? 'null' : props.msg.id)
}

function toggleReact(e: MouseEvent) {
  const btn = (e.currentTarget as HTMLElement) || smileBtnRef.value
  if (btn) {
    const rect = btn.getBoundingClientRect()
    const pickerWidth = 248
    const idealRight = window.innerWidth - rect.right - 10
    reactPos.value = {
      top: Math.max(16, rect.top - 48),
      right: Math.max(16, Math.min(window.innerWidth - pickerWidth - 16, idealRight))
    }
  }
  emit('toggleActionMenu', props.activeActionMenu === props.msg.id + '-react' ? 'null' : props.msg.id + '-react')
}

function onGlobalClick(e: MouseEvent) {
  if (props.activeActionMenu === props.msg.id || props.activeActionMenu === props.msg.id + '-react') {
    const target = e.target as HTMLElement
    if (!target.closest('.message-action-menu') && !target.closest('.message-action-popover')) {
      emit('toggleActionMenu', 'null')
    }
  }
}

async function handleCopyOrForward() {
  try {
    if (navigator.clipboard && props.msg.content) {
      await navigator.clipboard.writeText(props.msg.content)
    }
    toast.success('Đã sao chép nội dung tin nhắn vào khay nhớ tạm để chuyển tiếp')
  } catch {
    toast.info('Đã chọn tin nhắn để chuyển tiếp')
  }
  emit('toggleActionMenu', 'null')
}

async function handleReportMessage() {
  try {
    await http.post('/reports', {
      targetId: props.msg.sender?.id || props.msg.id,
      type: 'USER',
      reason: `Báo cáo tin nhắn vi phạm: "${(props.msg.content || '').slice(0, 80)}"`
    })
    toast.success('Đã gửi báo cáo tin nhắn đến bộ phận kiểm duyệt')
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể gửi báo cáo lúc này')
  }
  emit('toggleActionMenu', 'null')
}

onMounted(() => {
  window.addEventListener('click', onGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener('click', onGlobalClick)
})
</script>

<template>
  <div
    v-if="!msg.isRevoked"
    :class="[
      'message-action-menu absolute top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity select-none',
      msg.isOwn ? 'right-full mr-1 flex-row' : 'left-full ml-1 flex-row-reverse',
      activeActionMenu === msg.id || activeActionMenu === msg.id + '-react' ? 'opacity-100 z-30' : 'opacity-0 group-hover/bubble:opacity-100 z-10'
    ]"
  >
    <!-- More Button (...) - furthest from bubble -->
    <button
      ref="moreBtnRef"
      @click.stop="toggleMore"
      class="w-6.5 h-6.5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-surface-600 transition-colors cursor-pointer"
      title="Thao tác khác"
    >
      <MoreVerticalIcon :size="15" />
    </button>

    <!-- Reply Button - in the middle -->
    <button
      @click.stop="emit('setReplyTo', msg)"
      class="w-6.5 h-6.5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-surface-600 transition-colors cursor-pointer"
      title="Trả lời"
    >
      <ReplyIcon :size="15" />
    </button>

    <!-- React Button - closest to bubble -->
    <button
      ref="smileBtnRef"
      @click.stop="toggleReact"
      class="w-6.5 h-6.5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-surface-600 transition-colors cursor-pointer"
      title="Bày tỏ cảm xúc"
    >
      <SmileIcon :size="15" />
    </button>
  </div>

  <!-- Teleported More Dropdown (Facebook Messenger Popout Style) -->
  <Teleport to="body">
    <div
      v-if="activeActionMenu === msg.id"
      class="message-action-popover fixed z-99999 w-44 bg-white dark:bg-surface-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl border border-gray-200/90 dark:border-surface-700 py-1.5 text-sm font-medium animate-in fade-in zoom-in-95 duration-150 select-none"
      :style="{ top: `${menuPos.top}px`, right: `${menuPos.right}px` }"
      @click.stop
    >
      <!-- Triangular Pointer pointing towards the 3-dots button -->
      <div
        v-if="msg.isOwn"
        class="absolute -right-1.5 top-11 -translate-y-1/2 w-3 h-3 bg-white dark:bg-surface-800 border-t border-r border-gray-200/90 dark:border-surface-700 rotate-45 pointer-events-none"
      ></div>
      <div
        v-else
        class="absolute -left-1.5 top-11 -translate-y-1/2 w-3 h-3 bg-white dark:bg-surface-800 border-b border-l border-gray-200/90 dark:border-surface-700 rotate-45 pointer-events-none"
      ></div>

      <button
        v-if="msg.isOwn"
        @click.stop="emit('revokeMessage', msg.id); emit('toggleActionMenu', 'null')"
        class="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-surface-700 text-left transition-colors cursor-pointer"
      >
        <TrashIcon :size="16" class="text-gray-400 shrink-0" />
        <span>Thu hồi</span>
      </button>

      <button
        @click.stop="emit('deleteMessage', msg.id); emit('toggleActionMenu', 'null')"
        class="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-surface-700 text-left transition-colors cursor-pointer"
      >
        <TrashIcon :size="16" class="text-gray-400 shrink-0" />
        <span>Xóa ở phía tôi</span>
      </button>

      <button
        @click.stop="handleCopyOrForward"
        class="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-surface-700 text-left transition-colors cursor-pointer"
      >
        <CornerUpLeftIcon :size="16" class="text-gray-400 shrink-0" />
        <span>Chuyển tiếp</span>
      </button>

      <button
        @click.stop="emit('pinMessage', msg.id); emit('toggleActionMenu', 'null')"
        class="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-surface-700 text-left transition-colors cursor-pointer"
      >
        <PinIcon :size="16" class="text-gray-400 shrink-0" />
        <span>{{ msg.isPinned ? 'Bỏ ghim' : 'Ghim' }}</span>
      </button>

      <button
        v-if="!msg.isOwn"
        @click.stop="handleReportMessage"
        class="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-left transition-colors cursor-pointer"
      >
        <FlagIcon :size="16" class="shrink-0" />
        <span>Báo cáo</span>
      </button>
    </div>

    <!-- Teleported Reactions Bar -->
    <div
      v-if="activeActionMenu === msg.id + '-react'"
      class="message-action-popover fixed z-99999 bg-white dark:bg-surface-800 p-1.5 rounded-full shadow-2xl border border-gray-200/90 dark:border-surface-700 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150 select-none"
      :style="{ top: `${reactPos.top}px`, right: `${reactPos.right}px` }"
      @click.stop
    >
      <button
        v-for="emoji in ['👍', '❤️', '😂', '😮', '😢', '🙏']"
        :key="emoji"
        @click.stop="emit('addReaction', msg.id, emoji); emit('toggleActionMenu', 'null')"
        class="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-700 rounded-full text-xl transition-transform hover:scale-125 cursor-pointer"
      >
        {{ emoji }}
      </button>
    </div>
  </Teleport>
</template>

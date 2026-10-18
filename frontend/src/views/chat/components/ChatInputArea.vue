<script setup lang="ts">
import { inject, ref, watch, nextTick } from 'vue'
import {
  X as XIcon,
  Paperclip as PaperclipIcon,
  Image as ImageIcon,
  Smile as SmileIcon,
  Send as SendIcon
} from '@lucide/vue'
import ChatEmojiPicker from './ChatEmojiPicker.vue'
import ChatInputReplyBar from './ChatInputReplyBar.vue'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const {
  replyingTo,
  newMessage,
  showEmojiPicker,
  emojiList,
  handleSendFile,
  handleSendImage,
  handleSendMessage,
  insertEmoji
} = chatState

const textareaRef = ref<HTMLTextAreaElement | null>(null)

function adjustHeight() {
  const el = textareaRef.value
  if (!el) return
  
  // Save current scroll position in case we are editing in the middle
  const currentScrollTop = el.scrollTop
  const isAtBottom = el.selectionStart === el.value.length

  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`

  // Restore or update scroll position
  if (isAtBottom) {
    el.scrollTop = el.scrollHeight
  } else {
    el.scrollTop = currentScrollTop
  }
}

watch(() => newMessage.value, () => {
  nextTick(() => {
    adjustHeight()
  })
})
</script>

<template>
  <div>
    <!-- Reply Bar -->
    <ChatInputReplyBar :replying-to="replyingTo" @close="replyingTo = null" />

    <!-- Message Input -->
    <div class="px-4 py-3 border-t border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
      <div class="flex items-end gap-2">
        <div class="flex items-center gap-1 pb-1.5">
          <!-- File attach -->
          <label class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
            <PaperclipIcon :size="18" />
            <input type="file" class="hidden" @change="handleSendFile" accept=".pdf,.doc,.docx,.txt,.zip,.rar" />
          </label>
          <!-- Image attach -->
          <label class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
            <ImageIcon :size="18" />
            <input type="file" class="hidden" @change="handleSendImage" accept="image/*" />
          </label>
        </div>
        <div class="flex-1 flex items-end gap-2 bg-gray-100 dark:bg-surface-700 rounded-2xl px-4 py-2 relative">
          <textarea
            ref="textareaRef"
            v-model="newMessage"
            @keydown.enter.exact.prevent="handleSendMessage"
            placeholder="Nhập tin nhắn..."
            rows="1"
            class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none max-h-32 overflow-y-auto custom-scrollbar py-1.5 leading-relaxed"
          />
          <ChatEmojiPicker 
            v-model:show="showEmojiPicker"
            :emojis="emojiList"
            @select="insertEmoji"
          />
        </div>
        <button
          @click="handleSendMessage"
          :disabled="!newMessage?.trim()"
          class="p-3 rounded-xl gradient-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

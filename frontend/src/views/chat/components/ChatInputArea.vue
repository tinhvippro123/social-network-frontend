<script setup lang="ts">
import { inject } from 'vue'
import {
  X as XIcon,
  Paperclip as PaperclipIcon,
  Image as ImageIcon,
  Smile as SmileIcon,
  Send as SendIcon
} from '@lucide/vue'

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
</script>

<template>
  <div>
    <!-- Reply Bar -->
    <div v-if="replyingTo" class="flex items-center gap-3 px-4 py-2 border-t border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800">
      <div class="w-1 h-8 bg-primary-500 rounded-full shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-primary-500">Đang trả lời {{ replyingTo.sender.name }}</p>
        <p class="text-xs text-gray-500 truncate">{{ replyingTo.content || (replyingTo.type === 'image' ? 'Hình ảnh' : 'Tệp đính kèm ' + replyingTo.fileName) }}</p>
      </div>
      <button @click="replyingTo = null" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
        <XIcon :size="16" />
      </button>
    </div>

    <!-- Message Input -->
    <div class="px-4 py-3 border-t border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800">
      <div class="flex items-end gap-2">
        <div class="flex items-center gap-1">
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
            v-model="newMessage"
            @keydown.enter.exact.prevent="handleSendMessage"
            placeholder="Nhập tin nhắn..."
            rows="1"
            class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none max-h-24"
          />
          <!-- Emoji button -->
          <div class="relative">
            <button @click.stop="showEmojiPicker = !showEmojiPicker" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <SmileIcon :size="18" />
            </button>
            <!-- Emoji Picker -->
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 scale-95"
              leave-active-class="transition duration-100 ease-in"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showEmojiPicker"
                class="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 shadow-xl p-3 z-50"
                @click.stop
              >
                <p class="text-xs font-medium text-gray-500 mb-2">Biểu cảm</p>
                <div class="grid grid-cols-8 gap-1">
                  <button
                    v-for="emoji in emojiList"
                    :key="emoji"
                    @click="insertEmoji(emoji)"
                    class="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
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

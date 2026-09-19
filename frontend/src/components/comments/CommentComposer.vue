<template>
  <div 
    class="flex-1 relative flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/50 transition-all border"
    :class="[
      compact 
        ? 'bg-white dark:bg-surface-800 border-primary-200 dark:border-primary-800/50 rounded-xl' 
        : 'bg-gray-50 dark:bg-surface-700 border-gray-200 dark:border-surface-600 rounded-2xl'
    ]"
  >
    <!-- Slot for Replying To indicator (mainly for main composer) -->
    <slot name="header"></slot>

    <!-- Image Preview -->
    <div v-if="attachedImagePreview" class="px-3 pt-2">
      <div class="relative inline-block">
        <img :src="attachedImagePreview" :class="compact ? 'h-16' : 'h-20'" class="w-auto rounded-lg object-cover border border-gray-200 dark:border-surface-600" />
        <button @click="removeAttachedImage" class="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-900 shadow-md">
          <X :size="compact ? 10 : 12" />
        </button>
      </div>
    </div>
    
    <textarea
      ref="inputRef"
      v-model="content"
      :placeholder="placeholder"
      :rows="rows"
      :class="[
        'w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none outline-none',
        compact ? 'p-2.5 text-xs' : 'p-3 text-sm'
      ]"
      @keydown.enter.prevent="handleSubmit"
    ></textarea>
    
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-2 pb-1.5 pt-0.5" :class="{ 'border-t border-gray-100 dark:border-surface-600/50': !compact }">
      <div class="flex items-center gap-0.5 relative">
        <input type="file" ref="fileInputRef" @change="handleImageSelected" accept="image/*" class="hidden" />
        <button @click="fileInputRef?.click()" :class="['text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all rounded-md', compact ? 'p-1' : 'p-1.5']" title="Đính kèm ảnh">
          <ImageIcon :size="compact ? 14 : 18" />
        </button>
        <button @click="showEmojiPicker = !showEmojiPicker" :class="['text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all rounded-md', compact ? 'p-1' : 'p-1.5']" title="Biểu tượng cảm xúc">
          <Smile :size="compact ? 14 : 18" />
        </button>
        
        <!-- Emoji Picker Popup -->
        <div v-if="showEmojiPicker" class="absolute bottom-full left-0 mb-1 z-50 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl shadow-xl p-2" :class="compact ? 'w-52' : 'w-60'">
          <div class="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto">
            <button v-for="emoji in emojiList" :key="emoji" @click="insertEmoji(emoji)" class="hover:bg-gray-100 dark:hover:bg-surface-700 rounded-lg flex items-center justify-center transition-colors" :class="compact ? 'p-1 text-base' : 'p-1.5 text-xl'">
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-1">
        <button v-if="showCancel" @click="$emit('cancel')" :class="['text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-md transition-colors font-medium', compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm']">
          Hủy
        </button>
        <button @click="handleSubmit" :disabled="!content.trim() && !attachedImage" :class="['rounded-md gradient-primary text-white font-semibold hover:opacity-90 transition-all shadow-md shadow-primary-500/30 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed', compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs']">
          <Send :size="compact ? 10 : 14" />
          Gửi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Image as ImageIcon, Smile, X, Send } from '@lucide/vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Viết bình luận...'
  },
  autoFocus: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits<{
  (e: 'submit', content: string, image: File | null): void
  (e: 'cancel'): void
}>()

const emojiList = ['😀', '😂', '🥰', '😎', '😭', '😡', '👍', '👎', '❤️', '🔥', '🎉', '✨', '🤔', '🙌', '👀', '💯']

const content = ref('')
const attachedImage = ref<File | null>(null)
const attachedImagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const showEmojiPicker = ref(false)
const inputRef = ref<HTMLTextAreaElement | null>(null)

const handleImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    attachedImage.value = target.files[0]
    attachedImagePreview.value = URL.createObjectURL(target.files[0])
  }
}

const removeAttachedImage = () => {
  attachedImage.value = null
  if (attachedImagePreview.value) {
    URL.revokeObjectURL(attachedImagePreview.value)
    attachedImagePreview.value = null
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const insertEmoji = (emoji: string) => {
  content.value += emoji
  showEmojiPicker.value = false
  inputRef.value?.focus()
}

const handleSubmit = () => {
  if (!content.value.trim() && !attachedImage.value) return
  
  emit('submit', content.value, attachedImage.value)
}

const clear = () => {
  content.value = ''
  removeAttachedImage()
  showEmojiPicker.value = false
}

const focus = () => {
  inputRef.value?.focus()
}

// Expose clear and focus methods to parent
defineExpose({
  clear,
  focus
})

onMounted(() => {
  if (props.autoFocus) {
    setTimeout(() => {
      inputRef.value?.focus()
    }, 50)
  }
})
</script>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Edit, X, User as UserIcon } from '@lucide/vue'

const props = defineProps<{
  show: boolean
  userName: string
  userAvatar?: string
  currentNickname?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', nickname: string): void
}>()

const nicknameInput = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    nicknameInput.value = props.currentNickname || ''
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
  }
})

function handleSave() {
  emit('save', nicknameInput.value.trim())
}

function handleReset() {
  nicknameInput.value = ''
  emit('save', '')
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 backdrop-blur-xs z-150 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <Transition name="zoom">
        <div
          v-if="show"
          class="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-surface-700 animate-slide-up"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
                <Edit :size="18" />
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Đặt biệt danh</h3>
                <p class="text-xs text-gray-400">Tùy chỉnh tên hiển thị</p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- User Preview -->
          <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-700/50 border border-gray-100 dark:border-surface-700 mb-4">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-surface-600 shrink-0 flex items-center justify-center">
              <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="w-full h-full object-cover" />
              <UserIcon v-else :size="20" class="text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-gray-400">Tên người dùng</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ userName }}</p>
            </div>
          </div>

          <!-- Input -->
          <div class="mb-5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Biệt danh mới
            </label>
            <input
              ref="inputRef"
              v-model="nicknameInput"
              type="text"
              maxlength="50"
              placeholder="Nhập biệt danh..."
              @keydown.enter="handleSave"
              class="w-full px-3.5 py-2.5 bg-white dark:bg-surface-700 border border-gray-300 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
            <p class="text-[11px] text-gray-400 mt-1.5">
              Biệt danh này chỉ hiển thị trong cuộc trò chuyện giữa bạn và người này.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              v-if="currentNickname"
              @click="handleReset"
              type="button"
              class="px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer mr-auto"
            >
              Gỡ bỏ
            </button>
            <button
              @click="emit('close')"
              type="button"
              class="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              @click="handleSave"
              type="button"
              class="px-5 py-2 text-xs font-semibold text-white gradient-primary hover:opacity-90 rounded-xl transition-all shadow-md shadow-primary-500/25 cursor-pointer"
            >
              Lưu biệt danh
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.zoom-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.zoom-leave-active {
  transition: all 0.15s ease-in;
}
.zoom-enter-from, .zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

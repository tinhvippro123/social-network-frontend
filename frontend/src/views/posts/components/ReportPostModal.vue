<script setup lang="ts">
import { ref } from 'vue'
import { Flag, X, AlertTriangle } from '@lucide/vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', reason: string, description: string): void
}>()

const selectedReason = ref('')
const description = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const reasons = [
  { id: 'spam', label: 'Spam hoặc quảng cáo', icon: '📢' },
  { id: 'inappropriate', label: 'Nội dung không phù hợp', icon: '🚫' },
  { id: 'harassment', label: 'Quấy rối hoặc bắt nạt', icon: '😡' },
  { id: 'misinformation', label: 'Thông tin sai lệch', icon: '❌' },
  { id: 'copyright', label: 'Vi phạm bản quyền', icon: '©️' },
  { id: 'other', label: 'Lý do khác', icon: '📝' },
]

const handleSubmit = async () => {
  if (!selectedReason.value) return
  isSubmitting.value = true
  emit('submit', selectedReason.value, description.value)
  
  // Simulate success
  setTimeout(() => {
    isSubmitting.value = false
    isSubmitted.value = true
    // Auto close after showing success
    setTimeout(() => {
      isSubmitted.value = false
      selectedReason.value = ''
      description.value = ''
      emit('close')
    }, 2000)
  }, 800)
}

const handleClose = () => {
  selectedReason.value = ''
  description.value = ''
  isSubmitted.value = false
  emit('close')
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="handleClose">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div v-if="show" class="bg-white dark:bg-surface-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
          
          <!-- Success State -->
          <div v-if="isSubmitted" class="p-8 text-center">
            <div class="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">✅</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Đã gửi báo cáo</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
            </p>
          </div>

          <!-- Form State -->
          <template v-else>
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-surface-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Flag :size="20" class="text-red-500" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white">Báo cáo bài viết</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Cho chúng tôi biết vấn đề</p>
                </div>
              </div>
              <button @click="handleClose" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-500 transition-colors">
                <X :size="20" />
              </button>
            </div>

            <!-- Reason Selection -->
            <div class="p-5 space-y-3">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Chọn lý do báo cáo:</p>
              <button
                v-for="reason in reasons"
                :key="reason.id"
                @click="selectedReason = reason.id"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border text-left',
                  selectedReason === reason.id
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                    : 'bg-gray-50 dark:bg-surface-700 border-gray-200 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-600'
                ]"
              >
                <span class="text-lg">{{ reason.icon }}</span>
                {{ reason.label }}
              </button>

              <!-- Description (optional) -->
              <div v-if="selectedReason" class="mt-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả chi tiết (không bắt buộc):
                </label>
                <textarea
                  v-model="description"
                  rows="3"
                  placeholder="Mô tả thêm về vấn đề bạn gặp phải..."
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition-all"
                ></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center gap-3 p-5 border-t border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-700/50">
              <button
                @click="handleClose"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-surface-700 border border-gray-200 dark:border-surface-600 hover:bg-gray-50 dark:hover:bg-surface-600 transition-all"
              >
                Huỷ
              </button>
              <button
                @click="handleSubmit"
                :disabled="!selectedReason || isSubmitting"
                :class="[
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all',
                  !selectedReason || isSubmitting
                    ? 'bg-gray-300 dark:bg-surface-600 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                ]"
              >
                <AlertTriangle v-if="!isSubmitting" :size="16" />
                <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo' }}
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

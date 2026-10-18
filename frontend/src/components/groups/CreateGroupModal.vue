<script setup lang="ts">
import { Users, Globe, Lock } from '@lucide/vue'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="close">
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-surface-700 animate-slide-up max-h-[85vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Tạo nhóm mới</h2>

        <div class="space-y-4">
          <!-- Group Avatar -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-surface-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-surface-600 cursor-pointer hover:border-primary-500 transition-colors group">
              <Users :size="24" class="text-gray-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Ảnh đại diện nhóm</p>
              <p class="text-xs text-gray-400 mt-0.5">JPG, PNG. Tối đa 2MB</p>
              <button class="mt-1 text-xs text-primary-500 hover:text-primary-600 font-medium">Tải ảnh lên</button>
            </div>
          </div>

          <!-- Group Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên nhóm <span class="text-red-400">*</span></label>
            <input type="text" placeholder="Nhập tên nhóm..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
            <textarea rows="3" placeholder="Mô tả về nhóm..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chủ đề</label>
            <select class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none">
              <option value="">Chọn chủ đề...</option>
              <option value="programming">💻 Lập trình</option>
              <option value="design">🎨 Thiết kế</option>
              <option value="devops">🔧 DevOps</option>
              <option value="ai">🤖 AI / Machine Learning</option>
              <option value="career">💼 Sự nghiệp</option>
              <option value="other">📌 Khác</option>
            </select>
          </div>

          <!-- Group Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại nhóm</label>
            <div class="flex gap-3">
              <label class="flex-1 flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-surface-600 cursor-pointer hover:border-primary-500/50 transition-colors">
                <input type="radio" name="type" value="public" checked class="text-primary-500 focus:ring-primary-500" />
                <Globe :size="16" class="text-green-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Công khai</span>
              </label>
              <label class="flex-1 flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-surface-600 cursor-pointer hover:border-primary-500/50 transition-colors">
                <input type="radio" name="type" value="private" class="text-primary-500 focus:ring-primary-500" />
                <Lock :size="16" class="text-amber-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Riêng tư</span>
              </label>
            </div>
          </div>

          <!-- Group Rules -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quy tắc nhóm
              <span class="text-xs text-gray-400 font-normal ml-1">(tùy chọn)</span>
            </label>
            <textarea rows="2" placeholder="Ví dụ: Không spam, Tôn trọng mọi người..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
          </div>
        </div>

        <div class="flex items-center gap-3 mt-6">
          <button @click="close" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
            Hủy
          </button>
          <button @click="close" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

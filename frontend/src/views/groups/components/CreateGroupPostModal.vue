<script setup lang="ts">
import { ref } from 'vue'
import { X, Send, Image as ImageIcon } from '@lucide/vue'
import groupsApi from '@/api/groups.api'
import { useToast } from '@/composables/ui/useToast'

const props = defineProps<{
  groupId: string
  groupName?: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', post: any): void
}>()

const toast = useToast()

const title = ref('')
const content = ref('')
const excerpt = ref('')
const coverImage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!title.value.trim()) {
    toast.error('Vui lòng nhập tiêu đề bài viết')
    return
  }
  if (!content.value.trim()) {
    toast.error('Vui lòng nhập nội dung bài viết')
    return
  }

  isSubmitting.value = true
  try {
    const res = await groupsApi.createPost(props.groupId, {
      title: title.value.trim(),
      content: content.value.trim(),
      excerpt: excerpt.value.trim() || undefined,
      coverImage: coverImage.value.trim() || undefined
    })

    toast.success('Đăng bài thảo luận thành công!')
    emit('created', res.data.data)
    emit('close')
    // Reset form
    title.value = ''
    content.value = ''
    excerpt.value = ''
    coverImage.value = ''
  } catch (err: any) {
    console.error('Lỗi đăng bài vào nhóm:', err)
    toast.error(err.response?.data?.message || 'Không thể đăng bài viết vào nhóm')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-surface-800 rounded-3xl border border-gray-200 dark:border-surface-700 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-surface-700/60">
        <div>
          <h3 class="font-bold text-gray-900 dark:text-white text-lg">Đăng bài thảo luận</h3>
          <p class="text-xs text-gray-400">Đăng vào: {{ groupName || 'Nhóm' }}</p>
        </div>
        <button
          @click="emit('close')"
          class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1">
        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Tiêu đề bài viết *
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="Nhập tiêu đề thảo luận rõ ràng..."
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-900 text-gray-900 dark:text-white text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-all outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Mô tả ngắn gọn (Tóm tắt)
          </label>
          <input
            v-model="excerpt"
            type="text"
            placeholder="Tóm tắt nội dung chính trong 1-2 câu..."
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-900 text-gray-900 dark:text-white text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-all outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Link ảnh bìa (URL)
          </label>
          <div class="relative">
            <input
              v-model="coverImage"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-900 text-gray-900 dark:text-white text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-all outline-none"
            />
            <ImageIcon :size="16" class="absolute left-3.5 top-3.5 text-gray-400" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Nội dung bài viết *
          </label>
          <textarea
            v-model="content"
            rows="6"
            placeholder="Chia sẻ kiến thức, đặt câu hỏi hoặc trao đổi cùng mọi người..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-900 text-gray-900 dark:text-white text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-all outline-none resize-y"
            required
          ></textarea>
        </div>

        <!-- Footer -->
        <div class="pt-3 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-surface-700/60">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-xl transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white gradient-primary rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-md shadow-primary-500/20 disabled:opacity-50"
          >
            <Send :size="15" />
            <span>{{ isSubmitting ? 'Đang đăng...' : 'Đăng bài' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

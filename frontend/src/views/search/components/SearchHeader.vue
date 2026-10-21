<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search as SearchIcon,
  ArrowLeft,
  X,
  Sparkles,
  Camera,
  FileText,
  FileType
} from '@lucide/vue'

const props = defineProps<{
  query: string
  textMode: 'keyword' | 'semantic'
  selectedFile: File | null
  fileType: 'image' | 'document' | null
  isSearching: boolean
  activeTab?: string
  tabs?: Array<{ key: string; label: string; icon: any }>
}>()

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'update:textMode', value: 'keyword' | 'semantic'): void
  (e: 'update:activeTab', value: string): void
  (e: 'selectFile', file: File, type: 'image' | 'document'): void
  (e: 'removeFile'): void
  (e: 'search'): void
}>()

const router = useRouter()
const imageInputRef = ref<HTMLInputElement | null>(null)
const documentInputRef = ref<HTMLInputElement | null>(null)

// Preview URL for selected image
const imagePreviewUrl = computed(() => {
  if (props.selectedFile && props.fileType === 'image') {
    return URL.createObjectURL(props.selectedFile)
  }
  return null
})

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function triggerImagePicker() {
  imageInputRef.value?.click()
}

function triggerDocumentPicker() {
  documentInputRef.value?.click()
}

function handleImageSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    emit('selectFile', target.files[0], 'image')
  }
}

function handleDocumentSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    emit('selectFile', target.files[0], 'document')
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('search')
  }
}

function toggleAiMode() {
  emit('update:textMode', props.textMode === 'semantic' ? 'keyword' : 'semantic')
}
</script>

<template>
  <div class="mb-6">
    <!-- Back button -->
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-4 group cursor-pointer"
    >
      <ArrowLeft :size="16" class="transition-transform group-hover:-translate-x-1" />
      <span>Quay lại</span>
    </button>

    <!-- Hidden file inputs -->
    <input
      ref="imageInputRef"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      class="hidden"
      @change="handleImageSelected"
    />
    <input
      ref="documentInputRef"
      type="file"
      accept=".pdf,.docx,.doc,.txt"
      class="hidden"
      @change="handleDocumentSelected"
    />

    <!-- Main Omni-Search Box -->
    <div class="relative bg-white dark:bg-surface-800 border-2 border-gray-200 dark:border-surface-700 rounded-3xl shadow-sm hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all p-2 sm:p-2.5">
      <div class="flex items-center gap-2">
        <!-- Search icon -->
        <div class="pl-3 text-gray-400 dark:text-gray-500 shrink-0">
          <SearchIcon :size="22" />
        </div>

        <!-- Input query -->
        <input
          :value="query"
          @input="emit('update:query', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeyDown"
          type="text"
          :placeholder="
            fileType === 'image'
              ? 'Đang tìm kiếm bằng hình ảnh tải lên...'
              : fileType === 'document'
              ? 'Đang tìm kiếm bằng tài liệu tải lên...'
              : textMode === 'semantic'
              ? 'Hỏi bất kỳ điều gì, AI sẽ tìm bài viết theo ngữ cảnh...'
              : 'Tìm kiếm bài viết, tác giả, chủ đề...'
          "
          class="w-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-base sm:text-lg px-2 py-2"
          :disabled="selectedFile !== null"
        />

        <!-- Clear input button -->
        <button
          v-if="query && !selectedFile"
          @click="emit('update:query', '')"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors shrink-0 cursor-pointer"
          title="Xóa nội dung"
        >
          <X :size="18" />
        </button>

        <!-- Multi-modal Action Buttons (Camera & Document) -->
        <div class="flex items-center gap-1 shrink-0 border-l border-gray-200 dark:border-surface-700 pl-2">
          <!-- Image Search Button -->
          <button
            type="button"
            @click="triggerImagePicker"
            class="p-2.5 rounded-2xl text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-all relative group cursor-pointer"
            title="Tìm bằng hình ảnh"
          >
            <Camera :size="20" />
            <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[11px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
              Tìm bằng hình ảnh
            </span>
          </button>

          <!-- Document Search Button -->
          <button
            type="button"
            @click="triggerDocumentPicker"
            class="p-2.5 rounded-2xl text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all relative group cursor-pointer"
            title="Tìm bằng tài liệu (PDF, Word)"
          >
            <FileText :size="20" />
            <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[11px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
              Tìm bằng tài liệu
            </span>
          </button>

          <!-- Search Submit Button -->
          <button
            type="button"
            @click="emit('search')"
            :disabled="isSearching || (!query.trim() && !selectedFile)"
            class="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-2xl shadow-sm transition-all shadow-primary-500/20 cursor-pointer"
          >
            <Sparkles v-if="textMode === 'semantic' || selectedFile" :size="16" class="animate-pulse" />
            <span>{{ isSearching ? 'Đang tìm...' : 'Tìm kiếm' }}</span>
          </button>
        </div>
      </div>

      <!-- File Attachment Preview (if a file is selected) -->
      <div
        v-if="selectedFile"
        class="mt-2 pt-2 border-t border-gray-100 dark:border-surface-700 flex items-center justify-between bg-primary-50/50 dark:bg-primary-950/20 rounded-2xl p-2.5 px-3"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <!-- Image thumbnail -->
          <img
            v-if="imagePreviewUrl"
            :src="imagePreviewUrl"
            alt="Preview"
            class="w-12 h-12 object-cover rounded-xl border border-primary-200 dark:border-primary-800 shadow-xs shrink-0"
          />
          <!-- Document icon -->
          <div
            v-else
            class="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0"
          >
            <FileType :size="24" />
          </div>

          <div class="truncate">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-md" :class="fileType === 'image' ? 'bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300' : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'">
                {{ fileType === 'image' ? '🖼️ Tìm kiếm theo ảnh' : '📄 Tìm kiếm theo tài liệu' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                ({{ formatFileSize(selectedFile.size) }})
              </span>
            </div>
            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mt-0.5">
              {{ selectedFile.name }}
            </p>
          </div>
        </div>

        <button
          @click="emit('removeFile')"
          class="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-surface-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          title="Hủy tệp này"
        >
          <X :size="18" />
        </button>
      </div>
    </div>

    <!-- Category Tabs & Clean AI Toggle Bar -->
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <!-- Standard Category Tabs (Posts, Users, Tags) -->
      <div v-if="tabs && tabs.length && !selectedFile" class="flex items-center gap-1 bg-gray-100 dark:bg-surface-800 rounded-2xl p-1 border border-gray-200 dark:border-surface-700">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="emit('update:activeTab', tab.key)"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer',
            activeTab === tab.key
              ? 'bg-white dark:bg-surface-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Modern AI Search Toggle Button (Production Grade) -->
      <div v-if="!selectedFile" class="flex items-center">
        <button
          type="button"
          @click="toggleAiMode"
          :class="[
            'flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border',
            textMode === 'semantic'
              ? 'bg-linear-to-r from-purple-600 via-indigo-600 to-primary-600 text-white border-transparent shadow-sm shadow-purple-500/20'
              : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-surface-700 hover:border-purple-400 dark:hover:border-purple-500'
          ]"
          title="Bật chế độ tìm kiếm thông minh theo ý nghĩa câu hỏi"
        >
          <Sparkles :size="15" :class="textMode === 'semantic' ? 'animate-pulse text-amber-200' : 'text-purple-500'" />
          <span>Tìm kiếm AI</span>
          <span
            class="text-[11px] px-1.5 py-0.2 rounded-full font-medium"
            :class="textMode === 'semantic' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-surface-700 text-gray-500 dark:text-gray-400'"
          >
            {{ textMode === 'semantic' ? 'Bật' : 'Tắt' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

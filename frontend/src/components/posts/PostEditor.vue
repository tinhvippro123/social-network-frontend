<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Code as CodeIcon, Image as ImageIcon, Link as LinkIcon, Quote, Eye, Save, Send, MapPin, Tag, ChevronDown, X, Clock, CalendarDays
} from '@lucide/vue'
import { EditorContent } from '@tiptap/vue-3'
import { useRouter } from 'vue-router'
import LocationPickerModal from '@/components/LocationPickerModal.vue'
import { useCreatePost } from '@/composables/posts/useCreatePost'
import PostEditorSettings from './PostEditorSettings.vue'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData?: any
}>()

const {
  categories,
  title,
  content,
  selectedCategory,
  tags,
  tagInput,
  isPreview,
  isDraft,
  showLocationPicker,
  postLocation,
  eventStartTime,
  eventEndTime,
  isLocationCategory,
  isEventCategory,
  toolbarItems,
  editor,
  handleLocationConfirm,
  removeLocation,
  addTag,
  removeTag,
  handleToolbarAction,
  handlePublish
} = useCreatePost()

onMounted(() => {
  if (props.mode === 'edit' && props.initialData) {
    title.value = props.initialData.title || ''
    selectedCategory.value = props.initialData.category || ''
    tags.value = props.initialData.tags || []
    if (editor.value && props.initialData.content) {
      editor.value.commands.setContent(props.initialData.content)
    }
    // Also set other initial fields if any
  }
})

const router = useRouter()
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ props.mode === 'create' ? 'Viết bài mới' : 'Chỉnh sửa bài viết' }}
      </h1>
      <div class="flex items-center gap-3">
        <button
          @click="isDraft = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all"
        >
          <Save :size="16" />
          <span class="hidden sm:inline">Lưu nháp</span>
        </button>
        <button 
          @click="handlePublish"
          class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
        >
          <Send :size="16" />
          Xuất bản
        </button>
      </div>
    </div>

    <!-- TOP SECTION: Settings (Cover, Title, Tags) -->
    <PostEditorSettings
      v-model:title="title"
      v-model:selected-category="selectedCategory"
      v-model:tag-input="tagInput"
      v-model:show-location-picker="showLocationPicker"
      v-model:event-start-time="eventStartTime"
      v-model:event-end-time="eventEndTime"
      :tags="tags"
      :categories="categories"
      :post-location="postLocation"
      :is-location-category="isLocationCategory"
      :is-event-category="isEventCategory"
      @add-tag="addTag"
      @remove-tag="removeTag"
      @remove-location="removeLocation"
    />

    <!-- BOTTOM SECTION: Split Editor & Preview -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <!-- LEFT: EDITOR -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden flex flex-col shadow-sm h-[calc(100vh-12rem)]">
        <div class="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-surface-700 overflow-x-auto bg-gray-50 dark:bg-surface-800/80">
          <template v-for="(item, i) in toolbarItems" :key="i">
            <div v-if="item.label === 'divider'" class="w-px h-5 bg-gray-200 dark:bg-surface-700 mx-1" />
            <button
              v-else
              :title="item.label"
              @click="handleToolbarAction(item.action)"
              class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <component :is="item.icon" :size="16" />
            </button>
          </template>
        </div>
        
        <div class="flex-1 overflow-y-auto bg-white dark:bg-surface-800 cursor-text" @click="editor?.commands.focus()">
          <editor-content :editor="editor" class="h-full" />
        </div>
        
        <div class="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
          <p class="text-xs text-gray-400">{{ content.length }} ký tự</p>
          <p class="text-xs text-gray-400">Tự động lưu</p>
        </div>
      </div>

      <!-- RIGHT: LIVE PREVIEW -->
      <div class="hidden xl:flex flex-col bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-sm h-[calc(100vh-12rem)] overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-200 dark:border-surface-700 flex items-center gap-2 bg-gray-50 dark:bg-surface-800/80">
          <Eye :size="16" class="text-primary-500" />
          <span class="font-semibold text-sm text-gray-700 dark:text-gray-300">Xem trước văn bản</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-8">
          <div class="prose dark:prose-invert max-w-none prose-img:rounded-xl">
            <p v-if="!content || content === '<p></p>'" class="text-gray-400 italic">Chưa có nội dung. Hãy nhập nội dung ở ô bên trái để xem trước...</p>
            <div v-else v-html="content" class="tiptap-preview"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Location Picker Modal -->
    <LocationPickerModal
      v-model="showLocationPicker"
      :initial-location="postLocation"
      @confirm="handleLocationConfirm"
    />
  </div>
</template>

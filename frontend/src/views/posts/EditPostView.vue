<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Code as CodeIcon, Image as ImageIcon, Link as LinkIcon, Quote, Eye, Save, Send, MapPin, Tag, ChevronDown, X, Clock, CalendarDays, ArrowLeft
} from '@lucide/vue'
import { EditorContent } from '@tiptap/vue-3'
import LocationPickerModal from '@/components/LocationPickerModal.vue'
import { useCreatePost } from '@/composables/useCreatePost'
import Skeleton from '@/components/ui/Skeleton.vue'

const route = useRoute()
const router = useRouter()
const isLoadingPost = ref(true)

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

// Load existing post data
onMounted(async () => {
  // Simulate loading existing post
  setTimeout(() => {
    title.value = 'Hướng dẫn xây dựng REST API với Spring Boot 3 và Clean Architecture'
    selectedCategory.value = 'programming'
    tags.value = ['spring-boot', 'java', 'clean-architecture', 'rest-api']
    if (editor.value) {
      editor.value.commands.setContent('<p>Trong bài viết này, mình sẽ chia sẻ cách xây dựng một REST API hoàn chỉnh sử dụng Spring Boot 3, áp dụng kiến trúc Clean Architecture...</p><h2>1. Giới thiệu</h2><p>Clean Architecture là một mô hình kiến trúc phần mềm được đề xuất bởi Robert C. Martin (Uncle Bob) vào năm 2012...</p><h2>2. Cấu trúc thư mục</h2><p>Chúng ta sẽ tổ chức project theo 4 tầng chính: Domain, Use Case, Adapter và Infrastructure...</p>')
    }
    isLoadingPost.value = false
  }, 800)
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="router.back()"
          class="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 flex items-center justify-center text-gray-500 hover:text-primary-500 hover:border-primary-500/30 transition-all"
        >
          <ArrowLeft :size="18" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Chỉnh sửa bài viết</h1>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="isDraft = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all"
        >
          <Save :size="16" />
          Lưu nháp
        </button>
        <button
          @click="handlePublish"
          class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all"
        >
          <Send :size="16" />
          Cập nhật
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoadingPost" class="space-y-6">
      <Skeleton type="text" class="w-full h-12 rounded-xl" />
      <div class="flex gap-4">
        <Skeleton type="text" class="w-48 h-10 rounded-xl" />
        <Skeleton type="text" class="w-48 h-10 rounded-xl" />
      </div>
      <Skeleton type="text" class="w-full h-64 rounded-xl" />
    </div>

    <!-- Editor Content (same as CreatePostView) -->
    <template v-else>
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Main Editor -->
        <div class="flex-1 space-y-4">
          <!-- Title -->
          <input
            v-model="title"
            type="text"
            placeholder="Tiêu đề bài viết..."
            class="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
          />

          <!-- Toolbar -->
          <div class="flex items-center gap-1 p-2 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 flex-wrap">
            <button
              v-for="item in toolbarItems"
              :key="item.action"
              @click="handleToolbarAction(item.action)"
              :title="item.label"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
            >
              <component :is="item.icon" :size="16" />
            </button>
            <div class="mx-1 w-px h-6 bg-gray-200 dark:bg-surface-700" />
            <button
              @click="isPreview = !isPreview"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                isPreview
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10'
              ]"
            >
              <Eye :size="14" />
              Xem trước
            </button>
          </div>

          <!-- Editor Area -->
          <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 min-h-100">
            <div v-if="isPreview" class="p-6 prose dark:prose-invert max-w-none" v-html="editor?.getHTML()" />
            <EditorContent v-else :editor="editor" class="p-6 prose dark:prose-invert max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-87.5" />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="w-full lg:w-80 shrink-0 space-y-4">
          <!-- Category -->
          <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Danh mục</label>
            <div class="relative">
              <select
                v-model="selectedCategory"
                class="w-full appearance-none bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 pr-10 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              >
                <option value="">Chọn danh mục</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <ChevronDown :size="16" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Tag :size="14" class="text-primary-500" />
              Tags
            </label>
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="tag in tags"
                :key="tag"
                class="flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium"
              >
                #{{ tag }}
                <button @click="removeTag(tag)" class="hover:text-red-500 transition-colors">
                  <X :size="12" />
                </button>
              </span>
            </div>
            <input
              v-model="tagInput"
              @keydown.enter.prevent="addTag"
              type="text"
              placeholder="Nhập tag và Enter..."
              class="w-full bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl px-4 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <!-- Location (conditional) -->
          <div v-if="isLocationCategory" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <MapPin :size="14" class="text-red-500" />
              Vị trí
            </label>
            <div v-if="postLocation" class="flex items-center justify-between bg-green-50 dark:bg-green-500/10 rounded-xl px-4 py-2.5">
              <div class="text-sm">
                <p class="font-medium text-green-700 dark:text-green-400">{{ postLocation.address || 'Vị trí đã chọn' }}</p>
                <p class="text-xs text-green-600/70 dark:text-green-500/70">{{ postLocation.lat.toFixed(4) }}, {{ postLocation.lng.toFixed(4) }}</p>
              </div>
              <button @click="removeLocation" class="text-red-400 hover:text-red-500"><X :size="16" /></button>
            </div>
            <button
              v-else
              @click="showLocationPicker = true"
              class="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-surface-600 rounded-xl text-sm text-gray-500 hover:text-primary-500 hover:border-primary-500 transition-all"
            >
              <MapPin :size="16" />
              Chọn vị trí trên bản đồ
            </button>
          </div>

          <!-- Event Time (conditional) -->
          <div v-if="isEventCategory" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <CalendarDays :size="14" class="text-blue-500" />
              Thời gian sự kiện
            </label>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-500 mb-1 block">Bắt đầu</label>
                <input v-model="eventStartTime" type="datetime-local" class="w-full bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">Kết thúc</label>
                <input v-model="eventEndTime" type="datetime-local" class="w-full bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Location Picker Modal -->
    <LocationPickerModal
      v-if="showLocationPicker"
      :model-value="showLocationPicker"
      @update:model-value="showLocationPicker = $event"
      @close="showLocationPicker = false"
      @confirm="handleLocationConfirm"
    />
  </div>
</template>

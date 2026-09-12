<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Code as CodeIcon, Image as ImageIcon, Link as LinkIcon, Quote, Eye, Save, Send, MapPin, Tag, ChevronDown, X, Clock, CalendarDays
} from '@lucide/vue'
import { EditorContent } from '@tiptap/vue-3'
import { useRouter } from 'vue-router'
import LocationPickerModal from '@/components/LocationPickerModal.vue'
import { useCreatePost } from '@/composables/useCreatePost'

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

const router = useRouter()
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Viết bài mới</h1>
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
    <div class="flex flex-col gap-6 bg-white dark:bg-surface-800 p-6 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-sm">
      <!-- Cover Image Upload -->
      <div class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-surface-600 rounded-xl bg-gray-50 dark:bg-surface-800/50 hover:bg-gray-100 dark:hover:bg-surface-700/50 transition-colors cursor-pointer group">
        <ImageIcon :size="32" class="text-gray-300 dark:text-surface-600 mb-3 group-hover:text-primary-500 transition-colors" />
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Kéo thả ảnh hoặc click để tải lên</p>
        <p class="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
      </div>

      <!-- Title -->
      <input
        v-model="title"
        type="text"
        placeholder="Tiêu đề bài viết..."
        class="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-surface-600"
      />

      <!-- Category & Tags -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <select
            v-model="selectedCategory"
            class="appearance-none pl-4 pr-10 py-2 rounded-xl text-sm font-medium bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
          >
            <option value="">Chọn danh mục</option>
            <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>
          <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div class="flex items-center gap-2 flex-wrap flex-1">
          <span
            v-for="tag in tags"
            :key="tag"
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          >
            #{{ tag }}
            <button @click="removeTag(tag)" class="hover:text-red-500 transition-colors">
              <X :size="12" />
            </button>
          </span>
          <div class="flex items-center gap-1 bg-gray-50 dark:bg-surface-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-surface-600">
            <Tag :size="14" class="text-gray-400" />
            <input
              v-model="tagInput"
              @keydown.enter.prevent="addTag"
              type="text"
              placeholder="Thêm tag..."
              class="bg-transparent border-none outline-none text-sm text-gray-600 dark:text-gray-400 placeholder-gray-400 w-24"
            />
          </div>
        </div>

        <!-- Location Picker Button -->
        <div class="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-surface-700/50">
          <button
            v-if="!postLocation"
            @click="showLocationPicker = true"
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-surface-600 hover:border-red-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            <MapPin :size="16" />
            Ghim vị trí
          </button>

          <!-- Selected Location Display -->
          <div
            v-else
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
          >
            <MapPin :size="14" class="text-red-500 shrink-0" />
            <span
              class="text-red-700 dark:text-red-400 font-medium truncate max-w-xs cursor-pointer hover:underline"
              @click="showLocationPicker = true"
            >
              {{ postLocation.address }}
            </span>
            <button
              @click="removeLocation"
              class="p-0.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors shrink-0"
            >
              <X :size="14" />
            </button>
          </div>
        </div>

        <!-- Location Suggestion (when selecting location-relevant categories) -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-200 ease-in" leave-to-class="opacity-0 -translate-y-2">
          <div v-if="isLocationCategory && !postLocation" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
            <MapPin :size="14" class="text-amber-500 shrink-0" />
            <span class="text-amber-700 dark:text-amber-400">
              Danh mục này nên có vị trí! 
              <button @click="showLocationPicker = true" class="font-semibold underline hover:no-underline">Ghim ngay</button>
            </span>
          </div>
        </Transition>

        <!-- Event Time Picker (only for 'su-kien' category) -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-200 ease-in" leave-to-class="opacity-0 -translate-y-2">
          <div v-if="isEventCategory" class="flex flex-col gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30">
            <div class="flex items-center gap-2">
              <CalendarDays :size="16" class="text-purple-500" />
              <span class="text-sm font-semibold text-purple-700 dark:text-purple-400">Thời gian sự kiện</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Bắt đầu</label>
                <div class="flex items-center gap-2 bg-white dark:bg-surface-800 rounded-lg px-3 py-2 border border-purple-200 dark:border-purple-800/30">
                  <Clock :size="14" class="text-purple-400 shrink-0" />
                  <input
                    v-model="eventStartTime"
                    type="datetime-local"
                    class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Kết thúc</label>
                <div class="flex items-center gap-2 bg-white dark:bg-surface-800 rounded-lg px-3 py-2 border border-purple-200 dark:border-purple-800/30">
                  <Clock :size="14" class="text-purple-400 shrink-0" />
                  <input
                    v-model="eventEndTime"
                    type="datetime-local"
                    class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

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

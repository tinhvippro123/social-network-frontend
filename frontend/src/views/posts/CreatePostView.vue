<script setup lang="ts">
import { ref } from 'vue'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Code, Image, Link, Quote, Eye, Save, Send, MapPin, Tag, ChevronDown, X
} from '@lucide/vue'
import { mockCategories } from '@/data/mockData'

const title = ref('')
const content = ref('')
const selectedCategory = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const isPreview = ref(false)
const isDraft = ref(false)
const showLocationPicker = ref(false)
const location = ref('')

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !tags.value.includes(tag) && tags.value.length < 5) {
    tags.value.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
  tags.value = tags.value.filter(t => t !== tag)
}

const toolbarItems = [
  { icon: Bold, label: 'Bold', action: 'bold' },
  { icon: Italic, label: 'Italic', action: 'italic' },
  { icon: UnderlineIcon, label: 'Underline', action: 'underline' },
  { icon: null, label: 'divider', action: '' },
  { icon: Heading1, label: 'Heading 1', action: 'h1' },
  { icon: Heading2, label: 'Heading 2', action: 'h2' },
  { icon: null, label: 'divider', action: '' },
  { icon: List, label: 'Bulleted list', action: 'ul' },
  { icon: ListOrdered, label: 'Numbered list', action: 'ol' },
  { icon: Quote, label: 'Quote', action: 'quote' },
  { icon: null, label: 'divider', action: '' },
  { icon: Code, label: 'Code', action: 'code' },
  { icon: Link, label: 'Link', action: 'link' },
  { icon: Image, label: 'Image', action: 'image' },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Viết bài mới</h1>
      <div class="flex items-center gap-3">
        <button
          @click="isDraft = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all"
        >
          <Save :size="16" />
          <span class="hidden sm:inline">Lưu nháp</span>
        </button>
        <button class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
          <Send :size="16" />
          Xuất bản
        </button>
      </div>
    </div>

    <!-- Cover Image Upload -->
    <div class="relative mb-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-surface-600 hover:border-primary-500/50 transition-colors overflow-hidden group cursor-pointer">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Image :size="40" class="text-gray-300 dark:text-surface-600 mb-3 group-hover:text-primary-500 transition-colors" />
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Nhấp để tải ảnh bìa lên</p>
        <p class="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB. Khuyến nghị 1200×630px</p>
      </div>
    </div>

    <!-- Title -->
    <input
      v-model="title"
      type="text"
      placeholder="Tiêu đề bài viết..."
      class="w-full text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-surface-600 mb-6"
    />

    <!-- Category & Tags -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <!-- Category -->
      <div class="relative">
        <select
          v-model="selectedCategory"
          class="appearance-none pl-4 pr-10 py-2 rounded-xl text-sm font-medium bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
        >
          <option value="">Chọn danh mục</option>
          <option v-for="cat in mockCategories" :key="cat.id" :value="cat.slug">
            {{ cat.icon }} {{ cat.name }}
          </option>
        </select>
        <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <!-- Tags -->
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
        <div class="flex items-center gap-1">
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

      <!-- Location -->
      <button
        @click="showLocationPicker = !showLocationPicker"
        :class="[
          'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all',
          showLocationPicker
            ? 'border-primary-500 text-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-surface-700 text-gray-500 hover:border-primary-500/50'
        ]"
      >
        <MapPin :size="14" />
        <span class="hidden sm:inline">Vị trí</span>
      </button>
    </div>

    <!-- Location Input -->
    <div v-if="showLocationPicker" class="mb-6 p-4 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 animate-slide-up">
      <div class="flex items-center gap-3">
        <MapPin :size="18" class="text-primary-500 shrink-0" />
        <input
          v-model="location"
          type="text"
          placeholder="Nhập địa chỉ hoặc tọa độ (ví dụ: TP. Hồ Chí Minh)"
          class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>
    </div>

    <!-- Editor -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
      <!-- Toolbar -->
      <div class="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-surface-700 overflow-x-auto">
        <template v-for="(item, i) in toolbarItems" :key="i">
          <div v-if="item.label === 'divider'" class="w-px h-5 bg-gray-200 dark:bg-surface-700 mx-1" />
          <button
            v-else
            :title="item.label"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <component :is="item.icon" :size="16" />
          </button>
        </template>

        <div class="flex-1" />

        <!-- Preview Toggle -->
        <button
          @click="isPreview = !isPreview"
          :class="[
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            isPreview ? 'bg-primary-500/10 text-primary-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
          ]"
        >
          <Eye :size="14" />
          Xem trước
        </button>
      </div>

      <!-- Content Area -->
      <div v-if="!isPreview">
        <textarea
          v-model="content"
          placeholder="Bắt đầu viết nội dung bài viết của bạn...&#10;&#10;Hỗ trợ Markdown: **bold**, *italic*, `code`, > quote..."
          rows="20"
          class="w-full p-6 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none text-base leading-relaxed"
        />
      </div>
      <div v-else class="p-6 min-h-100">
        <div class="prose dark:prose-invert max-w-none">
          <p v-if="!content" class="text-gray-400 italic">Chưa có nội dung để xem trước...</p>
          <p v-else>{{ content }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
        <p class="text-xs text-gray-400">
          {{ content.length }} ký tự · ~{{ Math.ceil(content.length / 1000) }} phút đọc
        </p>
        <p class="text-xs text-gray-400">
          Tự động lưu
        </p>
      </div>
    </div>
  </div>
</template>

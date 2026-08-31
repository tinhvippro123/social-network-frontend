<script setup lang="ts">
import { ref } from 'vue'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Code, Image, Link, Quote, Eye, Save, Send, MapPin, Tag, ChevronDown, X
} from '@lucide/vue'
import { useCategories } from '@/composables/useCategories'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import { onMounted } from 'vue'

const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

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
  { icon: UnderlineIcon, label: 'Strike', action: 'strike' },
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

const editor = useEditor({
  content: content.value,
  extensions: [
    StarterKit,
    ImageExtension,
    LinkExtension.configure({ openOnClick: false })
  ],
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML()
  },
  editorProps: {
    attributes: {
      class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-full h-full p-6 text-base leading-relaxed text-gray-700 dark:text-gray-300'
    }
  }
})

const handleToolbarAction = (action: string) => {
  if (!editor.value) return
  switch (action) {
    case 'bold': editor.value.chain().focus().toggleBold().run(); break;
    case 'italic': editor.value.chain().focus().toggleItalic().run(); break;
    case 'strike': editor.value.chain().focus().toggleStrike().run(); break;
    case 'h1': editor.value.chain().focus().toggleHeading({ level: 1 }).run(); break;
    case 'h2': editor.value.chain().focus().toggleHeading({ level: 2 }).run(); break;
    case 'ul': editor.value.chain().focus().toggleBulletList().run(); break;
    case 'ol': editor.value.chain().focus().toggleOrderedList().run(); break;
    case 'quote': editor.value.chain().focus().toggleBlockquote().run(); break;
    case 'code': editor.value.chain().focus().toggleCodeBlock().run(); break;
    case 'link': 
      const url = window.prompt('URL:')
      if (url) editor.value.chain().focus().setLink({ href: url }).run();
      break;
    case 'image':
      const src = window.prompt('Image URL:')
      if (src) editor.value.chain().focus().setImage({ src }).run();
      break;
  }
}
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
        <button class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
          <Send :size="16" />
          Xuất bản
        </button>
      </div>
    </div>

    <!-- TOP SECTION: Settings (Cover, Title, Tags) -->
    <div class="flex flex-col gap-6 bg-white dark:bg-surface-800 p-6 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-sm">
      <!-- Cover Image Upload -->
      <div class="relative rounded-2xl border-2 border-dashed border-gray-300 dark:border-surface-600 hover:border-primary-500/50 transition-colors overflow-hidden group cursor-pointer bg-gray-50 dark:bg-surface-900/50">
        <div class="flex flex-col items-center justify-center py-10 text-center">
          <Image :size="32" class="text-gray-300 dark:text-surface-600 mb-3 group-hover:text-primary-500 transition-colors" />
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Nhấp để tải ảnh bìa</p>
          <p class="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
        </div>
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
  </div>
</template>

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from './useToast'
import { useCategories } from './useCategories'
import { LOCATION_SUPPORTED_CATEGORIES } from '@/constants'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import type { GeoLocation } from '@/types'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Code as CodeIcon, Image as ImageIcon, Link as LinkIcon, Quote
} from '@lucide/vue'

export function useCreatePost() {
  const { categories, fetchCategories } = useCategories()
  const { success, error } = useToast()
  const router = useRouter()

  const title = ref('')
  const content = ref('')
  const selectedCategory = ref('')
  const tags = ref<string[]>([])
  const tagInput = ref('')
  const isPreview = ref(false)
  const isDraft = ref(false)
  const showLocationPicker = ref(false)
  const postLocation = ref<GeoLocation | null>(null)

  // Event time fields
  const eventStartTime = ref('')
  const eventEndTime = ref('')

  const locationCategories = LOCATION_SUPPORTED_CATEGORIES
  const isLocationCategory = computed(() => locationCategories.includes(selectedCategory.value as any))
  const isEventCategory = computed(() => selectedCategory.value === 'su-kien')

  const handleLocationConfirm = (loc: GeoLocation) => {
    postLocation.value = loc
    success('Đã ghim vị trí thành công!')
  }

  const removeLocation = () => {
    postLocation.value = null
  }

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
    { icon: CodeIcon, label: 'Code', action: 'code' },
    { icon: LinkIcon, label: 'Link', action: 'link' },
    { icon: ImageIcon, label: 'Image', action: 'image' },
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

  onMounted(() => {
    fetchCategories()
  })

  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.destroy()
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
    }
  }

  const handlePublish = () => {
    if (!title.value.trim()) {
      error('Vui lòng nhập tiêu đề bài viết')
      return
    }
    if (!content.value.trim() || content.value === '<p></p>') {
      error('Nội dung bài viết không được để trống')
      return
    }
    success('Xuất bản bài viết thành công!')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  return {
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
  }
}

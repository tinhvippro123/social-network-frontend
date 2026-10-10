import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../ui/useToast'
import { useCategories } from '../core/useCategories'
import { useAsyncState } from '../core/useAsyncState'
import postsApi from '@/api/posts.api'
import filesApi from '@/api/files.api'
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
  
  const coverImageFile = ref<File | null>(null)
  const coverImagePreview = ref<string>('')

  // Event time fields
  const eventStartTime = ref('')
  const eventEndTime = ref('')

  const locationCategories = LOCATION_SUPPORTED_CATEGORIES
  const isLocationCategory = computed(() => locationCategories.includes(selectedCategory.value as any))
  const isEventCategory = computed(() => selectedCategory.value === 'su-kien')

  const handleCoverImageChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('Kích thước ảnh tối đa là 5MB')
        return
      }
      coverImageFile.value = file
      coverImagePreview.value = URL.createObjectURL(file)
    }
  }

  const removeCoverImage = () => {
    coverImageFile.value = null
    coverImagePreview.value = ''
  }

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
    if (coverImagePreview.value) {
      URL.revokeObjectURL(coverImagePreview.value)
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

  const { execute, isLoading } = useAsyncState()

  const handlePublish = async () => {
    if (!title.value.trim()) {
      error('Vui lòng nhập tiêu đề bài viết')
      return
    }
    if (!selectedCategory.value) {
      error('Vui lòng chọn danh mục bài viết')
      return
    }
    if (!content.value.trim() || content.value === '<p></p>') {
      error('Nội dung bài viết không được để trống')
      return
    }
    
    // Bỏ HTML tags để đếm số ký tự thực sự
    const plainTextContent = content.value.replace(/<[^>]*>?/gm, '').trim()
    if (plainTextContent.length < 50) {
      error('Nội dung bài viết quá ngắn (yêu cầu ít nhất 50 ký tự)')
      return
    }
    
    await execute(async () => {
      let coverImageUrl = ''
      
      // Upload cover image first if it exists
      if (coverImageFile.value) {
        try {
          const uploadRes = await filesApi.uploadFile(coverImageFile.value)
          coverImageUrl = uploadRes.data.data.fileUrl
        } catch (err) {
          throw new Error('Không thể tải ảnh bìa lên. Vui lòng thử lại sau.')
        }
      }

      // Create slug from title as excerpt (temporary)
      const excerpt = content.value.replace(/<[^>]*>?/gm, '').substring(0, 150)
      
      const payload = {
        title: title.value.trim(),
        content: content.value,
        excerpt: excerpt,
        categoryId: selectedCategory.value,
        tags: tags.value,
        status: (isDraft.value ? 'draft' : 'published') as 'draft' | 'published',
        latitude: postLocation.value?.lat,
        longitude: postLocation.value?.lng,
        coverImage: coverImageUrl || undefined
      }
      
      await postsApi.create(payload)
      
      success(isDraft.value ? 'Đã lưu bản nháp thành công!' : 'Xuất bản bài viết thành công!')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }, 'Đăng bài viết thất bại')
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
    coverImagePreview,
    isLocationCategory,
    isEventCategory,
    toolbarItems,
    editor,
    handleCoverImageChange,
    removeCoverImage,
    handleLocationConfirm,
    removeLocation,
    addTag,
    removeTag,
    handleToolbarAction,
    handlePublish
  }
}

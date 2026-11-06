import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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
  Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered,
  Code as CodeIcon, Image as ImageIcon, Link as LinkIcon, Quote, Undo, Redo
} from '@lucide/vue'

export function useCreatePost() {
  const { categories, fetchCategories } = useCategories()
  const { success, error } = useToast()
  const router = useRouter()

  const title = ref('')
  const excerpt = ref('')
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
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('Kích thước ảnh tối đa là 5MB')
        input.value = ''
        return
      }
      if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
        URL.revokeObjectURL(coverImagePreview.value)
      }
      coverImageFile.value = file
      coverImagePreview.value = URL.createObjectURL(file)
    }
    input.value = ''
  }

  const removeCoverImage = () => {
    if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview.value)
    }
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
    const tag = tagInput.value.trim().replace(/^#+/, '').trim()
    if (tag && !tags.value.includes(tag) && tags.value.length < 5) {
      tags.value.push(tag)
      tagInput.value = ''
    } else if (tag && tags.value.includes(tag)) {
      tagInput.value = ''
    }
  }

  const removeTag = (tag: string) => {
    tags.value = tags.value.filter(t => t !== tag)
  }

  const toolbarItems = [
    { icon: Undo, label: 'Hoàn tác (Undo)', action: 'undo' },
    { icon: Redo, label: 'Làm lại (Redo)', action: 'redo' },
    { icon: null, label: 'divider', action: '' },
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: Strikethrough, label: 'Strike', action: 'strike' },
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
    { icon: ImageIcon, label: 'Chèn ảnh / Bộ sưu tập ảnh (chọn 1 hoặc nhiều ảnh)', action: 'image' },
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

  // Ensure initial content is synced into Tiptap once editor instance mounts
  watch(editor, (ed) => {
    if (ed && content.value && ed.getHTML() !== content.value) {
      ed.commands.setContent(content.value)
    }
  })

  // Load existing post data for Edit mode
  const loadInitialData = (post: any) => {
    if (!post) return
    title.value = post.title || ''
    excerpt.value = post.excerpt || ''
    content.value = post.content || ''
    if (editor.value && post.content) {
      editor.value.commands.setContent(post.content)
    }
    selectedCategory.value = post.category?.slug || post.category?.id || post.categoryId || ''
    tags.value = Array.isArray(post.tags) ? [...post.tags] : []
    isDraft.value = post.status?.toLowerCase() === 'draft'
    // datetime-local input cần định dạng YYYY-MM-DDTHH:mm
    eventStartTime.value = post.eventStartTime ? String(post.eventStartTime).slice(0, 16) : ''
    eventEndTime.value = post.eventEndTime ? String(post.eventEndTime).slice(0, 16) : ''
    
    if (post.coverImage) {
      coverImagePreview.value = post.coverImage
    }
    if (post.latitude != null && post.longitude != null) {
      postLocation.value = {
        lat: post.latitude,
        lng: post.longitude,
        address: post.locationAddress || post.location?.address || ''
      }
    } else if (post.location && post.location.lat != null && post.location.lng != null) {
      postLocation.value = {
        lat: post.location.lat,
        lng: post.location.lng,
        address: post.location.address || ''
      }
    }
  }

  onMounted(() => {
    fetchCategories()
  })

  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.destroy()
    }
    if (coverImagePreview.value && coverImagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview.value)
    }
  })

  // Trigger file picker to upload 1 or multiple inline images to Cloudinary (auto-forms Gallery if >= 2 images)
  const insertInlineImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length === 0) return
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          error(`Ảnh "${file.name}" vượt quá kích thước tối đa 5MB`)
          return
        }
      }
      try {
        const uploadResponses = await Promise.all(files.map(file => filesApi.uploadFile(file)))
        const urls = uploadResponses
          .map(res => res.data?.data?.fileUrl || res.data?.fileUrl)
          .filter((url): url is string => Boolean(url))

        if (urls.length > 0 && editor.value) {
          const imageNodes = urls.map(url => ({
            type: 'image',
            attrs: { src: url, alt: title.value || 'Ảnh bài viết' }
          }))
          editor.value.chain().focus().insertContent(imageNodes).run()
          success(
            urls.length > 1
              ? `Đã tải và tạo cụm Gallery (${urls.length} ảnh) thành công!`
              : 'Đã tải và chèn ảnh thành công!'
          )
        }
      } catch (err) {
        error('Không thể tải ảnh lên. Vui lòng thử lại.')
      }
    }
    input.click()
  }

  const handleToolbarAction = (action: string) => {
    if (!editor.value) return
    switch (action) {
      case 'undo': editor.value.chain().focus().undo().run(); break;
      case 'redo': editor.value.chain().focus().redo().run(); break;
      case 'bold': editor.value.chain().focus().toggleBold().run(); break;
      case 'italic': editor.value.chain().focus().toggleItalic().run(); break;
      case 'strike': editor.value.chain().focus().toggleStrike().run(); break;
      case 'h1': editor.value.chain().focus().toggleHeading({ level: 1 }).run(); break;
      case 'h2': editor.value.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'ul': editor.value.chain().focus().toggleBulletList().run(); break;
      case 'ol': editor.value.chain().focus().toggleOrderedList().run(); break;
      case 'quote': editor.value.chain().focus().toggleBlockquote().run(); break;
      case 'code': editor.value.chain().focus().toggleCodeBlock().run(); break;
      case 'link': {
        const url = window.prompt('Nhập đường dẫn liên kết:')
        if (url) editor.value.chain().focus().setLink({ href: url }).run()
        break
      }
      case 'image': {
        insertInlineImage()
        break
      }
    }
  }

  const { execute, isLoading, error: publishError } = useAsyncState()

  const handlePublish = async (mode: 'create' | 'edit' = 'create', postId?: string) => {
    // Tự động lưu tag đang gõ dở trong ô input nếu chưa nhấn Enter
    if (tagInput.value.trim()) {
      addTag()
    }

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
    
    // Bỏ HTML tags để đếm số ký tự văn bản
    const plainTextContent = content.value.replace(/<[^>]*>?/gm, '').trim()
    if (plainTextContent.length < 50) {
      error('Nội dung bài viết quá ngắn (yêu cầu ít nhất 50 ký tự)')
      return
    }

    if (isEventCategory.value && eventEndTime.value && !eventStartTime.value) {
      error('Vui lòng chọn thời gian bắt đầu sự kiện')
      return
    }
    if (isEventCategory.value && eventStartTime.value && eventEndTime.value) {
      if (new Date(eventEndTime.value).getTime() <= new Date(eventStartTime.value).getTime()) {
        error('Thời gian kết thúc sự kiện phải sau thời gian bắt đầu')
        return
      }
    }
    
    await execute(async () => {
      let coverImageUrl = coverImagePreview.value || ''
      
      // Upload ảnh bìa mới lên Cloudinary nếu người dùng đã chọn file mới
      if (coverImageFile.value) {
        try {
          const uploadRes = await filesApi.uploadFile(coverImageFile.value)
          coverImageUrl = uploadRes.data?.data?.fileUrl || uploadRes.data?.fileUrl || ''
        } catch (err) {
          error('Không thể tải ảnh bìa lên Cloudinary. Vui lòng thử lại sau.')
          throw new Error('Không thể tải ảnh bìa lên Cloudinary. Vui lòng thử lại sau.')
        }
      }

      // Lấy excerpt người dùng tự gõ, nếu để trống thì tự động cắt 150 ký tự đầu của nội dung
      const finalExcerpt = excerpt.value.trim() || plainTextContent.substring(0, 150)
      
      const payload = {
        title: title.value.trim(),
        content: content.value,
        excerpt: finalExcerpt,
        categoryId: selectedCategory.value,
        tags: tags.value,
        status: (isDraft.value ? 'draft' : 'published') as 'draft' | 'published',
        latitude: postLocation.value?.lat,
        longitude: postLocation.value?.lng,
        locationAddress: postLocation.value?.address || undefined,
        eventStartTime: isEventCategory.value && eventStartTime.value ? eventStartTime.value : undefined,
        eventEndTime: isEventCategory.value && eventEndTime.value ? eventEndTime.value : undefined,
        coverImage: coverImageUrl || undefined
      }
      
      if (mode === 'edit' && postId) {
        await postsApi.update(postId, payload)
        success(isDraft.value ? 'Đã lưu bản nháp thành công!' : 'Cập nhật bài viết thành công!')
        setTimeout(() => {
          router.push(`/posts/${postId}`)
        }, 800)
      } else {
        const res = await postsApi.create(payload)
        const createdId = res.data?.data?.id
        success(isDraft.value ? 'Đã lưu bản nháp thành công!' : 'Xuất bản bài viết thành công!')
        setTimeout(() => {
          if (createdId) {
            router.push(`/posts/${createdId}`)
          } else {
            router.push('/')
          }
        }, 800)
      }
    }, mode === 'edit' ? 'Cập nhật bài viết thất bại' : 'Đăng bài viết thất bại')
    if (publishError.value) {
      error(publishError.value)
    }
  }

  return {
    categories,
    title,
    excerpt,
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
    isLoading,
    loadInitialData,
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

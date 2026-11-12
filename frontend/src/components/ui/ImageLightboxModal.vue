<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Image as ImageIcon
} from '@lucide/vue'

export interface LightboxImage {
  src: string
  alt?: string
  title?: string
}

const props = withDefaults(
  defineProps<{
    show: boolean
    images: LightboxImage[]
    initialIndex?: number
  }>(),
  {
    initialIndex: 0
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change-index', index: number): void
}>()

const currentIndex = ref(props.initialIndex)
const isZoomed = ref(false)
const isImageLoading = ref(true)

const currentImage = computed<LightboxImage | undefined>(() => {
  if (!props.images || props.images.length === 0) return undefined
  return props.images[currentIndex.value]
})

watch(
  () => props.initialIndex,
  (newIdx) => {
    if (newIdx >= 0 && newIdx < props.images.length) {
      currentIndex.value = newIdx
      isZoomed.value = false
    }
  }
)

watch(currentIndex, (newIdx) => {
  isZoomed.value = false
  isImageLoading.value = true
  emit('change-index', newIdx)
})

function prevImage() {
  if (props.images.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function nextImage() {
  if (props.images.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function toggleZoom() {
  isZoomed.value = !isZoomed.value
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.show) return
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  }
}

async function downloadCurrentImage() {
  if (!currentImage.value?.src) return
  try {
    const res = await fetch(currentImage.value.src)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    const filename = currentImage.value.alt?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'image'
    a.download = `${filename}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    // Fallback direct link
    window.open(currentImage.value.src, '_blank')
  }
}

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      if (props.initialIndex >= 0 && props.initialIndex < props.images.length) {
        currentIndex.value = props.initialIndex
      } else {
        currentIndex.value = 0
      }
      isZoomed.value = false
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown)
      isZoomed.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.show) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="show && images.length > 0"
        class="fixed inset-0 z-99999 flex flex-col justify-between bg-black/92 backdrop-blur-md select-none"
        @click.self="emit('close')"
      >
        <!-- Top Toolbar -->
        <header
          class="flex items-center justify-between px-4 sm:px-6 py-4 bg-linear-to-b from-black/80 to-transparent z-10 shrink-0"
        >
          <!-- Counter & Caption -->
          <div class="flex items-center gap-3 text-white">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10">
              <ImageIcon :size="13" class="text-primary-400" />
              <span>{{ currentIndex + 1 }} / {{ images.length }}</span>
            </span>
            <p
              v-if="currentImage?.alt"
              class="text-xs sm:text-sm text-gray-300 font-medium line-clamp-1 max-w-xs sm:max-w-md hidden sm:block"
            >
              {{ currentImage.alt }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <!-- Zoom Toggle -->
            <button
              @click="toggleZoom"
              type="button"
              :title="isZoomed ? 'Thu nhỏ (1:1)' : 'Phóng to chi tiết'"
              class="p-2 sm:p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ZoomOut v-if="isZoomed" :size="18" />
              <ZoomIn v-else :size="18" />
            </button>

            <!-- Download -->
            <button
              @click="downloadCurrentImage"
              type="button"
              title="Tải ảnh về máy"
              class="p-2 sm:p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Download :size="18" />
            </button>

            <!-- Close Button -->
            <button
              @click="emit('close')"
              type="button"
              title="Đóng (Esc)"
              class="p-2 sm:p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer ml-1"
            >
              <X :size="20" />
            </button>
          </div>
        </header>

        <!-- Main Display Area -->
        <div class="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden" @click.self="emit('close')">
          <!-- Previous Button -->
          <button
            v-if="images.length > 1"
            @click.stop="prevImage"
            type="button"
            title="Ảnh trước (Mũi tên Trái)"
            class="absolute left-2 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full text-white bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/10 transition-all hover:scale-105 cursor-pointer shadow-lg"
          >
            <ChevronLeft :size="24" />
          </button>

          <!-- Image Container -->
          <div
            class="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-300 overflow-auto"
            :class="isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'"
            @click="toggleZoom"
          >
            <img
              v-if="currentImage"
              :key="currentImage.src"
              :src="currentImage.src"
              :alt="currentImage.alt || 'Ảnh bài viết'"
              class="max-w-[92vw] max-h-[75vh] object-contain rounded-lg transition-transform duration-300 ease-out shadow-2xl"
              :class="isZoomed ? 'scale-150 max-h-none max-w-none' : 'scale-100'"
              @load="isImageLoading = false"
            />
          </div>

          <!-- Next Button -->
          <button
            v-if="images.length > 1"
            @click.stop="nextImage"
            type="button"
            title="Ảnh kế tiếp (Mũi tên Phải)"
            class="absolute right-2 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full text-white bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/10 transition-all hover:scale-105 cursor-pointer shadow-lg"
          >
            <ChevronRight :size="24" />
          </button>
        </div>

        <!-- Bottom Thumbnail Strip -->
        <footer
          v-if="images.length > 1"
          class="px-4 py-3 bg-linear-to-t from-black/80 to-transparent shrink-0 z-10"
        >
          <div class="flex items-center justify-center gap-2 max-w-4xl mx-auto overflow-x-auto py-1 scrollbar-thin">
            <button
              v-for="(img, idx) in images"
              :key="idx"
              @click.stop="currentIndex = idx"
              type="button"
              class="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border"
              :class="
                idx === currentIndex
                  ? 'ring-2 ring-primary-500 scale-105 border-primary-500 shadow-xs'
                  : 'opacity-50 hover:opacity-100 border-white/10 hover:scale-100'
              "
            >
              <img :src="img.src" :alt="img.alt || 'Thumbnail'" class="w-full h-full object-cover" />
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>

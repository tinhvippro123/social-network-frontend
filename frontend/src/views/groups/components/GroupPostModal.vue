<script setup lang="ts">
import { useRouter } from 'vue-router'
import { X, Calendar, Share2, ExternalLink, Check } from '@lucide/vue'
import { ref } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate } from '@/utils/formatters'
import { useToast } from '@/composables/ui/useToast'

const props = defineProps<{
  post: any | null
  groupName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const toast = useToast()
const copied = ref(false)

const goToProfile = (userId?: string) => {
  if (!userId) return
  emit('close')
  router.push(`/profile/${userId}`)
}

const openFullPage = () => {
  if (!props.post) return
  emit('close')
  router.push(`/groups/${props.post.groupId}/posts/${props.post.id}`)
}

const copyPostLink = async () => {
  if (!props.post) return
  const url = `${window.location.origin}/groups/${props.post.groupId}/posts/${props.post.id}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    toast.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm!')
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch (err) {
    toast.error('Không thể sao chép liên kết')
  }
}
</script>

<template>
  <div
    v-if="post"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-surface-800 rounded-3xl border border-gray-200 dark:border-surface-700 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-surface-700/60 bg-gray-50/50 dark:bg-surface-800">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
            <span>👥</span> {{ groupName || 'Thảo luận nhóm' }}
          </span>
        </div>
        
        <div class="flex items-center gap-1.5">
          <!-- Copy Link Button -->
          <button
            @click="copyPostLink"
            :class="[
              'p-2 rounded-xl text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer',
              copied ? 'text-emerald-500' : ''
            ]"
            :title="copied ? 'Đã sao chép' : 'Sao chép liên kết'"
          >
            <Check v-if="copied" :size="18" class="text-emerald-500 stroke-2" />
            <Share2 v-else :size="18" />
          </button>

          <!-- Open Dedicated Page Button -->
          <button
            @click="openFullPage"
            class="p-2 rounded-xl text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            title="Mở toàn trang riêng biệt"
          >
            <ExternalLink :size="18" />
          </button>

          <!-- Close Modal Button -->
          <button
            @click="emit('close')"
            class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X :size="20" />
          </button>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Cover Image -->
        <div v-if="post.coverImage" class="rounded-2xl overflow-hidden max-h-72 w-full bg-gray-100 dark:bg-surface-700 shadow-xs">
          <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
        </div>

        <!-- Post Title -->
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
          {{ post.title }}
        </h2>

        <!-- Author Info -->
        <div class="flex items-center justify-between py-3 border-y border-gray-100 dark:border-surface-700/60">
          <div
            @click="goToProfile(post.author?.id)"
            class="flex items-center gap-3 cursor-pointer group"
          >
            <UserAvatar :user="post.author" size="md" class="ring-2 ring-primary-500/20 group-hover:ring-primary-500/50 transition-all" />
            <div>
              <p class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                {{ post.author?.name || 'Thành viên' }}
              </p>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span v-if="post.createdAt" class="flex items-center gap-1">
                  <Calendar :size="12" /> {{ formatDate(post.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <button
            @click="openFullPage"
            class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Xem toàn trang <ExternalLink :size="12" />
          </button>
        </div>

        <!-- Post Content -->
        <div class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {{ post.content || post.excerpt }}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 bg-gray-50 dark:bg-surface-800 border-t border-gray-100 dark:border-surface-700 flex items-center justify-between">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          Nhấn <strong>Esc</strong> hoặc click ra ngoài để đóng
        </span>
        <div class="flex items-center gap-2">
          <button
            @click="openFullPage"
            class="px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ExternalLink :size="15" /> Mở trang riêng
          </button>
          <button
            @click="emit('close')"
            class="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-600 transition-all cursor-pointer shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

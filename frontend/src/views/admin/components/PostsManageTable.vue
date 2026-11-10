<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Eye, EyeOff, CheckCircle2, Trash2, Clock, ExternalLink } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import AdminPostPreviewModal from './AdminPostPreviewModal.vue'
import { formatDate, formatNumber } from '@/utils/formatters'

defineProps<{
  posts: any[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-status', post: any): void
  (e: 'delete', post: any): void
}>()

const router = useRouter()
// Mở trang client ở tab mới để admin không rời khỏi bảng quản lý
const openInNewTab = (path: string) => window.open(router.resolve(path).href, '_blank', 'noopener')

const selectedPostForPreview = ref<any | null>(null)
const isPreviewModalOpen = ref(false)

function openPreview(post: any) {
  selectedPostForPreview.value = post
  isPreviewModalOpen.value = true
}

function closePreview() {
  isPreviewModalOpen.value = false
  selectedPostForPreview.value = null
}

function handleModalToggleStatus(post: any) {
  emit('toggle-status', post)
}

function handleModalDelete(post: any) {
  closePreview()
  emit('delete', post)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full table-fixed">
      <thead>
        <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
          <th class="w-[30%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Bài viết</th>
          <th class="w-[20%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden md:table-cell">Tác giả</th>
          <th class="w-[15%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden sm:table-cell">Danh mục</th>
          <th class="w-[10%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Trạng thái</th>
          <th class="w-[15%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden lg:table-cell">Tương tác</th>
          <th class="w-[10%] text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="isLoading">
          <tr v-for="i in 5" :key="i" class="border-b border-gray-100 dark:border-surface-700">
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <Skeleton class="w-14 h-10 rounded-lg shrink-0" />
                <div class="space-y-2 w-48">
                  <Skeleton class="h-4 w-full rounded" />
                  <Skeleton class="h-3 w-2/3 rounded" />
                </div>
              </div>
            </td>
            <td class="px-5 py-4 hidden md:table-cell">
              <div class="flex items-center gap-2">
                <Skeleton class="w-8 h-8 rounded-full shrink-0" />
                <Skeleton class="h-4 w-24 rounded" />
              </div>
            </td>
            <td class="px-5 py-4 hidden sm:table-cell">
              <Skeleton class="h-4 w-20 rounded" />
            </td>
            <td class="px-5 py-4">
              <Skeleton class="h-6 w-16 rounded-lg" />
            </td>
            <td class="px-5 py-4 hidden lg:table-cell">
              <Skeleton class="h-4 w-24 rounded" />
            </td>
            <td class="px-5 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
                <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
                <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
              </div>
            </td>
          </tr>
        </template>
        <template v-else-if="posts.length">
          <tr v-for="post in posts" :key="post.id" class="border-b border-gray-100 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors">
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <img
                :src="post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80'"
                :alt="post.title"
                class="w-14 h-10 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-surface-700"
                @error="($event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80'"
              />
              <div>
                <button
                  type="button"
                  @click="openPreview(post)"
                  class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-xs hover:text-primary-500 text-left transition-colors cursor-pointer"
                  :title="post.title"
                >
                  {{ post.title }}
                </button>
                <p class="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock :size="10" /> {{ formatDate(post.createdAt) }}</p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 hidden md:table-cell">
            <div class="flex items-center gap-2">
              <UserAvatar :user="post.author || { name: post.authorName, avatar: post.authorAvatar }" size="sm" />
              <span @click="(post.author?.id || post.authorId) && openInNewTab(`/profile/${post.author?.id || post.authorId}`)" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:underline cursor-pointer">{{ post.author?.name || post.authorName || 'Ẩn danh' }}</span>
            </div>
          </td>
          <td class="px-5 py-4 hidden sm:table-cell">
            <span class="text-sm text-gray-500">{{ post.category?.name || post.categoryName || 'Chung' }}</span>
          </td>
          <td class="px-5 py-4">
            <div class="flex flex-col gap-1.5 items-start">
              <span :class="['px-2.5 py-1 rounded-lg text-xs font-semibold',
                (post.status || '').toLowerCase() === 'published' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                (post.status || '').toLowerCase() === 'draft' ? 'bg-gray-100 dark:bg-surface-700 text-gray-500' :
                'bg-red-100 dark:bg-red-900/20 text-red-500']">
                {{ (post.status || '').toLowerCase() === 'published' ? 'Đã đăng' : (post.status || '').toLowerCase() === 'draft' ? 'Nháp' : 'Đã ẩn' }}
              </span>
              <router-link
                v-if="post.reportsCount > 0"
                to="/admin/moderation"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                :title="'Bài viết này có ' + post.reportsCount + ' báo cáo từ người dùng. Nhấp để xem kiểm duyệt.'"
              >
                {{ post.reportsCount }} báo cáo
              </router-link>
            </div>
          </td>
          <td class="px-5 py-4 hidden lg:table-cell">
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span>👁 {{ formatNumber(post.viewsCount || 0) }}</span>
              <span>👍 {{ post.upvotesCount || 0 }}</span>
              <span>💬 {{ post.commentsCount || 0 }}</span>
            </div>
          </td>
          <td class="px-5 py-4 text-right">
            <div class="flex items-center justify-end gap-1">
              <button
                type="button"
                @click="openPreview(post)"
                class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors cursor-pointer"
                title="Xem trước bài viết (Modal Admin)"
              >
                <Eye :size="14" />
              </button>
              <button
                type="button"
                @click="openInNewTab(`/posts/${post.id}`)"
                class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title="Xem trên trang web (Tab mới)"
              >
                <ExternalLink :size="14" />
              </button>
              <button
                v-if="(post.status || '').toLowerCase() !== 'draft'"
                type="button"
                @click="emit('toggle-status', post)"
                :class="[
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  (post.status || '').toLowerCase() === 'hidden'
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-500'
                ]"
                :title="(post.status || '').toLowerCase() === 'hidden' ? 'Mở lại (Hiện bài)' : 'Ẩn bài viết'"
              >
                <CheckCircle2 v-if="(post.status || '').toLowerCase() === 'hidden'" :size="14" />
                <EyeOff v-else :size="14" />
              </button>
              <button
                type="button"
                @click="emit('delete', post)"
                class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors cursor-pointer"
                title="Xóa bài viết"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </td>
        </tr>
        </template>
        <tr v-else>
          <td colspan="6" class="px-5 py-12 text-center">
            <FileText class="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Không có bài viết nào</p>
            <p class="text-xs text-gray-500">Chưa có dữ liệu hoặc không tìm thấy bài viết phù hợp.</p>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Admin Post Preview Modal -->
    <AdminPostPreviewModal
      :is-open="isPreviewModalOpen"
      :post="selectedPostForPreview"
      @close="closePreview"
      @toggle-status="handleModalToggleStatus"
      @delete="handleModalDelete"
    />
  </div>
</template>

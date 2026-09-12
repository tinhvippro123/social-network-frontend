<script setup lang="ts">
import { ref } from 'vue'
import { Search as SearchIcon, FileText, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight, Clock } from '@lucide/vue'
import { ADMIN_POST_FILTERS } from '@/constants/ui'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import { useAdminPosts } from '@/composables/useAdminPosts'

const {
  posts,
  isLoading,
  searchQuery,
  filterStatus,
  currentPage
} = useAdminPosts()
</script>

<template>
  <div class="p-6">
    <AdminPageHeader
      title="Quản lý bài viết"
      subtitle="Duyệt và quản lý tất cả bài viết trong hệ thống"
      searchPlaceholder="Tìm bài viết..."
      v-model="searchQuery"
    >
      <template #filters>
        <button v-for="f in ADMIN_POST_FILTERS" :key="f.key" @click="filterStatus = f.key as any"
          :class="['px-4 py-2.5 rounded-xl text-sm font-medium transition-all', filterStatus === f.key ? 'bg-red-500 text-white' : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700']">
          {{ f.label }}
        </button>
      </template>
    </AdminPageHeader>

    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
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
                  <img :src="post.coverImage" class="w-14 h-10 rounded-lg object-cover shrink-0" />
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-xs">{{ post.title }}</p>
                    <p class="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock :size="10" /> {{ formatDate(post.createdAt) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 hidden md:table-cell">
                <div class="flex items-center gap-2">
                  <UserAvatar :user="post.author" size="sm" />
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ post.author.name }}</span>
                </div>
              </td>
              <td class="px-5 py-4 hidden sm:table-cell">
                <span class="text-sm text-gray-500">{{ post.category.icon }} {{ post.category.name }}</span>
              </td>
              <td class="px-5 py-4">
                <span :class="['px-2.5 py-1 rounded-lg text-xs font-semibold',
                  post.status === 'published' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                  post.status === 'draft' ? 'bg-gray-100 dark:bg-surface-700 text-gray-500' :
                  'bg-red-100 dark:bg-red-900/20 text-red-500']">
                  {{ post.status === 'published' ? 'Đã đăng' : post.status === 'draft' ? 'Nháp' : 'Đã ẩn' }}
                </span>
              </td>
              <td class="px-5 py-4 hidden lg:table-cell">
                <div class="flex items-center gap-3 text-xs text-gray-400">
                  <span>👁 {{ formatNumber(post.viewsCount) }}</span>
                  <span>👍 {{ post.upvotesCount }}</span>
                  <span>💬 {{ post.commentsCount }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors" title="Xem"><Eye :size="14" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-500 transition-colors" title="Ẩn"><EyeOff :size="14" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors" title="Xóa"><Trash2 :size="14" /></button>
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
      </div>

      <AdminPagination 
        v-model:current-page="currentPage"
        :total-items="posts.length"
        item-name="bài viết"
      />
    </div>
  </div>
</template>

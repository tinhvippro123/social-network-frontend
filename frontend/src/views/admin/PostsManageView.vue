<script setup lang="ts">
import { ref } from 'vue'
import { Search, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight, Clock } from '@lucide/vue'
import { usePosts } from '@/composables/usePosts'
import { onMounted } from 'vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate, formatNumber } from '@/utils/formatters'

const { posts, fetchPosts } = usePosts()

onMounted(() => {
  fetchPosts()
})

const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
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
        <button v-for="f in [{key:'all',label:'Tất cả'},{key:'published',label:'Đã đăng'},{key:'draft',label:'Nháp'},{key:'hidden',label:'Đã ẩn'}]" :key="f.key" @click="filterStatus = f.key"
          :class="['px-4 py-2.5 rounded-xl text-sm font-medium transition-all', filterStatus === f.key ? 'bg-red-500 text-white' : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700']">
          {{ f.label }}
        </button>
      </template>
    </AdminPageHeader>

    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Bài viết</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden md:table-cell">Tác giả</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden sm:table-cell">Danh mục</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Trạng thái</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden lg:table-cell">Tương tác</th>
              <th class="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
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

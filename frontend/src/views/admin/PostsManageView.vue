<script setup lang="ts">
import { ref } from 'vue'
import { Search as SearchIcon, FileText, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight, Clock } from '@lucide/vue'
import { ADMIN_POST_FILTERS } from '@/constants/ui'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import PostsManageTable from './components/PostsManageTable.vue'
import { formatDate, formatNumber } from '@/utils/formatters'
import { useAdminPosts } from '@/composables/admin/useAdminPosts'

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
      <PostsManageTable :posts="posts" :is-loading="isLoading" />

      <AdminPagination 
        v-model:current-page="currentPage"
        :total-items="posts.length"
        item-name="bài viết"
      />
    </div>
  </div>
</template>

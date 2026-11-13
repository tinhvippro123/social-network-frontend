<script setup lang="ts">
import { ADMIN_POST_FILTERS } from '@/constants/ui'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import PostsManageTable from './components/PostsManageTable.vue'
import { useAdminPosts } from '@/composables/admin/useAdminPosts'

const {
  posts,
  isLoading,
  totalItems,
  pageSize,
  searchQuery,
  filterStatus,
  currentPage,
  togglePostStatus,
  deletePost
} = useAdminPosts()
</script>

<template>
  <div class="p-6">
    <AdminPageHeader
      title="Quản lý bài viết"
      :subtitle="`${totalItems} bài viết trong hệ thống`"
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
      <PostsManageTable
        :posts="posts"
        :is-loading="isLoading"
        @toggle-status="togglePostStatus"
        @delete="deletePost"
      />

      <AdminPagination 
        v-model:current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="pageSize"
        item-name="bài viết"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Search as SearchIcon, MoreVertical, Shield, Ban, Trash2, Filter,
  UserCheck, UserX, ChevronLeft, ChevronRight, Mail, Calendar, Users
} from '@lucide/vue'
import { ADMIN_USER_FILTERS } from '@/constants/ui'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import UsersTable from './components/UsersTable.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatDate } from '@/utils/formatters'
import { useAdminUsers } from '@/composables/admin/useAdminUsers'

const {
  allUsers,
  isLoading,
  searchQuery,
  filterRole,
  currentPage
} = useAdminUsers()
</script>

<template>
  <div class="p-6">
    <AdminPageHeader
      title="Quản lý người dùng"
      :subtitle="`${allUsers.length} người dùng trong hệ thống`"
      searchPlaceholder="Tìm theo tên hoặc email..."
      v-model="searchQuery"
    >
      <template #filters>
        <button v-for="f in ADMIN_USER_FILTERS" :key="f.key" @click="filterRole = f.key as any"
          :class="['px-4 py-2.5 rounded-xl text-sm font-medium transition-all', filterRole === f.key ? 'bg-red-500 text-white' : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700']">
          {{ f.label }}
        </button>
      </template>
    </AdminPageHeader>

    <!-- Table -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
      <UsersTable :users="allUsers" :is-loading="isLoading" />

      <AdminPagination 
        v-model:current-page="currentPage"
        :total-items="allUsers.length"
        item-name="người dùng"
      />
    </div>
  </div>
</template>

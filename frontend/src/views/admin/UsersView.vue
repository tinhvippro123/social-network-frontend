<script setup lang="ts">
import { ref } from 'vue'
import {
  Search, MoreVertical, Shield, Ban, Trash2, Filter,
  UserCheck, UserX, ChevronLeft, ChevronRight, Mail, Calendar
} from '@lucide/vue'
import { useAdmin } from '@/composables/useAdmin'
import { onMounted, computed } from 'vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatDate } from '@/utils/formatters'

const { users: allUsers, fetchUsers } = useAdmin()

onMounted(() => {
  fetchUsers()
})

const searchQuery = ref('')
const filterRole = ref('all')
const currentPage = ref(1)
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
        <button v-for="f in [{key:'all',label:'Tất cả'},{key:'admin',label:'Admin'},{key:'moderator',label:'Mod'},{key:'user',label:'User'}]" :key="f.key" @click="filterRole = f.key"
          :class="['px-4 py-2.5 rounded-xl text-sm font-medium transition-all', filterRole === f.key ? 'bg-red-500 text-white' : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700']">
          {{ f.label }}
        </button>
      </template>
    </AdminPageHeader>

    <!-- Table -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Người dùng</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden sm:table-cell">Email</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Vai trò</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden md:table-cell">Bài viết</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden lg:table-cell">Ngày tham gia</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Trạng thái</th>
              <th class="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="user in allUsers" :key="user.id" class="border-b border-gray-100 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <UserAvatar :user="user" size="md" />
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
                    <p class="text-xs text-gray-400">@{{ user.name.toLowerCase().replace(/\s/g, '') }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 hidden sm:table-cell">
                <span class="flex items-center gap-1.5 text-sm text-gray-500"><Mail :size="12" /> {{ user.email }}</span>
              </td>
              <td class="px-5 py-4">
                <span :class="[
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold',
                  user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                  user.role === 'moderator' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                  'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
                ]">
                  <Shield v-if="user.role === 'admin'" :size="10" />
                  {{ user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderator' : 'User' }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-500 hidden md:table-cell">{{ user.postsCount }}</td>
              <td class="px-5 py-4 hidden lg:table-cell">
                <span class="flex items-center gap-1.5 text-xs text-gray-400"><Calendar :size="12" /> {{ formatDate(user.joinedAt) }}</span>
              </td>
              <td class="px-5 py-4">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Hoạt động
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors" title="Phân quyền"><UserCheck :size="14" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-500 transition-colors" title="Cấm"><Ban :size="14" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors" title="Xóa"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminPagination 
        v-model:current-page="currentPage"
        :total-items="allUsers.length"
        item-name="người dùng"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserCheck, Ban, Trash2, Users } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import UsersTableSkeletonRow from './UsersTableSkeletonRow.vue'
import { formatDate } from '@/utils/formatters'

defineProps<{
  users: any[]
  isLoading: boolean
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full table-fixed">
      <thead>
        <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
          <th class="w-[25%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Người dùng</th>
          <th class="w-[20%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden sm:table-cell">Email</th>
          <th class="w-[10%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Vai trò</th>
          <th class="w-[10%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden md:table-cell">Bài viết</th>
          <th class="w-[15%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden lg:table-cell">Ngày tham gia</th>
          <th class="w-[15%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Trạng thái</th>
          <th class="w-[5%] text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="isLoading">
          <UsersTableSkeletonRow v-for="i in 8" :key="i" />
        </template>
        <template v-else-if="users.length">
          <tr v-for="user in users" :key="user.id" class="border-b border-gray-100 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <UserAvatar :user="user" size="md" />
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{{ user.email }}</p>
                  </div>
                </div>
            </td>
            <td class="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell">{{ user.email }}</td>
            <td class="px-5 py-4">
              <span :class="[
                'px-2.5 py-1 rounded-lg text-xs font-medium',
                user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                user.role === 'moderator' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
              ]">
                {{ user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderator' : 'Thành viên' }}
              </span>
            </td>
            <td class="px-5 py-4 hidden md:table-cell">
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.postsCount }}</span>
              <span class="text-xs text-gray-400 ml-1">bài</span>
            </td>
            <td class="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">{{ formatDate(user.joinedAt) }}</td>
            <td class="px-5 py-4">
              <span class="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-lg w-fit">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div> Đang hoạt động
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
        </template>
        <tr v-else>
          <td colspan="7" class="px-5 py-12 text-center">
            <Users class="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Không có người dùng nào</p>
            <p class="text-xs text-gray-500">Chưa có dữ liệu hoặc không tìm thấy người dùng phù hợp.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

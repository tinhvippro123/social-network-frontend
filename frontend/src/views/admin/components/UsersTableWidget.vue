<script setup lang="ts">
import { Users, Search as SearchIcon, MoreVertical } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

defineProps<{
  users: any[]
  isLoading: boolean
}>()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mt-6 overflow-hidden">
    <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-surface-700">
      <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Users :size="18" class="text-primary-500" />
        Quản lý người dùng
      </h3>
      <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-1.5">
        <SearchIcon :size="14" class="text-gray-400" />
        <input type="text" placeholder="Tìm kiếm..." class="bg-transparent border-none outline-none text-xs text-gray-600 dark:text-gray-400 placeholder-gray-400 w-32" />
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-surface-700">
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Người dùng</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden sm:table-cell">Email</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Vai trò</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden md:table-cell">Bài viết</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="5" class="px-5 py-4">
              <div class="space-y-3">
                <Skeleton v-for="i in 5" :key="i" class="h-12 w-full rounded-xl" />
              </div>
            </td>
          </tr>
          <template v-else-if="users.length">
            <tr v-for="user in users" :key="user.id" class="border-b border-gray-100 dark:border-surface-700/50 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <UserAvatar :user="user" size="sm" />
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
                  <p class="text-xs text-gray-400">Tham gia {{ new Date(user.joinedAt).toLocaleDateString('vi-VN') }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ user.email }}</td>
            <td class="px-5 py-3">
              <span :class="[
                'px-2.5 py-1 rounded-lg text-xs font-medium',
                user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                user.role === 'moderator' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
              ]">
                {{ user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Mod' : 'User' }}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{{ user.postsCount }}</td>
            <td class="px-5 py-3">
              <button class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                <MoreVertical :size="16" />
              </button>
            </td>
          </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="px-5 py-8 text-center text-gray-500 text-sm">
              Không có dữ liệu người dùng
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Users, Globe, Lock, Trash2, Eye, Ban } from '@lucide/vue'
import { useGroups } from '@/composables/useGroups'
import { onMounted } from 'vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatNumber } from '@/utils/formatters'

const { groups, isLoading, fetchGroups } = useGroups()

onMounted(() => {
  fetchGroups()
})
</script>

<template>
  <div class="p-6">
    <AdminPageHeader
      title="Quản lý nhóm"
      subtitle="Giám sát và quản lý các nhóm cộng đồng"
    />

    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full table-fixed">
          <thead>
            <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
              <th class="w-[30%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Nhóm</th>
              <th class="w-[15%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden sm:table-cell">Loại</th>
              <th class="w-[15%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thành viên</th>
              <th class="w-[10%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden md:table-cell">Bài viết</th>
              <th class="w-[20%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden lg:table-cell">Quản lý</th>
              <th class="w-[10%] text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="border-b border-gray-100 dark:border-surface-700">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <Skeleton class="w-10 h-10 rounded-xl shrink-0" />
                    <div class="space-y-2 w-48">
                      <Skeleton class="h-4 w-32 rounded" />
                      <Skeleton class="h-3 w-48 rounded max-w-full" />
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 hidden sm:table-cell">
                  <Skeleton class="h-6 w-20 rounded-lg" />
                </td>
                <td class="px-5 py-4">
                  <Skeleton class="h-4 w-16 rounded" />
                </td>
                <td class="px-5 py-4 hidden md:table-cell">
                  <Skeleton class="h-4 w-10 rounded" />
                </td>
                <td class="px-5 py-4 hidden lg:table-cell">
                  <div class="flex items-center gap-2">
                    <Skeleton class="w-8 h-8 rounded-full shrink-0" />
                    <Skeleton class="h-3 w-20 rounded" />
                  </div>
                </td>
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
                    <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
                  </div>
                </td>
              </tr>
            </template>
            <template v-else-if="groups.length">
              <tr v-for="group in groups" :key="group.id" class="border-b border-gray-100 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img :src="group.avatar" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-surface-700" />
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ group.name }}</p>
                    <p class="text-xs text-gray-400 line-clamp-1 max-w-xs">{{ group.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 hidden sm:table-cell">
                <span :class="['flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium w-fit',
                  group.isPublic ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600']">
                  <Globe v-if="group.isPublic" :size="10" /> <Lock v-else :size="10" />
                  {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><Users :size="12" /> {{ formatNumber(group.membersCount) }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-500 hidden md:table-cell">{{ group.postsCount }}</td>
              <td class="px-5 py-4 hidden lg:table-cell">
                <div class="flex items-center gap-2">
                  <UserAvatar :user="group.owner" size="sm" />
                  <span class="text-xs text-gray-500">{{ group.owner.name }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors"><Eye :size="14" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors" title="Giải tán"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
            </template>
            <tr v-else>
              <td colspan="6" class="px-5 py-12 text-center">
                <Users class="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Không có nhóm nào</p>
                <p class="text-xs text-gray-500">Chưa có dữ liệu hoặc không tìm thấy nhóm phù hợp.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

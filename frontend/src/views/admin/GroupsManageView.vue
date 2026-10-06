<script setup lang="ts">
import { ref } from 'vue'
import { Users } from '@lucide/vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import GroupsManageRow from './components/GroupsManageRow.vue'
import GroupsManageSkeletonRow from './components/GroupsManageSkeletonRow.vue'
import { useAdminGroups } from '@/composables/admin/useAdminGroups'

const { groups, isLoading } = useAdminGroups()
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
              <GroupsManageSkeletonRow v-for="i in 5" :key="i" />
            </template>
            <template v-else-if="groups.length">
              <GroupsManageRow
                v-for="group in groups"
                :key="group.id"
                :group="group"
              />
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

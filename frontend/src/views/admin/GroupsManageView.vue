<script setup lang="ts">
import { ref } from 'vue'
import { Users, Globe, Lock, Trash2, Eye, Ban } from '@lucide/vue'
import { useGroups } from '@/composables/useGroups'
import { onMounted } from 'vue'

const { groups, fetchGroups } = useGroups()

onMounted(() => {
  fetchGroups()
})

const formatNumber = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n.toString()
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Quản lý nhóm</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Giám sát và quản lý các nhóm cộng đồng</p>
    </div>

    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Nhóm</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden sm:table-cell">Loại</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thành viên</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden md:table-cell">Bài viết</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden lg:table-cell">Quản lý</th>
              <th class="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
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
                  <img :src="group.owner.avatar" class="w-5 h-5 rounded-full" />
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
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

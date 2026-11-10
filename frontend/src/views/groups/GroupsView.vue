<script setup lang="ts">
import { Search as SearchIcon, Plus, Users } from '@lucide/vue'
import GroupSkeletonCard from '@/components/groups/GroupSkeletonCard.vue'
import { GROUP_FILTERS } from '@/constants/ui'
import { useGroupsView } from '@/composables/groups/useGroupsView'
import GroupCard from '@/components/groups/GroupCard.vue'
import CreateGroupModal from '@/components/groups/CreateGroupModal.vue'

const {
  isLoading,
  showCreateModal,
  searchGroup,
  filterType,
  filteredGroups,
  initData,
  openCreateModal,
  handleToggleJoin
} = useGroupsView()
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nhóm</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tham gia nhóm để kết nối với cộng đồng</p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-xs cursor-pointer"
      >
        <Plus :size="16" />
        Tạo nhóm mới
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex-1 flex items-center gap-2 bg-white dark:bg-surface-800 rounded-xl px-4 py-2.5 border border-gray-200 dark:border-surface-700">
        <SearchIcon :size="18" class="text-gray-400" />
        <input
          v-model="searchGroup"
          type="text"
          placeholder="Tìm kiếm nhóm..."
          class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="f in GROUP_FILTERS"
          :key="f.key"
          @click="filterType = f.key as any"
          :class="[
            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
            filterType === f.key
              ? 'bg-primary-500 text-white shadow-xs'
              : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700'
          ]"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Groups Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
      <!-- Skeletons -->
      <template v-if="isLoading">
        <GroupSkeletonCard v-for="i in 6" :key="'sk-' + i" />
      </template>

      <!-- Actual Groups -->
      <template v-else-if="filteredGroups.length > 0">
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
          @toggle-join="handleToggleJoin"
        />
      </template>

      <!-- Empty State -->
      <div v-else class="col-span-full py-16 text-center bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
        <Users :size="48" class="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Không tìm thấy nhóm nào</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc nhóm.</p>
      </div>
    </div>

    <!-- Create Group Modal -->
    <CreateGroupModal v-model="showCreateModal" @created="initData" />
  </div>
</template>

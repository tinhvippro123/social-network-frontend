<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search as SearchIcon, Plus, Users, Globe, Lock, ArrowRight } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { GROUP_FILTERS } from '@/constants/ui'
import { formatNumber } from '@/utils/formatters'
import { useGroupsView } from '@/composables/groups/useGroupsView'
import GroupCard from '@/components/groups/GroupCard.vue'
import CreateGroupModal from '@/components/groups/CreateGroupModal.vue'

const {
  router,
  isLoading,
  showCreateModal,
  searchGroup,
  filterType,
  filteredGroups
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
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
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
            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            filterType === f.key
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
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
        <div
          v-for="i in 6"
          :key="'sk-' + i"
          class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden"
        >
          <!-- Cover -->
          <div class="relative h-32 overflow-hidden rounded-t-2xl">
            <Skeleton type="image" class="w-full h-full" rounded="rounded-none" />
          </div>
          <!-- Content -->
          <div class="p-4">
            <div class="flex items-start gap-3 -mt-10 relative z-10">
              <Skeleton type="avatar" class="w-14 h-14 ring-4 ring-white dark:ring-surface-800 shrink-0 bg-white" rounded="rounded-xl" />
              <div class="pt-7 w-full space-y-2">
                <Skeleton type="title" width="w-3/4" height="h-5" />
                <Skeleton type="text" width="w-full" />
                <Skeleton type="text" width="w-2/3" />
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-surface-700">
              <Skeleton type="button" width="w-full" height="h-9" rounded="rounded-xl" />
            </div>
          </div>
        </div>
      </template>

      <!-- Actual Groups -->
      <template v-else>
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
        />
      </template>
    </div>

    <!-- Create Group Modal -->
    <CreateGroupModal v-model="showCreateModal" />
  </div>
</template>

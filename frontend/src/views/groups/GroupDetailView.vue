<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Users, FileText, Settings, Globe, Lock, Calendar, Shield, MessageCircle, Eye, ArrowUp } from '@lucide/vue'
import { GROUP_DETAIL_TABS } from '@/constants/ui'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import GroupHeader from './components/GroupHeader.vue'
import GroupCompactPost from './components/GroupCompactPost.vue'
import GroupSidebar from './components/GroupSidebar.vue'
import { formatNumber, formatDate } from '@/utils/formatters'
import { useGroupDetail } from '@/composables/groups/useGroupDetail'

const {
  router,
  group,
  isGroupLoading,
  posts,
  isPostsLoading,
  users,
  isUsersLoading,
  activeTab
} = useGroupDetail()

</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <button @click="router.push('/groups')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6">
      <ChevronLeft :size="16" /> Quay lại nhóm
    </button>

    <div v-if="isGroupLoading" class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 min-w-0 space-y-6">
        <Skeleton class="h-64 w-full rounded-2xl" />
        <Skeleton class="h-12 w-full max-w-sm rounded-xl" />
        <div class="space-y-4">
          <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-2xl" />
        </div>
      </div>
      <aside class="w-full lg:w-80 shrink-0 space-y-5">
        <Skeleton v-for="i in 4" :key="i" class="h-40 w-full rounded-2xl" />
      </aside>
    </div>

    <div v-else-if="group" class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Group Header -->
        <GroupHeader :group="group" />

        <!-- Tabs -->
        <div class="flex gap-1 mb-6 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-1">
          <button v-for="tab in GROUP_DETAIL_TABS" :key="tab.key" @click="activeTab = tab.key as any"
            :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all', activeTab === tab.key ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700']"
          >{{ tab.label }}</button>
        </div>

        <!-- Tab Content: Bài viết -->
        <div v-if="activeTab === 'posts'">
          <div v-if="isPostsLoading" class="space-y-4">
            <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-2xl" />
          </div>
          <div v-else-if="posts.length" class="space-y-4">
            <GroupCompactPost v-for="post in posts.slice(0, 5)" :key="post.id" :post="post" />
          </div>
          <div v-else class="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
            <FileText :size="48" class="mx-auto text-gray-300 mb-4" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết</h3>
            <p class="text-gray-500">Nhóm này chưa có bài viết nào.</p>
          </div>
        </div>

        <!-- Tab Content: Thành viên -->
        <div v-if="activeTab === 'members'">
          <div v-if="isUsersLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton v-for="i in 6" :key="i" class="h-16 w-full rounded-xl" />
          </div>
          <div v-else-if="users.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="user in users" :key="user.id" class="flex items-center gap-3 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-3">
              <UserAvatar :user="user" size="md" />
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
                <p class="text-xs text-gray-400">{{ user.postsCount }} bài viết</p>
              </div>
              <span class="text-xs text-gray-400 bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded-lg">{{ user.role }}</span>
            </div>
          </div>
          <div v-else class="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
            <Users :size="48" class="mx-auto text-gray-300 mb-4" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có thành viên</h3>
            <p class="text-gray-500">Nhóm này chưa có thành viên nào.</p>
          </div>
        </div>

        <!-- Tab Content: Giới thiệu -->
        <div v-if="activeTab === 'about'" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Giới thiệu nhóm</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ group.description }}</p>
          <div class="mt-6 space-y-3">
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <Calendar :size="16" class="text-primary-500" />
              <span>Ngày tạo: {{ formatDate(group.createdAt) }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <Globe v-if="group.isPublic" :size="16" class="text-green-500" />
              <Lock v-else :size="16" class="text-amber-500" />
              <span>{{ group.isPublic ? 'Nhóm công khai — Ai cũng có thể xem và tham gia' : 'Nhóm riêng tư — Cần được duyệt để tham gia' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <Shield :size="16" class="text-primary-500" />
              <span>Quản trị viên: {{ group.owner.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <GroupSidebar :group="group" :users="users" :is-users-loading="isUsersLoading" />
    </div>
  </div>
</template>

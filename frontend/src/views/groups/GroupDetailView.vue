<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Users, FileText, Globe, Lock, Calendar, Shield, PenSquare } from '@lucide/vue'
import { GROUP_DETAIL_TABS } from '@/constants/ui'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import GroupHeader from './components/GroupHeader.vue'
import GroupCompactPost from './components/GroupCompactPost.vue'
import GroupSidebar from './components/GroupSidebar.vue'
import GroupPostModal from './components/GroupPostModal.vue'
import CreateGroupPostModal from './components/CreateGroupPostModal.vue'
import { formatDate } from '@/utils/formatters'
import { useGroupDetail } from '@/composables/groups/useGroupDetail'

const route = useRoute()
const {
  router,
  group,
  isGroupLoading,
  posts,
  isPostsLoading,
  users,
  isUsersLoading,
  activeTab,
  handleToggleJoin
} = useGroupDetail()

const selectedPost = ref<any | null>(null)
const isCreatePostModalOpen = ref(false)

const openPostModal = (post: any) => {
  selectedPost.value = post
  if (post?.id) {
    router.replace({ query: { ...route.query, post: post.id } })
  }
}

const closePostModal = () => {
  selectedPost.value = null
  const q = { ...route.query }
  delete q.post
  router.replace({ query: q })
}

// Check if route query has ?post=postId to auto open modal
watch([posts, () => route.query.post], ([newPosts, postId]) => {
  if (postId && newPosts?.length && !selectedPost.value) {
    const found = newPosts.find((p: any) => p.id === postId)
    if (found) {
      selectedPost.value = found
    }
  }
}, { immediate: true })

const goToProfile = (userId?: string) => {
  if (userId) {
    router.push(`/profile/${userId}`)
  }
}

const handlePostCreated = (newPost: any) => {
  if (newPost) {
    posts.value.unshift(newPost)
    if (group.value) {
      group.value.postsCount = (group.value.postsCount || 0) + 1
    }
  }
}
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <button @click="router.push('/groups')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6 cursor-pointer">
      <ChevronLeft :size="16" /> Quay lại danh sách nhóm
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
        <GroupHeader
          :group="group"
          @toggle-join="handleToggleJoin"
          @switch-tab="activeTab = $event"
        />

        <!-- Tabs & Create Post Button -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div class="flex gap-1 flex-1 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-1">
            <button
              v-for="tab in GROUP_DETAIL_TABS"
              :key="tab.key"
              @click="activeTab = tab.key as any"
              :class="[
                'flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <button
            v-if="group.isJoined"
            @click="isCreatePostModalOpen = true"
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white gradient-primary hover:opacity-90 shadow-md shadow-primary-500/20 transition-all cursor-pointer shrink-0"
          >
            <PenSquare :size="16" />
            <span>Viết bài thảo luận</span>
          </button>
        </div>

        <!-- Tab Content: Bài viết -->
        <div v-if="activeTab === 'posts'">
          <div v-if="isPostsLoading" class="space-y-4">
            <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-2xl" />
          </div>
          <div v-else-if="posts.length" class="space-y-4">
            <GroupCompactPost
              v-for="post in posts"
              :key="post.id"
              :post="post"
              @select="openPostModal"
            />
          </div>
          <div v-else class="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
            <FileText :size="48" class="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">Nhóm này chưa có bài viết thảo luận nào.</p>
            <button
              v-if="group.isJoined"
              @click="isCreatePostModalOpen = true"
              class="px-4 py-2 text-sm font-semibold text-white gradient-primary rounded-xl cursor-pointer shadow-xs"
            >
              Đăng bài thảo luận đầu tiên
            </button>
          </div>
        </div>

        <!-- Tab Content: Thành viên -->
        <div v-if="activeTab === 'members'">
          <div v-if="isUsersLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton v-for="i in 6" :key="i" class="h-16 w-full rounded-xl" />
          </div>
          <div v-else-if="users.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="item in (users as any[])"
              :key="item.user?.id || item.id"
              @click="goToProfile(item.user?.id || item.id)"
              class="flex items-center gap-3 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-3 hover:border-primary-500/50 hover:shadow-md transition-all cursor-pointer group"
              title="Nhấn để xem trang cá nhân"
            >
              <UserAvatar :user="(item.user || item) as any" size="md" class="group-hover:scale-105 transition-transform" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
                  {{ item.user?.name || item.name }}
                </p>
                <p v-if="item.joinedAt" class="text-xs text-gray-400">
                  Tham gia {{ formatDate(item.joinedAt) }}
                </p>
              </div>
              <span
                :class="[
                  'text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0',
                  item.role === 'OWNER'
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                    : item.role === 'ADMIN'
                    ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-300'
                ]"
              >
                {{ item.role === 'OWNER' ? 'Trưởng nhóm' : item.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên' }}
              </span>
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
              <span>{{ group.isPublic ? 'Nhóm công khai — Bất kỳ ai cũng có thể xem và tham gia' : 'Nhóm riêng tư — Cần được duyệt để tham gia' }}</span>
            </div>
            <div
              @click="goToProfile(group.owner?.id)"
              class="flex items-center gap-3 text-sm text-gray-500 cursor-pointer hover:text-primary-500 transition-colors"
            >
              <Shield :size="16" class="text-primary-500" />
              <span>Trưởng nhóm: <strong class="text-gray-900 dark:text-white hover:underline">{{ group.owner?.name }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <GroupSidebar
        :group="group"
        :users="users"
        :is-users-loading="isUsersLoading"
        @switch-tab="activeTab = $event"
      />
    </div>

    <!-- Modals -->
    <GroupPostModal
      :post="selectedPost"
      :group-name="group?.name"
      @close="closePostModal"
    />

    <CreateGroupPostModal
      v-if="group"
      :is-open="isCreatePostModalOpen"
      :group-id="group.id"
      :group-name="group.name"
      @close="isCreatePostModalOpen = false"
      @created="handlePostCreated"
    />
  </div>
</template>

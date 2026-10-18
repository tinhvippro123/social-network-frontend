<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  FileText, Lock, UserX
} from '@lucide/vue'
import { useProfileTabs } from '@/composables/ui/useProfileTabs'
import Skeleton from '@/components/ui/Skeleton.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfilePostItem from './components/ProfilePostItem.vue'
import ProfilePostSkeleton from './components/ProfilePostSkeleton.vue'
import { useAuth } from '@/composables/auth/useAuth'
import usersApi from '@/api/users.api'
import type { UserProfile } from '@/types'

const router = useRouter()
const route = useRoute()
const { user: authUser } = useAuth()

const profileUserId = computed(() => route.params.id as string | undefined)
const isOwnProfile = computed(() => !profileUserId.value || profileUserId.value === authUser.value?.id)

const profileUser = ref<UserProfile | null>(null)
const isProfileLoading = ref(true)

const { activeTab, tabs, posts, isLoading, fetchPosts } = useProfileTabs(isOwnProfile.value, profileUser)

// Privacy setting
const privacySetting = ref<'public' | 'followers' | 'private'>('public')
const isAllowedToView = computed(() => {
  if (isOwnProfile.value) return true
  if (privacySetting.value === 'public') return true
  if (privacySetting.value === 'followers') return true
  return false
})

async function loadProfile() {
  isProfileLoading.value = true
  try {
    const targetId = profileUserId.value || authUser.value?.id
    if (!targetId) {
      profileUser.value = null
      return
    }
    const res = await usersApi.getProfile(targetId)
    profileUser.value = res.data.data
    await fetchPosts(targetId)
  } catch (err) {
    profileUser.value = null
  } finally {
    isProfileLoading.value = false
  }
}

function handleMessage(userId: string) {
  router.push({ name: 'chat', query: { userId } })
}

onMounted(() => {
  loadProfile()
})

// Re-fetch when profile changes or user logs in
watch(() => [route.params.id, authUser.value?.id], () => {
  loadProfile()
})
</script>

<template>
  <div v-if="isProfileLoading" class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 h-64 overflow-hidden">
      <Skeleton type="image" class="w-full h-full" />
    </div>
    <div class="space-y-4">
      <ProfilePostSkeleton v-for="i in 3" :key="i" />
    </div>
  </div>

  <div v-else-if="profileUser" class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Profile Header -->
    <ProfileHeader
      :current-user="profileUser"
      :is-own-profile="isOwnProfile"
      @message="handleMessage"
    />

    <!-- Privacy block (if not allowed to view) -->
    <div v-if="!isAllowedToView" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-12 text-center">
      <Lock class="w-12 h-12 text-gray-300 dark:text-surface-600 mx-auto mb-4" />
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Trang cá nhân riêng tư</h3>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Người dùng này đã đặt trang cá nhân ở chế độ riêng tư.</p>
      <p v-if="privacySetting === 'followers'" class="text-gray-400 text-xs mt-2">Hãy theo dõi họ để xem nội dung.</p>
    </div>

    <!-- Content (if allowed) -->
    <template v-else>
      <!-- Tabs -->
      <div class="grid grid-cols-2 sm:flex sm:items-center gap-1.5 mb-6 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-1.5">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 sm:flex-1',
            activeTab === tab.key
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
          ]"
        >
          <component :is="tab.icon" :size="16" class="shrink-0" />
          <span class="truncate">{{ tab.label }}</span>
          <span class="text-xs opacity-70 shrink-0">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Posts List (tab: posts) -->
      <div v-if="activeTab === 'posts'" class="space-y-4 stagger-children">
        <template v-if="isLoading">
          <ProfilePostSkeleton v-for="i in 3" :key="i" />
        </template>
        
        <template v-else-if="posts.length > 0">
          <ProfilePostItem
            v-for="post in posts"
            :key="post.id"
            :post="post"
          />
        </template>

        <div v-else class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-12 text-center">
          <FileText class="w-12 h-12 text-gray-300 dark:text-surface-600 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Khi người dùng xuất bản bài viết, chúng sẽ xuất hiện ở đây.</p>
        </div>
      </div>

      <!-- Drafts List (tab: drafts) -->
      <div v-else-if="activeTab === 'drafts'" class="space-y-4 stagger-children">
        <ProfilePostItem
          v-for="post in posts"
          :key="'draft-' + post.id"
          :post="post"
          :is-draft="true"
        />

        <div v-if="posts.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-12 text-center">
          <FileText class="w-12 h-12 text-gray-300 dark:text-surface-600 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Không có bài nháp</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Khi bạn lưu nháp, chúng sẽ xuất hiện ở đây.</p>
        </div>
      </div>

      <!-- Bookmarks / Groups placeholder -->
      <div v-else class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-12 text-center">
        <FileText class="w-12 h-12 text-gray-300 dark:text-surface-600 mx-auto mb-4" />
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ tabs.find(t => t.key === activeTab)?.label }}</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Nội dung sẽ xuất hiện ở đây.</p>
      </div>
    </template>
  </div>

  <!-- User Not Found -->
  <div v-else class="mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center max-w-md">
    <div class="bg-white dark:bg-surface-800 rounded-3xl p-8 border border-gray-200 dark:border-surface-700 shadow-xl space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto text-red-500">
        <UserX :size="32" />
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy người dùng</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Tài khoản này không tồn tại hoặc đã bị khóa.</p>
      <button @click="router.push('/')" class="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-95 transition-opacity">
        Quay lại trang chủ
      </button>
    </div>
  </div>
</template>

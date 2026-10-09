<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, MapPin, Link as LinkIcon, Edit3, UserPlus, UserCheck, MessageCircle, MoreHorizontal, Shield, Flag } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { formatDate, formatNumber } from '@/utils/formatters'
import UserAvatar from '@/components/UserAvatar.vue'
import FollowersModal from './FollowersModal.vue'
import { useToast } from '@/composables/ui/useToast'

const props = defineProps<{
  currentUser: any
  isOwnProfile?: boolean
}>()

const emit = defineEmits<{
  (e: 'message', userId: string): void
}>()

const router = useRouter()
const { addToast } = useToast()

// Follow state
const isFollowing = ref(false)
const isFollowLoading = ref(false)

// Followers/Following modal
const showFollowersModal = ref(false)
const followersModalType = ref<'followers' | 'following'>('followers')

// More menu
const showMoreMenu = ref(false)

function openFollowersModal(type: 'followers' | 'following') {
  followersModalType.value = type
  showFollowersModal.value = true
}

async function toggleFollow() {
  isFollowLoading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  isFollowing.value = !isFollowing.value
  isFollowLoading.value = false
}

function handleMessage() {
  emit('message', props.currentUser.id)
}
</script>

<template>
  <div class="relative bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6">
    <!-- Cover -->
    <div class="h-40 sm:h-52 bg-linear-to-r from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden rounded-t-2xl">
      <div class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 20px 20px;"
      />
    </div>

    <!-- Avatar & Info -->
    <div class="px-6 pb-6">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 -mt-12 sm:-mt-16 relative z-10 text-center sm:text-left">
        <UserAvatar
          :user="currentUser"
          size="xl"
          class="ring-4 ring-white dark:ring-surface-800 shadow-xl bg-white"
        />
        <div class="flex-1 pt-2 sm:pt-20">
          <div class="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 sm:gap-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentUser.name }}</h1>
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 w-fit mx-auto sm:mx-0">
              {{ currentUser.role === 'admin' ? '👑 Admin' : '👤 Member' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentUser.bio }}</p>
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-400">
            <span class="flex items-center gap-1"><Calendar :size="12" /> Tham gia {{ formatDate(currentUser.joinedAt) }}</span>
            <span class="flex items-center gap-1"><MapPin :size="12" /> TP. Hồ Chí Minh</span>
            <span class="flex items-center gap-1"><LinkIcon :size="12" /> github.com/tinh</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="shrink-0 mt-4 sm:mt-20 flex items-center gap-2">
          <!-- Own Profile: Edit button -->
          <template v-if="isOwnProfile">
            <button @click="router.push('/settings')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <Edit3 :size="14" /> Chỉnh sửa
            </button>
          </template>

          <!-- Other's Profile: Follow + Message buttons -->
          <template v-else>
            <button
              @click="toggleFollow"
              :disabled="isFollowLoading"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isFollowing
                  ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                  : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25'
              ]"
            >
              <component :is="isFollowing ? UserCheck : UserPlus" :size="14" :class="{ 'animate-spin': isFollowLoading }" />
              {{ isFollowing ? 'Đang theo dõi' : 'Theo dõi' }}
            </button>

            <button
              @click="handleMessage"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all"
            >
              <MessageCircle :size="14" /> Nhắn tin
            </button>

            <!-- More Menu -->
            <div class="relative">
              <button
                @click="showMoreMenu = !showMoreMenu"
                class="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
              >
                <MoreHorizontal :size="16" />
              </button>
              <Transition name="dropdown">
                <div v-if="showMoreMenu" class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 py-1.5 z-50">
                  <button @click="addToast({ message: 'Tính năng đang được phát triển', type: 'info' })" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                    <Shield :size="14" /> Chặn người dùng
                  </button>
                  <button @click="addToast({ message: 'Tính năng đang được phát triển', type: 'info' })" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Flag :size="14" /> Báo cáo
                  </button>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </div>

      <!-- Stats (clickable) -->
      <div class="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-surface-700">
        <div class="text-center min-w-[60px]">
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatNumber(currentUser.postsCount) }}</p>
          <p class="text-xs text-gray-400">Bài viết</p>
        </div>
        <button @click="openFollowersModal('followers')" class="text-center group cursor-pointer hover:scale-105 transition-transform min-w-[60px]">
          <p class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{{ formatNumber(currentUser.followersCount) }}</p>
          <p class="text-xs text-gray-400 group-hover:text-primary-400 transition-colors">Followers</p>
        </button>
        <button @click="openFollowersModal('following')" class="text-center group cursor-pointer hover:scale-105 transition-transform min-w-[60px]">
          <p class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{{ formatNumber(currentUser.followingCount) }}</p>
          <p class="text-xs text-gray-400 group-hover:text-primary-400 transition-colors">Following</p>
        </button>
      </div>
    </div>
  </div>

  <!-- Followers/Following Modal -->
  <FollowersModal
    :show="showFollowersModal"
    :type="followersModalType"
    :user="currentUser"
    @close="showFollowersModal = false"
  />
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.95);
}
</style>

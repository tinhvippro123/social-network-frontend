<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Calendar, MapPin, Link as LinkIcon, Edit3, UserPlus, UserCheck, MessageCircle, MoreHorizontal, Shield, Flag } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { formatDate, formatNumber } from '@/utils/formatters'
import UserAvatar from '@/components/UserAvatar.vue'
import FollowersModal from './FollowersModal.vue'
import { useToast } from '@/composables/ui/useToast'
import { useConfirm } from '@/composables/ui/useConfirm'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import usersApi from '@/api/users.api'
import chatApi from '@/api/chat.api'
import http from '@/api/client'

const props = defineProps<{
  currentUser: any
  isOwnProfile?: boolean
  canViewConnections?: boolean
}>()

const emit = defineEmits<{
  (e: 'message', userId: string): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { addToast } = useToast()
const { confirm } = useConfirm()

// Follow state
const isFollowing = ref(false)
const isFollowLoading = ref(false)

watch(() => props.currentUser, (val) => {
  isFollowing.value = Boolean(val?.isFollowing ?? val?.following)
}, { immediate: true, deep: true })

// Followers/Following modal
const showFollowersModal = ref(false)
const followersModalType = ref<'followers' | 'following'>('followers')

// More menu
const showMoreMenu = ref(false)
const isBlockedUser = ref(false)
const moreMenuRef = ref<HTMLElement | null>(null)

watch(() => props.currentUser?.id, async (targetId) => {
  if (!targetId || props.isOwnProfile || !authStore.isLoggedIn) {
    isBlockedUser.value = false
    return
  }
  try {
    const res = await chatApi.getBlockedUsers()
    const blockedList = res.data?.data || []
    isBlockedUser.value = Array.isArray(blockedList) && blockedList.some((u: any) => String(typeof u === 'string' ? u : u?.id) === String(targetId))
  } catch {
    isBlockedUser.value = false
  }
}, { immediate: true })

function handleOutsideClick(e: MouseEvent) {
  if (showMoreMenu.value && moreMenuRef.value && !moreMenuRef.value.contains(e.target as Node)) {
    showMoreMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

function openFollowersModal(type: 'followers' | 'following') {
  if (props.canViewConnections === false) {
    addToast({ message: 'Trang cá nhân này ở chế độ riêng tư', type: 'info' })
    return
  }
  followersModalType.value = type
  showFollowersModal.value = true
}

async function handleToggleBlockUser() {
  showMoreMenu.value = false
  if (!authStore.isLoggedIn) {
    addToast({ message: 'Vui lòng đăng nhập để thực hiện thao tác này', type: 'info' })
    uiStore.openAuthModal('login')
    return
  }
  if (!props.currentUser?.id) return
  if (!isBlockedUser.value) {
    const ok = await confirm({
      title: 'Chặn người dùng',
      message: `Bạn có chắc chắn muốn chặn "${props.currentUser.name || 'người dùng này'}"? Họ sẽ không thể nhắn tin cho bạn.`,
      confirmText: 'Chặn',
      variant: 'danger'
    })
    if (!ok) return
  }
  try {
    if (isBlockedUser.value) {
      await chatApi.unblockUser(props.currentUser.id)
      isBlockedUser.value = false
      addToast({ message: `Đã bỏ chặn ${props.currentUser.name}`, type: 'success' })
    } else {
      await chatApi.blockUser(props.currentUser.id)
      isBlockedUser.value = true
      addToast({ message: `Đã chặn ${props.currentUser.name}`, type: 'info' })
    }
  } catch (err: any) {
    addToast({ message: err.response?.data?.message || 'Không thể thực hiện thao tác chặn', type: 'error' })
  }
}

async function handleReportUser() {
  showMoreMenu.value = false
  if (!authStore.isLoggedIn) {
    addToast({ message: 'Vui lòng đăng nhập để gửi báo cáo', type: 'info' })
    uiStore.openAuthModal('login')
    return
  }
  if (!props.currentUser?.id) return
  const ok = await confirm({
    title: 'Báo cáo người dùng',
    message: `Bạn muốn gửi báo cáo vi phạm đối với tài khoản "${props.currentUser.name || 'người dùng này'}"?`,
    confirmText: 'Gửi báo cáo',
    variant: 'warning'
  })
  if (!ok) return
  try {
    await http.post('/reports', {
      targetId: props.currentUser.id,
      type: 'USER',
      reason: `Báo cáo tài khoản người dùng: ${props.currentUser.name || props.currentUser.username}`
    })
    addToast({ message: 'Đã gửi báo cáo người dùng đến bộ phận kiểm duyệt', type: 'success' })
  } catch (err: any) {
    addToast({ message: err.response?.data?.message || 'Không thể gửi báo cáo lúc này', type: 'error' })
  }
}

async function toggleFollow() {
  if (!authStore.isLoggedIn) {
    addToast({ message: 'Vui lòng đăng nhập để theo dõi người dùng', type: 'info' })
    uiStore.openAuthModal('login')
    return
  }
  if (!props.currentUser?.id) return
  isFollowLoading.value = true
  try {
    const res = await usersApi.toggleFollow(props.currentUser.id)
    const newStatus = res.data.data
    isFollowing.value = newStatus
    props.currentUser.isFollowing = newStatus
    props.currentUser.following = newStatus
    if (newStatus) {
      if (typeof props.currentUser.followersCount === 'number') {
        props.currentUser.followersCount += 1
      }
      if (authStore.user && typeof authStore.user.followingCount === 'number') {
        authStore.user.followingCount += 1
      }
      addToast({ message: 'Đã theo dõi người dùng', type: 'success' })
    } else {
      if (typeof props.currentUser.followersCount === 'number') {
        props.currentUser.followersCount = Math.max(0, props.currentUser.followersCount - 1)
      }
      if (authStore.user && typeof authStore.user.followingCount === 'number') {
        authStore.user.followingCount = Math.max(0, authStore.user.followingCount - 1)
      }
      addToast({ message: 'Đã hủy theo dõi', type: 'info' })
    }
  } catch (err: any) {
    addToast({ message: err.response?.data?.message || 'Không thể thực hiện thao tác', type: 'error' })
  } finally {
    isFollowLoading.value = false
  }
}

function handleMessage() {
  if (!authStore.isLoggedIn) {
    addToast({ message: 'Vui lòng đăng nhập để nhắn tin', type: 'info' })
    uiStore.openAuthModal('login')
    return
  }
  emit('message', props.currentUser.id)
}
</script>

<template>
  <div class="relative bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6">
    <!-- Cover -->
    <div class="h-40 sm:h-52 bg-primary-600 relative overflow-hidden rounded-t-2xl">
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
              {{ (currentUser.role || '').toLowerCase() === 'admin' ? '👑 Admin' : (currentUser.role || '').toLowerCase() === 'moderator' ? '🛡️ Moderator' : '👤 Member' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentUser.bio }}</p>
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-400">
            <span class="flex items-center gap-1"><Calendar :size="12" /> Tham gia {{ formatDate(currentUser.joinedAt) }}</span>
            <span v-if="currentUser.location" class="flex items-center gap-1"><MapPin :size="12" /> {{ currentUser.location }}</span>
            <span v-if="currentUser.email" class="flex items-center gap-1"><LinkIcon :size="12" /> {{ currentUser.email }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="shrink-0 mt-4 sm:mt-20 flex items-center gap-2">
          <!-- Own Profile: Edit button -->
          <template v-if="isOwnProfile">
            <button @click="router.push('/settings')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all cursor-pointer">
              <Edit3 :size="14" /> Chỉnh sửa
            </button>
          </template>

          <!-- Other's Profile: Follow + Message buttons -->
          <template v-else>
            <button
              @click="toggleFollow"
              :disabled="isFollowLoading"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                isFollowing
                  ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xs'
              ]"
            >
              <component :is="isFollowing ? UserCheck : UserPlus" :size="14" :class="{ 'animate-spin': isFollowLoading }" />
              {{ isFollowing ? 'Đang theo dõi' : 'Theo dõi' }}
            </button>

            <button
              @click="handleMessage"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all cursor-pointer"
            >
              <MessageCircle :size="14" /> Nhắn tin
            </button>

            <!-- More Menu -->
            <div ref="moreMenuRef" class="relative">
              <button
                @click.stop="showMoreMenu = !showMoreMenu"
                class="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
              >
                <MoreHorizontal :size="16" />
              </button>
              <Transition name="dropdown">
                <div v-if="showMoreMenu" class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 py-1.5 z-50">
                  <button @click="handleToggleBlockUser" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors cursor-pointer">
                    <Shield :size="14" /> {{ isBlockedUser ? 'Bỏ chặn người dùng' : 'Chặn người dùng' }}
                  </button>
                  <button @click="handleReportUser" class="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                    <Flag :size="14" /> Báo cáo
                  </button>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </div>

      <!-- Stats (clickable) -->
      <div class="flex items-center justify-center gap-8 sm:gap-14 mt-6 pt-6 border-t border-gray-200 dark:border-surface-700">
        <div class="text-center min-w-15">
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatNumber(currentUser.postsCount) }}</p>
          <p class="text-xs text-gray-400">Bài viết</p>
        </div>
        <button @click="openFollowersModal('followers')" class="text-center group cursor-pointer hover:scale-105 transition-transform min-w-15">
          <p class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{{ formatNumber(currentUser.followersCount) }}</p>
          <p class="text-xs text-gray-400 group-hover:text-primary-400 transition-colors">Followers</p>
        </button>
        <button @click="openFollowersModal('following')" class="text-center group cursor-pointer hover:scale-105 transition-transform min-w-15">
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

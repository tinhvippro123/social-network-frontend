<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import usersApi from '@/api/users.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/ui/useToast'
import { useUiStore } from '@/stores/ui.store'

const props = defineProps<{
  user: {
    id: string
    name: string
    avatar?: string
    bio?: string
    postsCount?: number
    followersCount?: number
    isFollowing?: boolean
    following?: boolean
  }
}>()

defineEmits<{
  (e: 'click'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const uiStore = useUiStore()
const isFollowing = ref(Boolean(props.user.isFollowing ?? props.user.following))
const isToggling = ref(false)

watch(() => [props.user.isFollowing, props.user.following], ([val1, val2]) => {
  isFollowing.value = Boolean(val1 ?? val2)
})

const avatarUser = computed(() => ({
  name: props.user.name,
  avatar: props.user.avatar || ''
}))

async function handleToggleFollow(e: Event) {
  e.stopPropagation()
  if (!authStore.isLoggedIn) {
    toast.info('Vui lòng đăng nhập để theo dõi tác giả')
    uiStore.openAuthModal('login')
    return
  }
  if (isToggling.value) return
  isToggling.value = true
  try {
    const res = await usersApi.toggleFollow(props.user.id)
    const nextState = typeof res.data?.data === 'boolean' ? res.data.data : !isFollowing.value
    isFollowing.value = nextState
    props.user.isFollowing = nextState
    props.user.following = nextState
    if (typeof props.user.followersCount === 'number') {
      props.user.followersCount = Math.max(0, props.user.followersCount + (nextState ? 1 : -1))
    }
    toast.success(isFollowing.value ? `Đã theo dõi ${props.user.name}` : `Đã bỏ theo dõi ${props.user.name}`)
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể thực hiện thao tác')
  } finally {
    isToggling.value = false
  }
}
</script>

<template>
  <div
    @click="$emit('click')"
    class="flex items-center gap-4 p-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/40 hover:shadow-xs cursor-pointer transition-all"
  >
    <UserAvatar :user="avatarUser" size="lg" />
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-gray-900 dark:text-white truncate">{{ user.name }}</p>
      <p class="text-sm text-gray-500 truncate">{{ user.bio || 'Thành viên VietBlog' }}</p>
      <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
        <span>{{ user.postsCount ?? 0 }} bài viết</span>
        <span>•</span>
        <span>{{ user.followersCount ?? 0 }} người theo dõi</span>
      </div>
    </div>
    <button
      v-if="user.id !== authStore.user?.id"
      @click="handleToggleFollow"
      :disabled="isToggling"
      :class="[
        'px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer',
        isFollowing
          ? 'bg-gray-100 dark:bg-surface-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-600'
          : 'text-white bg-primary-600 hover:bg-primary-700 shadow-xs'
      ]"
    >
      {{ isFollowing ? 'Đang theo dõi' : 'Theo dõi' }}
    </button>
  </div>
</template>

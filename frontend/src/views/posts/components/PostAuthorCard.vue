<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatNumber } from '@/utils/formatters'
import type { User } from '@/types'
import { useAuth } from '@/composables/auth/useAuth'
import usersApi from '@/api/users.api'
import { useToast } from '@/composables/ui/useToast'

const props = defineProps<{
  author: User | any
}>()

const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const isFollowing = ref(false)
const isFollowLoading = ref(false)
const authorPostsCount = ref<number | null>(null)
const authorFollowersCount = ref<number | null>(null)

async function fetchAuthorProfile() {
  if (!props.author?.id) return
  try {
    const res = await usersApi.getProfile(props.author.id)
    if (res.data?.success && res.data.data) {
      const p = res.data.data
      authorPostsCount.value = p.postsCount ?? 0
      authorFollowersCount.value = p.followersCount ?? 0
      isFollowing.value = Boolean((p as any).isFollowing ?? (p as any).following)
    }
  } catch (err) {
    console.warn('Could not fetch author profile details', err)
  }
}

onMounted(() => {
  fetchAuthorProfile()
})

watch(() => props.author?.id, (newId) => {
  if (newId) {
    fetchAuthorProfile()
  }
})

async function toggleFollow() {
  if (!user.value) {
    router.push('/login')
    return
  }
  if (!props.author?.id) return
  if (user.value.id === props.author.id) {
    toast.info('Bạn không thể theo dõi chính mình')
    return
  }

  isFollowLoading.value = true
  try {
    await usersApi.toggleFollow(props.author.id)
    isFollowing.value = !isFollowing.value
    if (authorFollowersCount.value !== null) {
      authorFollowersCount.value = Math.max(0, authorFollowersCount.value + (isFollowing.value ? 1 : -1))
    } else if (typeof props.author.followersCount === 'number') {
      props.author.followersCount = Math.max(0, props.author.followersCount + (isFollowing.value ? 1 : -1))
    }
    toast.success(isFollowing.value ? 'Đã theo dõi tác giả' : 'Đã hủy theo dõi')
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Thao tác không thành công')
  } finally {
    isFollowLoading.value = false
  }
}

function goToProfile() {
  if (props.author?.id) {
    router.push(`/profile/${props.author.id}`)
  }
}
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 text-center">
    <div @click="goToProfile" class="cursor-pointer group">
      <UserAvatar :user="author" size="lg" class="mx-auto ring-3 ring-primary-500/20 mb-3 group-hover:scale-105 transition-transform" />
      <h4 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{{ author?.name || 'Tác giả' }}</h4>
    </div>
    <p v-if="author?.bio" class="text-xs text-gray-400 mt-1 mb-3 line-clamp-2">{{ author.bio }}</p>
    <div class="h-2" v-else />

    <div class="flex justify-center gap-8 text-center mb-4">
      <div class="min-w-15">
        <p class="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {{ formatNumber(authorPostsCount ?? author?.postsCount ?? 0) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">Bài viết</p>
      </div>
      <div class="min-w-15">
        <p class="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {{ formatNumber(authorFollowersCount ?? author?.followersCount ?? 0) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">Followers</p>
      </div>
    </div>

    <button
      @click="toggleFollow"
      :disabled="isFollowLoading"
      :class="[
        'w-full py-2 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50',
        isFollowing
          ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-600 hover:border-red-300 hover:text-red-500 dark:hover:text-red-400'
          : 'text-white gradient-primary hover:opacity-90 shadow-lg shadow-primary-500/25'
      ]"
    >
      <span v-if="isFollowLoading" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <template v-else>
        {{ isFollowing ? '✓ Đang theo dõi' : 'Theo dõi' }}
      </template>
    </button>
  </div>
</template>

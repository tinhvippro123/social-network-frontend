<script setup lang="ts">
import { ref, computed } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import usersApi from '@/api/users.api'

const props = defineProps<{
  user: {
    id: string
    name: string
    avatar?: string
    bio?: string
    postsCount?: number
    followersCount?: number
    isFollowing?: boolean
  }
}>()

defineEmits<{
  (e: 'click'): void
}>()

const isFollowing = ref(props.user.isFollowing ?? false)
const isToggling = ref(false)

const avatarUser = computed(() => ({
  name: props.user.name,
  avatar: props.user.avatar || ''
}))

async function handleToggleFollow(e: Event) {
  e.stopPropagation()
  if (isToggling.value) return
  isToggling.value = true
  try {
    const res = await usersApi.toggleFollow(props.user.id)
    isFollowing.value = res.data?.data ?? !isFollowing.value
  } catch (err) {
    console.error('Follow toggle error:', err)
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

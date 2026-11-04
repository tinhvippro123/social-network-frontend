<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Hash, Star, Check } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useToast } from '@/composables/ui/useToast'
import usersApi from '@/api/users.api'

const props = defineProps<{
  tags: any[]
  users: any[]
  sidebarLoading: boolean
}>()

const router = useRouter()
const toast = useToast()
const followedUserIds = ref<Set<string>>(new Set())

watch(() => props.users, (list) => {
  if (!Array.isArray(list)) return
  const next = new Set<string>(followedUserIds.value)
  for (const u of list) {
    if (u?.isFollowing || u?.following) {
      next.add(u.id)
    }
  }
  followedUserIds.value = next
}, { immediate: true, deep: true })

async function toggleFollowUser(u: any) {
  try {
    const res = await usersApi.toggleFollow(u.id)
    const isNowFollowing = typeof res.data?.data === 'boolean' ? res.data.data : !followedUserIds.value.has(u.id)
    if (isNowFollowing) {
      followedUserIds.value.add(u.id)
      toast.success(`Đang theo dõi ${u.name}`)
    } else {
      followedUserIds.value.delete(u.id)
      toast.info(`Đã bỏ theo dõi ${u.name}`)
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Vui lòng đăng nhập để theo dõi tác giả')
  }
}
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0 space-y-5">
    <!-- Popular Tags -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
        <Hash :size="18" class="text-primary-500" />
        Tags phổ biến
      </h3>
      <div v-if="sidebarLoading" class="flex flex-wrap gap-2">
        <Skeleton v-for="i in 6" :key="i" type="button" class="w-20 h-8 rounded-xl" />
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <span
          v-for="tag in tags"
          :key="tag.id"
          @click="router.push('/tags/' + tag.name)"
          class="px-3 py-1.5 bg-gray-50 dark:bg-surface-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 dark:border-surface-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer border border-gray-200"
        >
          #{{ tag.name }}
        </span>
      </div>
    </div>

    <!-- Top Authors -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-4">
        <Star :size="18" class="text-amber-400" />
        Tác giả nổi bật
      </h3>
      <div v-if="sidebarLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3">
          <Skeleton type="avatar" class="w-10 h-10 shrink-0" />
          <div class="flex-1 space-y-2">
            <Skeleton type="text" class="w-24" />
            <Skeleton type="text" class="w-16" />
          </div>
          <Skeleton type="button" class="w-20 h-7 rounded-lg" />
        </div>
      </div>
      <div v-else class="space-y-4">
        <div v-for="user in users.slice(0, 3)" :key="user.id" class="flex items-center gap-3 group">
          <UserAvatar :user="user" size="md" class="cursor-pointer" @click="router.push(`/profile/${user.id}`)" />
          <div class="flex-1 min-w-0 cursor-pointer" @click="router.push(`/profile/${user.id}`)">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors truncate">
              {{ user.name }}
            </p>
            <p class="text-xs text-gray-400">{{ user.postsCount ?? 0 }} bài viết</p>
          </div>
          <button
            @click="toggleFollowUser(user)"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1',
              followedUserIds.has(user.id)
                ? 'bg-primary-500 text-white border border-primary-500'
                : 'border border-primary-500/30 text-primary-500 hover:bg-primary-500 hover:text-white'
            ]"
          >
            <Check v-if="followedUserIds.has(user.id)" :size="12" />
            {{ followedUserIds.has(user.id) ? 'Đang theo dõi' : 'Theo dõi' }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

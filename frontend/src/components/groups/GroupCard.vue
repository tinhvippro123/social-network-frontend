<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Globe, Lock, Users, Shield } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { formatNumber } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth.store'
import type { Group } from '@/types'

const props = defineProps<{
  group: Group | any
}>()

const emit = defineEmits<{
  (e: 'toggleJoin', group: Group | any): void
}>()

const router = useRouter()
const authStore = useAuthStore()

const coverFailed = ref(false)
const avatarFailed = ref(false)

watch(() => [props.group?.coverImage, props.group?.avatar], () => {
  coverFailed.value = false
  avatarFailed.value = false
})

const resolvedCover = computed(() => {
  const rawCover = props.group?.coverImage || ''
  const normalizedCover = rawCover.includes('1523050854058')
    ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
    : rawCover
  if (!coverFailed.value && normalizedCover) return normalizedCover
  if (!avatarFailed.value && props.group?.avatar) return props.group.avatar
  return ''
})

function handleCoverError() {
  if (!coverFailed.value && props.group?.coverImage) {
    coverFailed.value = true
  } else {
    avatarFailed.value = true
  }
}

const isOwner = computed(() => {
  const myId = authStore.user?.id
  if (!myId || !props.group) return false
  const role = props.group.memberRole || props.group.myRole
  return role === 'OWNER' || props.group.owner?.id === myId
})

function toggleJoin() {
  if (isOwner.value) {
    router.push(`/groups/${props.group.id}`)
    return
  }
  emit('toggleJoin', props.group)
}
</script>

<template>
  <div
    @click="router.push(`/groups/${group.id}`)"
    class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col justify-between"
  >
    <!-- Cover Banner (Facebook Group Style) -->
    <div class="relative h-36 overflow-hidden bg-gray-100 dark:bg-surface-700">
      <img
        v-if="resolvedCover"
        :src="resolvedCover"
        :alt="group.name"
        @error="handleCoverError"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="w-full h-full bg-primary-600" />
      <div class="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
      <div class="absolute top-3 right-3">
        <span
          :class="[
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm border',
            group.isPublic
              ? 'bg-primary-600/90 border-white/20 text-white'
              : 'bg-amber-600/90 border-white/20 text-white'
          ]"
        >
          <Globe v-if="group.isPublic" :size="10" />
          <Lock v-else :size="10" />
          {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1 text-base">
          {{ group.name }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
          {{ group.description || 'Chưa có mô tả cho nhóm này.' }}
        </p>
      </div>

      <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-surface-700">
        <div class="flex items-center gap-3 text-xs text-gray-400">
          <span class="flex items-center gap-1 font-medium">
            <Users :size="13" class="text-primary-500" />
            {{ formatNumber(group.membersCount) }} thành viên
          </span>
          <span>•</span>
          <span>{{ group.postsCount || 0 }} bài viết</span>
        </div>
        <span
          v-if="isOwner"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
        >
          <Shield :size="12" /> Trưởng nhóm
        </span>
        <button
          v-else
          type="button"
          @click.stop="toggleJoin"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95',
            group.isJoined
              ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
              : !group.isPublic && authStore.isLoggedIn
              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
              : 'gradient-primary text-white hover:opacity-90 shadow-2xs'
          ]"
        >
          {{ group.isJoined ? 'Đã tham gia' : (!group.isPublic && authStore.isLoggedIn ? 'Cần lời mời' : 'Tham gia') }}
        </button>
      </div>
    </div>
  </div>
</template>

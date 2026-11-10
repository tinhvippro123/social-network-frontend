<script setup lang="ts">
import { ref, watch } from 'vue'
import { Users } from '@lucide/vue'
import type { User } from '@/types'
import { useUserAvatar } from '@/composables/ui/useUserAvatar'

const props = withDefaults(defineProps<{
  user?: Pick<User, 'name' | 'avatar'> | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showRing?: boolean
  isGroup?: boolean
}>(), {
  user: null,
  size: 'md',
  showRing: false,
  isGroup: false
})

const { sizeClasses } = useUserAvatar(props)
const imageError = ref(false)

watch(() => props.user?.avatar, () => {
  imageError.value = false
})

// Palette màu pastel đẹp mắt dựa vào tên
function getInitialsColor(name?: string) {
  const colors = [
    'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  ]
  if (!name) return colors[0]
  let sum = 0
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i)
  }
  return colors[sum % colors.length]
}
</script>

<template>
  <!-- 1. Ảnh hợp lệ và chưa bị lỗi -->
  <img
    v-if="user?.avatar && !imageError"
    :src="user.avatar"
    :alt="user?.name || 'Avatar'"
    @error="imageError = true"
    :class="[
      'rounded-full object-cover bg-gray-100 dark:bg-surface-700 shrink-0',
      sizeClasses,
      showRing ? 'ring-2 ring-white dark:ring-surface-800' : ''
    ]"
  />

  <!-- 2. Fallback cho nhóm nếu isGroup -->
  <div
    v-else-if="isGroup"
    :class="[
      'rounded-full flex! items-center justify-center shrink-0 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300',
      sizeClasses,
      showRing ? 'ring-2 ring-white dark:ring-surface-800' : ''
    ]"
  >
    <Users :size="size === 'sm' ? 12 : size === 'lg' ? 24 : 16" />
  </div>

  <!-- 3. Fallback cho người dùng: chữ cái đầu với màu pastel -->
  <div
    v-else
    :class="[
      'rounded-full flex! items-center justify-center text-center font-bold leading-none select-none shrink-0',
      sizeClasses,
      getInitialsColor(user?.name),
      showRing ? 'ring-2 ring-white dark:ring-surface-800' : ''
    ]"
  >
    <span class="inline-flex items-center justify-center leading-none">{{ (user?.name || '?').trim().charAt(0).toUpperCase() }}</span>
  </div>
</template>

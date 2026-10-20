<script setup lang="ts">
import { Globe, Lock, Users } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { formatNumber } from '@/utils/formatters'
import type { Group } from '@/types'

const props = defineProps<{
  group: Group | any
}>()

const emit = defineEmits<{
  (e: 'toggleJoin', group: Group | any): void
}>()

const router = useRouter()

function toggleJoin() {
  emit('toggleJoin', props.group)
}
</script>

<template>
  <div
    @click="router.push(`/groups/${group.id}`)"
    class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col justify-between"
  >
    <!-- Cover Banner (Facebook Group Style) -->
    <div class="relative h-36 overflow-hidden bg-gray-100 dark:bg-surface-700">
      <img
        v-if="group.coverImage"
        :src="group.coverImage"
        :alt="group.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="w-full h-full bg-linear-to-r from-primary-600 to-teal-500" />
      <div class="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
      <div class="absolute top-3 right-3">
        <span
          :class="[
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm border',
            group.isPublic
              ? 'bg-emerald-500/80 border-emerald-400/40 text-white'
              : 'bg-amber-500/80 border-amber-400/40 text-white'
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
        <button
          type="button"
          @click.stop="toggleJoin"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95',
            group.isJoined
              ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
              : 'gradient-primary text-white hover:opacity-90 shadow-2xs'
          ]"
        >
          {{ group.isJoined ? 'Đã tham gia' : 'Tham gia' }}
        </button>
      </div>
    </div>
  </div>
</template>

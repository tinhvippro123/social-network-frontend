<script setup lang="ts">
import { Globe, Lock, Users } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { formatNumber } from '@/utils/formatters'
import type { Group } from '@/types'

const props = defineProps<{
  group: Group | any
}>()

const router = useRouter()
</script>

<template>
  <div
    @click="router.push(`/groups/${group.id}`)"
    class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer group"
  >
    <!-- Cover -->
    <div class="relative h-32 overflow-hidden rounded-t-2xl">
      <img :src="group.coverImage" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
      <div class="absolute top-3 right-3">
        <span :class="[
          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm',
          group.isPublic ? 'bg-green-500/80 text-white' : 'bg-amber-500/80 text-white'
        ]">
          <Globe v-if="group.isPublic" :size="10" />
          <Lock v-else :size="10" />
          {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <div class="flex items-start gap-3 -mt-10 relative z-10">
        <img :src="group.avatar" class="w-14 h-14 object-cover rounded-xl ring-4 ring-white dark:ring-surface-800 shrink-0 bg-gray-100 dark:bg-surface-700" />
        <div class="pt-7">
          <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1">
            {{ group.name }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ group.description }}</p>
        </div>
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-surface-700">
        <div class="flex items-center gap-4 text-xs text-gray-400">
          <span class="flex items-center gap-1">
            <Users :size="12" />
            {{ formatNumber(group.membersCount) }} thành viên
          </span>
          <span>{{ group.postsCount }} bài viết</span>
        </div>
        <button
          @click.stop
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
            group.isJoined
              ? 'bg-gray-100 dark:bg-surface-700 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10'
              : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white'
          ]"
        >
          {{ group.isJoined ? 'Đã tham gia' : 'Tham gia' }}
        </button>
      </div>
    </div>
  </div>
</template>

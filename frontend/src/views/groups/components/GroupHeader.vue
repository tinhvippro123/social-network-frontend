<script setup lang="ts">
import { Users, FileText, Globe, Lock, Check } from '@lucide/vue'

defineProps<{
  group: any
}>()

const emit = defineEmits<{
  (e: 'toggleJoin'): void
  (e: 'switchTab', tab: 'posts' | 'members' | 'about'): void
}>()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6 overflow-hidden shadow-xs">
    <!-- Group Cover Banner (Facebook Group Style) -->
    <div class="h-52 sm:h-64 relative overflow-hidden bg-gray-100 dark:bg-surface-700">
      <img
        v-if="group.coverImage"
        :src="group.coverImage"
        :alt="group.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-linear-to-r from-primary-600 to-teal-500" />
      <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      
      <!-- Privacy Badge overlaid on banner top-right -->
      <div class="absolute top-4 right-4">
        <span
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-md border',
            group.isPublic
              ? 'bg-emerald-500/80 border-emerald-400/40 text-white'
              : 'bg-amber-500/80 border-amber-400/40 text-white'
          ]"
        >
          <Globe v-if="group.isPublic" :size="12" />
          <Lock v-else :size="12" />
          {{ group.isPublic ? 'Nhóm công khai' : 'Nhóm riêng tư' }}
        </span>
      </div>
    </div>

    <!-- Group Information Bar -->
    <div class="p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Title & Description -->
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {{ group.name }}
          </h1>
          <p v-if="group.description" class="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed max-w-3xl">
            {{ group.description }}
          </p>

          <!-- Group Meta Stats (Clickable) -->
          <div class="flex items-center gap-6 mt-4 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            <button
              type="button"
              @click="emit('switchTab', 'members')"
              class="flex items-center gap-1.5 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer group/stat"
              title="Xem danh sách thành viên"
            >
              <Users :size="16" class="text-primary-500 group-hover/stat:scale-110 transition-transform" />
              <strong class="text-gray-800 dark:text-gray-200 group-hover/stat:underline">{{ Number(group.membersCount || 0).toLocaleString() }}</strong> thành viên
            </button>
            <button
              type="button"
              @click="emit('switchTab', 'posts')"
              class="flex items-center gap-1.5 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer group/stat"
              title="Xem danh sách bài viết"
            >
              <FileText :size="16" class="text-primary-500 group-hover/stat:scale-110 transition-transform" />
              <strong class="text-gray-800 dark:text-gray-200 group-hover/stat:underline">{{ group.postsCount || 0 }}</strong> bài viết
            </button>
          </div>
        </div>

        <!-- Join/Leave Action Button -->
        <div class="shrink-0 flex items-center gap-3">
          <button
            @click="emit('toggleJoin')"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer',
              group.isJoined
                ? 'bg-gray-100 dark:bg-surface-700 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-gray-200 dark:border-surface-600'
                : 'gradient-primary text-white hover:opacity-90 shadow-md shadow-primary-500/20'
            ]"
          >
            <Check v-if="group.isJoined" :size="16" class="stroke-3" />
            <span>{{ group.isJoined ? 'Đã tham gia' : 'Tham gia nhóm' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Camera, Save } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useSettings } from '@/composables/ui/useSettings'

const { user, profileForm } = useSettings()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 animate-fade-in">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
      <User :size="20" class="text-primary-500" />
      Thông tin cá nhân
    </h2>

    <!-- Avatar -->
    <div class="flex items-center gap-5 mb-8">
      <div class="relative group">
        <UserAvatar v-if="user" :user="user" size="xl" />
        <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          <Camera :size="20" class="text-white" />
        </div>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Ảnh đại diện</p>
        <p class="text-xs text-gray-400 mt-0.5">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
        <button class="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
          Thay đổi
        </button>
      </div>
    </div>

    <!-- Form Fields -->
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên hiển thị</label>
        <input v-model="profileForm.name" type="text"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Giới thiệu bản thân</label>
        <textarea v-model="profileForm.bio" rows="3"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none resize-none transition-all"
          placeholder="Viết gì đó về bạn..." />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
        <input v-model="profileForm.email" type="email"
          class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" />
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
        <Save :size="16" /> Lưu thay đổi
      </button>
    </div>
  </div>
</template>

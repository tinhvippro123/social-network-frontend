<script setup lang="ts">
import { ref } from 'vue'
import { User, Camera, Save, Loader2 } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useSettings } from '@/composables/ui/useSettings'

const { user, profileForm, isSaving, isUploadingAvatar, uploadAvatar, saveProfile } = useSettings()

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerAvatarSelect() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadAvatar(file)
    target.value = ''
  }
}
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 animate-fade-in">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
      <User :size="20" class="text-primary-500" />
      Thông tin cá nhân
    </h2>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Avatar -->
    <div class="flex items-center gap-5 mb-8">
      <div class="relative group cursor-pointer" @click="triggerAvatarSelect">
        <UserAvatar
          :user="{ name: profileForm.name || user?.name || '', avatar: profileForm.avatar || user?.avatar || '' }"
          size="xl"
        />
        <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Loader2 v-if="isUploadingAvatar" :size="20" class="text-white animate-spin" />
          <Camera v-else :size="20" class="text-white" />
        </div>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Ảnh đại diện</p>
        <p class="text-xs text-gray-400 mt-0.5">JPG, PNG hoặc GIF. Tối đa 5MB.</p>
        <button
          type="button"
          :disabled="isUploadingAvatar"
          @click="triggerAvatarSelect"
          class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors disabled:opacity-50"
        >
          <Loader2 v-if="isUploadingAvatar" :size="12" class="animate-spin" />
          {{ isUploadingAvatar ? 'Đang tải lên...' : 'Thay đổi' }}
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
        <input :value="profileForm.email || ''" type="email" disabled
          class="w-full px-4 py-2.5 bg-gray-100 dark:bg-surface-900 border border-gray-200 dark:border-surface-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none transition-all" />
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <button
        type="button"
        :disabled="isSaving || isUploadingAvatar"
        @click="saveProfile"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
      >
        <Loader2 v-if="isSaving" :size="16" class="animate-spin" />
        <Save v-else :size="16" />
        {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
      </button>
    </div>
  </div>
</template>

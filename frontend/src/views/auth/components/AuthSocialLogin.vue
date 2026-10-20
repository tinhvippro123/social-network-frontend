<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'
import { useToast } from '@/composables/ui/useToast'
import { useUiStore } from '@/stores/ui.store'

const { loginWithGoogle } = useAuth()
const toast = useToast()
const uiStore = useUiStore()
const isGoogleLoading = ref(false)

function handleGoogleLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    toast.error('Chưa cấu hình Google Client ID')
    return
  }

  // @ts-ignore
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    try {
      // @ts-ignore
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (response: any) => {
          if (response?.error) {
            console.error('Google OAuth error:', response)
            toast.error('Đăng nhập Google thất bại hoặc đã bị hủy')
            return
          }
          if (response?.access_token) {
            isGoogleLoading.value = true
            try {
              await loginWithGoogle({ accessToken: response.access_token })
              uiStore.closeAuthModal()
              toast.success('Đăng nhập bằng Google thành công!')
            } catch (err: any) {
              toast.error(err?.response?.data?.message || 'Đăng nhập Google không thành công')
            } finally {
              isGoogleLoading.value = false
            }
          }
        },
      })
      client.requestAccessToken()
    } catch (e: any) {
      console.error('Error initializing Google token client:', e)
      toast.error('Không thể mở cửa sổ đăng nhập Google')
    }
  } else {
    toast.info('Đang tải tiện ích Google, vui lòng thử lại sau vài giây...')
  }
}

function handleGithubLogin() {
  toast.info('Tính năng đăng nhập qua GitHub đang được cập nhật')
}
</script>

<template>
  <div>
    <!-- Divider -->
    <div class="flex items-center gap-4 my-6">
      <div class="flex-1 h-px bg-gray-200 dark:bg-white/10" />
      <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">HOẶC TIẾP TỤC VỚI</span>
      <div class="flex-1 h-px bg-gray-200 dark:bg-white/10" />
    </div>

    <!-- Social Login -->
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        @click="handleGoogleLogin"
        :disabled="isGoogleLoading"
        class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
      >
        <span v-if="isGoogleLoading" class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <template v-else>
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Google</span>
        </template>
      </button>

      <button
        type="button"
        @click="handleGithubLogin"
        class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all text-sm font-medium shadow-xs cursor-pointer"
      >
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>
        </svg>
        <span>GitHub</span>
      </button>
    </div>
  </div>
</template>

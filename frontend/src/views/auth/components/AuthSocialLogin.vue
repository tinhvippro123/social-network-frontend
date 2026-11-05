<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'
import { useToast } from '@/composables/ui/useToast'
import { useUiStore } from '@/stores/ui.store'

const { loginWithGoogle, isLoggedIn, error: authError } = useAuth()
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
              if (isLoggedIn.value) {
                uiStore.closeAuthModal()
                toast.success('Đăng nhập bằng Google thành công!')
              } else {
                toast.error(authError.value || 'Đăng nhập Google không thành công')
              }
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
    <div>
      <button
        type="button"
        @click="handleGoogleLogin"
        :disabled="isGoogleLoading"
        class="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
      >
        <span v-if="isGoogleLoading" class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <template v-else>
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Đăng nhập bằng Google</span>
        </template>
      </button>
    </div>
  </div>
</template>

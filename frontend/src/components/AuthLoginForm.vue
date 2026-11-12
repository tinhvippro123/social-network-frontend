<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useToast } from '@/composables/ui/useToast'
import authApi from '@/api/auth.api'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const toast = useToast()

const savedRememberedEmail = typeof window !== 'undefined' ? localStorage.getItem('vb_remember_email') || '' : ''
const email = ref(savedRememberedEmail)
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')

defineProps<{
  error?: string
}>()

const emitError = defineEmits<{
  (e: 'update:error', value: string): void
}>()

function validateLogin(): boolean {
  let valid = true
  emailError.value = ''
  passwordError.value = ''

  if (!email.value) {
    emailError.value = 'Vui lòng nhập email'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Email không hợp lệ'
    valid = false
  }

  if (!password.value) {
    passwordError.value = 'Vui lòng nhập mật khẩu'
    valid = false
  } else if (password.value.length < 8) {
    passwordError.value = 'Mật khẩu phải có ít nhất 8 ký tự'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validateLogin()) return
  
  isLoading.value = true
  emitError('update:error', '')

  try {
    const { data } = await authApi.login({
      email: email.value.trim(),
      password: password.value
    })
    authStore.setUser(data.data.user)
    const pendingRedirect = uiStore.consumeAuthRedirect()
    uiStore.closeAuthModal()
    toast.success(`Chào mừng trở lại, ${data.data.user?.name || 'bạn'}!`)
    const role = (data.data.user?.role || '').toLowerCase()
    if (pendingRedirect) {
      router.push(pendingRedirect)
    } else if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'moderator') {
      router.push('/admin/moderation')
    }
  } catch (err: any) {
    emitError('update:error', err.response?.data?.message || 'Email hoặc mật khẩu không chính xác')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin" class="px-6 pb-3 space-y-3">
    <!-- Email -->
    <div>
      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
      <div class="relative">
        <Mail :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="email"
          type="email"
          placeholder="name@example.com"
          :class="[
            'w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
            emailError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/40 focus:border-primary-500'
          ]"
        />
      </div>
      <p v-if="emailError" class="mt-1 text-xs text-red-500 dark:text-red-400">{{ emailError }}</p>
    </div>

    <!-- Password -->
    <div>
      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
      <div class="relative">
        <Lock :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          :class="[
            'w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
            passwordError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/40 focus:border-primary-500'
          ]"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <EyeOff v-if="showPassword" :size="16" />
          <Eye v-else :size="16" />
        </button>
      </div>
      <p v-if="passwordError" class="mt-1 text-xs text-red-500 dark:text-red-400">{{ passwordError }}</p>
    </div>

    <!-- Forgot password link -->
    <div class="flex items-center justify-end">
      <button
        type="button"
        @click="uiStore.closeAuthModal(); router.push('/forgot-password')"
        class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium cursor-pointer"
      >
        Quên mật khẩu?
      </button>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
    >
      <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <template v-else>
        Đăng nhập
        <ArrowRight :size="16" />
      </template>
    </button>
  </form>
</template>

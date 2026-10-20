<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import authApi from '@/api/auth.api'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')

const emit = defineProps<{
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
  } else if (password.value.length < 6) {
    passwordError.value = 'Mật khẩu phải có ít nhất 6 ký tự'
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
    authStore.setToken(data.data.accessToken)
    authStore.setUser(data.data.user)
    uiStore.closeAuthModal()
  } catch (err: any) {
    emitError('update:error', err.response?.data?.message || 'Email hoặc mật khẩu không chính xác')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin" class="px-8 pb-8 space-y-4">
    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
      <div class="relative">
        <Mail :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="email"
          type="email"
          placeholder="name@example.com"
          :class="[
            'w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
            emailError ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
          ]"
        />
      </div>
      <p v-if="emailError" class="mt-1.5 text-xs text-red-400">{{ emailError }}</p>
    </div>

    <!-- Password -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
      <div class="relative">
        <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          :class="[
            'w-full pl-11 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
            passwordError ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
          ]"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <EyeOff v-if="showPassword" :size="18" />
          <Eye v-else :size="18" />
        </button>
      </div>
      <p v-if="passwordError" class="mt-1.5 text-xs text-red-400">{{ passwordError }}</p>
    </div>

    <!-- Forgot password link -->
    <div class="flex items-center justify-end">
      <button
        type="button"
        @click="uiStore.closeAuthModal(); router.push('/forgot-password')"
        class="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
      >
        Quên mật khẩu?
      </button>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
    >
      <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <template v-else>
        Đăng nhập
        <ArrowRight :size="18" />
      </template>
    </button>
  </form>
</template>

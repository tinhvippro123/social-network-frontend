<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

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

  // Mock login - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const mockUser = {
    id: 'u1',
    name: 'Lê Thanh Tính',
    email: email.value,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=LTT',
    bio: 'Full-stack developer | Vue.js & Spring Boot enthusiast',
    role: email.value.includes('admin') ? 'admin' as const : 'user' as const,
    joinedAt: '2026-08-24T00:00:00Z',
    postsCount: 12,
    followersCount: 156,
    followingCount: 42
  }

  authStore.setToken('mock-jwt-token-' + Date.now())
  authStore.setUser(mockUser)
  
  isLoading.value = false
  uiStore.closeAuthModal()
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

    <!-- Login hint -->
    <p class="text-xs text-gray-500 bg-surface-700/50 rounded-lg px-3 py-2">
      💡 Demo: Nhập email bất kỳ + mật khẩu >= 6 ký tự. Dùng email có chữ "admin" để vào trang quản trị.
    </p>

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

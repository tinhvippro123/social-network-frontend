<script setup lang="ts">
import { Mail, Lock, Eye, EyeOff, ArrowRight } from '@lucide/vue'
import { useLogin } from '@/composables/useLogin'

const {
  email,
  emailError,
  password,
  passwordError,
  showPassword,
  isLoading,
  rememberMe,
  handleLogin
} = useLogin()
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-1">Chào mừng trở lại</h2>
    <p class="text-gray-400 text-sm mb-8">Đăng nhập để tiếp tục hành trình của bạn</p>

    <form @submit.prevent="handleLogin" class="space-y-5">
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
        <p v-if="emailError" class="mt-1.5 text-sm text-red-500">{{ emailError }}</p>
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
        <p v-if="passwordError" class="mt-1.5 text-sm text-red-500">{{ passwordError }}</p>
      </div>

      <!-- Remember + Forgot -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/30"
          />
          <span class="text-sm text-gray-400">Ghi nhớ đăng nhập</span>
        </label>
        <a href="#" class="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
          Quên mật khẩu?
        </a>
      </div>

      <!-- Login Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-500/25 disabled:opacity-50"
      >
        <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <template v-else>
          Đăng nhập
          <ArrowRight :size="18" />
        </template>
      </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center gap-4 my-6">
      <div class="flex-1 h-px bg-white/10" />
      <span class="text-xs text-gray-500">HOẶC</span>
      <div class="flex-1 h-px bg-white/10" />
    </div>

    <!-- Social Login -->
    <div class="grid grid-cols-2 gap-3">
      <button class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all text-sm font-medium">
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"/></svg>
        Google
      </button>
      <button class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all text-sm font-medium">
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
        GitHub
      </button>
    </div>

    <!-- Register link -->
    <p class="text-center text-sm text-gray-400 mt-6">
      Chưa có tài khoản?
      <router-link to="/register" class="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
        Đăng ký ngay
      </router-link>
    </p>
  </div>
</template>

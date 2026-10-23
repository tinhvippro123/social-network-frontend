<script setup lang="ts">
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, User } from '@lucide/vue'
import AuthSocialLogin from './components/AuthSocialLogin.vue'
import { useLogin } from '@/composables/auth/useLogin'

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

function fillDemo(role: 'admin' | 'user') {
  if (role === 'admin') {
    email.value = 'admin@vietblog.com'
    password.value = 'Password123!'
  } else {
    email.value = 'nguyenvanan@gmail.com'
    password.value = 'Password123!'
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Chào mừng trở lại</h2>
    <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">Đăng nhập để tiếp tục hành trình của bạn</p>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
        <div class="relative">
          <Mail :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="email"
            type="email"
            placeholder="name@example.com"
            :class="[
              'w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
              emailError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
            ]"
          />
        </div>
        <p v-if="emailError" class="mt-1.5 text-sm text-red-500">{{ emailError }}</p>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu</label>
        <div class="relative">
          <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :class="[
              'w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
              passwordError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
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
            class="w-4 h-4 rounded border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-primary-500 focus:ring-primary-500/30"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">Ghi nhớ đăng nhập</span>
        </label>
        <router-link to="/forgot-password" class="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors font-medium">
          Quên mật khẩu?
        </router-link>
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

    <!-- Quick Demo Accounts -->
    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Tài khoản demo sẵn (Bấm để điền nhanh):</div>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="fillDemo('admin')"
          class="p-2.5 rounded-xl text-left border border-purple-200 dark:border-purple-800/40 bg-purple-50/60 dark:bg-purple-950/20 hover:bg-purple-100/80 transition-colors"
        >
          <div class="font-semibold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
            <ShieldCheck :size="13" />
            <span>Quản trị viên (Admin)</span>
          </div>
          <div class="text-[11px] text-gray-500 font-mono mt-0.5 truncate">admin@vietblog.com</div>
        </button>

        <button
          type="button"
          @click="fillDemo('user')"
          class="p-2.5 rounded-xl text-left border border-blue-200 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/80 transition-colors"
        >
          <div class="font-semibold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <User :size="13" />
            <span>Người dùng (User)</span>
          </div>
          <div class="text-[11px] text-gray-500 font-mono mt-0.5 truncate">nguyenvanan@gmail.com</div>
        </button>
      </div>
    </div>

    <!-- Social Login -->
    <AuthSocialLogin />

    <!-- Register link -->
    <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
      Chưa có tài khoản?
      <router-link to="/register" class="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold transition-colors">
        Đăng ký ngay
      </router-link>
    </p>
  </div>
</template>

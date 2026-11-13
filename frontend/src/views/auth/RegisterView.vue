<script setup lang="ts">
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from '@lucide/vue'
import AuthSocialLogin from './components/AuthSocialLogin.vue'
import AuthPasswordStrength from '@/components/AuthPasswordStrength.vue'
import EmailVerificationPanel from '@/components/EmailVerificationPanel.vue'
import { useRegister } from '@/composables/auth/useRegister'
import { useToast } from '@/composables/ui/useToast'

const toast = useToast()

const {
  name,
  nameError,
  email,
  emailError,
  password,
  passwordError,
  confirmPassword,
  confirmPasswordError,
  showPassword,
  isLoading,
  agreeTerms,
  verificationEmail,
  handleRegister,
  handleVerified,
  cancelVerification,
} = useRegister()

function showTermsNotice(title: string) {
  toast.info(`${title}: Người dùng VietBlog cam kết chia sẻ nội dung văn minh, tôn trọng bản quyền và bảo mật thông tin cá nhân.`)
}
</script>

<template>
  <div>
    <template v-if="verificationEmail">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-0.5">Xác thực email</h2>
      <p class="text-gray-500 dark:text-gray-400 text-xs mb-4">Nhập mã OTP đã gửi về hộp thư của bạn để kích hoạt tài khoản</p>

      <EmailVerificationPanel
        :email="verificationEmail"
        back-label="Quay lại sửa thông tin"
        @verified="handleVerified"
        @back="cancelVerification"
      />
    </template>

    <template v-else>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-0.5">Tạo tài khoản mới</h2>
      <p class="text-gray-500 dark:text-gray-400 text-xs mb-4">Tham gia cộng đồng VietBlog ngay hôm nay</p>

      <form @submit.prevent="handleRegister" class="space-y-2.5">
      <!-- Name -->
      <div>
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
        <div class="relative">
          <User :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="name"
            type="text"
            placeholder="Nguyễn Văn A"
            :class="[
              'w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
              nameError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
            ]"
          />
        </div>
        <p v-if="nameError" class="mt-1 text-xs text-red-500">{{ nameError }}</p>
      </div>

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
              'w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
              emailError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
            ]"
          />
        </div>
        <p v-if="emailError" class="mt-1 text-xs text-red-500">{{ emailError }}</p>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
        <div class="relative">
          <Lock :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Tối thiểu 8 ký tự"
            :class="[
              'w-full pl-10 pr-10 py-2 text-sm bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
              passwordError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
            ]"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <EyeOff v-if="showPassword" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
        <p v-if="passwordError" class="mt-1 text-xs text-red-500">{{ passwordError }}</p>
        <!-- Password strength indicator -->
        <AuthPasswordStrength :password="password" />
      </div>

      <!-- Confirm Password -->
      <div>
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Xác nhận mật khẩu</label>
        <div class="relative">
          <Lock :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Nhập lại mật khẩu"
            :class="[
              'w-full pl-10 pr-10 py-2 text-sm bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
              confirmPasswordError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
            ]"
          />
          <Check
            v-if="confirmPassword && confirmPassword === password && !confirmPasswordError"
            :size="16"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400"
          />
        </div>
        <p v-if="confirmPasswordError" class="mt-1 text-xs text-red-500">{{ confirmPasswordError }}</p>
      </div>

      <!-- Terms -->
      <label class="flex items-start gap-2.5 pt-0.5 cursor-pointer">
        <input
          v-model="agreeTerms"
          type="checkbox"
          class="w-4 h-4 rounded border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-primary-500 focus:ring-primary-500/30 mt-0.5"
        />
        <span class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          Tôi đồng ý với
          <button type="button" @click.stop="showTermsNotice('Điều khoản sử dụng')" class="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 underline cursor-pointer">Điều khoản sử dụng</button>
          và
          <button type="button" @click.stop="showTermsNotice('Chính sách bảo mật')" class="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 underline cursor-pointer">Chính sách bảo mật</button>
        </span>
      </label>

      <!-- Register Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-xs disabled:opacity-50 cursor-pointer"
      >
        <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <template v-else>
          Tạo tài khoản
          <ArrowRight :size="16" />
        </template>
      </button>
    </form>

    <!-- Social Login -->
    <AuthSocialLogin />

      <!-- Login link -->
      <p class="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
        Đã có tài khoản?
        <router-link to="/login" class="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold transition-colors">
          Đăng nhập
        </router-link>
      </p>
    </template>
  </div>
</template>

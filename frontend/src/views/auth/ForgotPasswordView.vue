<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, KeyRound, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from '@lucide/vue'
import authApi from '@/api/auth.api'
import { useToast } from '@/composables/ui/useToast'

const router = useRouter()
const toast = useToast()

const step = ref<1 | 2 | 3>(1)
const email = ref('')
const otpOrToken = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

const emailError = ref('')
const passwordError = ref('')
const tokenError = ref('')

// Bước 1: Gửi yêu cầu quên mật khẩu
async function handleSendOtp() {
  emailError.value = ''
  if (!email.value || !email.value.includes('@')) {
    emailError.value = 'Vui lòng nhập địa chỉ email hợp lệ'
    return
  }

  isLoading.value = true
  try {
    const res = await authApi.forgotPassword({ email: email.value.trim() })
    const data = res.data?.data
    if (data?.otp) {
      otpOrToken.value = data.otp
    } else if (data?.resetToken) {
      otpOrToken.value = data.resetToken
    }
    toast.success('Mã xác nhận đã được tạo thành công!')
    step.value = 2
  } catch (err: any) {
    emailError.value = err.response?.data?.message || 'Không tìm thấy tài khoản với email này'
  } finally {
    isLoading.value = false
  }
}

// Bước 2: Đặt lại mật khẩu mới
async function handleResetPassword() {
  tokenError.value = ''
  passwordError.value = ''

  if (!otpOrToken.value.trim()) {
    tokenError.value = 'Vui lòng nhập mã xác nhận hoặc token'
    return
  }

  if (!newPassword.value || newPassword.value.length < 8) {
    passwordError.value = 'Mật khẩu mới phải có ít nhất 8 ký tự'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  isLoading.value = true
  try {
    await authApi.resetPassword({
      token: otpOrToken.value.trim(),
      newPassword: newPassword.value
    })
    toast.success('Đặt lại mật khẩu thành công!')
    step.value = 3
  } catch (err: any) {
    tokenError.value = err.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Bước 1: Nhập email -->
    <template v-if="step === 1">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Quên mật khẩu?</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Đừng lo lắng, hãy nhập email đã đăng ký tài khoản để nhận mã đặt lại mật khẩu.
      </p>

      <form @submit.prevent="handleSendOtp" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email tài khoản</label>
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

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-500/25 disabled:opacity-50"
        >
          <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <template v-else>
            Gửi mã xác nhận
            <ArrowRight :size="18" />
          </template>
        </button>
      </form>
    </template>

    <!-- Bước 2: Nhập mã xác nhận & Mật khẩu mới -->
    <template v-else-if="step === 2">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Đặt lại mật khẩu</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
        Nhập mã xác nhận được cấp cho email <span class="font-semibold text-primary-500">{{ email }}</span>
      </p>

      <!-- Demo helper badge -->
      <div class="mb-5 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 text-xs text-primary-700 dark:text-primary-300 flex items-center justify-between">
        <span>💡 Mã xác thực (OTP): <strong class="font-mono text-sm">{{ otpOrToken }}</strong></span>
        <span class="text-[11px] opacity-75">Hiệu lực 15 phút</span>
      </div>

      <form @submit.prevent="handleResetPassword" class="space-y-4">
        <!-- OTP / Token -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mã xác nhận (OTP)</label>
          <div class="relative">
            <KeyRound :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="otpOrToken"
              type="text"
              placeholder="Nhập mã 6 số hoặc token"
              :class="[
                'w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border rounded-xl font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
                tokenError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
              ]"
            />
          </div>
          <p v-if="tokenError" class="mt-1.5 text-sm text-red-500">{{ tokenError }}</p>
        </div>

        <!-- Mật khẩu mới -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
          <div class="relative">
            <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Tối thiểu 8 ký tự"
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
        </div>

        <!-- Xác nhận mật khẩu mới -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu mới</label>
          <div class="relative">
            <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Nhập lại mật khẩu mới"
              :class="[
                'w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
                passwordError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
              ]"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <EyeOff v-if="showConfirmPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
          <p v-if="passwordError" class="mt-1.5 text-sm text-red-500">{{ passwordError }}</p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-500/25 disabled:opacity-50"
        >
          <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <template v-else>
            Cập nhật mật khẩu
            <ArrowRight :size="18" />
          </template>
        </button>

        <div class="text-center pt-2">
          <button
            type="button"
            @click="handleSendOtp"
            class="text-xs text-primary-500 hover:underline font-medium"
          >
            Chưa nhận được mã? Gửi lại
          </button>
        </div>
      </form>
    </template>

    <!-- Bước 3: Đổi mật khẩu thành công -->
    <template v-else-if="step === 3">
      <div class="text-center py-4">
        <div class="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle2 :size="36" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thành công!</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Mật khẩu của bạn đã được cập nhật thành công. Hãy sử dụng mật khẩu mới để đăng nhập vào hệ thống.
        </p>

        <router-link
          to="/login"
          class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-500/25"
        >
          Đăng nhập ngay
          <ArrowRight :size="18" />
        </router-link>
      </div>
    </template>

    <!-- Quay lại đăng nhập -->
    <p v-if="step !== 3" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
      <router-link to="/login" class="inline-flex items-center gap-1.5 text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold transition-colors">
        <ArrowLeft :size="16" />
        Quay lại đăng nhập
      </router-link>
    </p>
  </div>
</template>

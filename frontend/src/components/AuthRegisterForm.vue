<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Check } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import AuthPasswordStrength from './AuthPasswordStrength.vue'
import authApi from '@/api/auth.api'
import { useToast } from '@/composables/ui/useToast'

const toast = useToast()

const authStore = useAuthStore()
const uiStore = useUiStore()

const email = ref('')
const password = ref('')
const name = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const agreeTerms = ref(false)

const emailError = ref('')
const passwordError = ref('')
const nameError = ref('')
const confirmPasswordError = ref('')

defineProps<{
  error?: string
}>()

const emitError = defineEmits<{
  (e: 'update:error', value: string): void
}>()

function showTermsNotice(docName: string) {
  toast.info(
    `${docName}: Cam kết chia sẻ nội dung văn minh, tôn trọng bản quyền và bảo mật dữ liệu cá nhân trên VietBlog.`
  )
}

function validateRegister(): boolean {
  let valid = true
  emailError.value = ''
  passwordError.value = ''
  nameError.value = ''
  confirmPasswordError.value = ''

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

  if (!name.value.trim()) {
    nameError.value = 'Vui lòng nhập họ tên'
    valid = false
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Vui lòng xác nhận mật khẩu'
    valid = false
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Mật khẩu xác nhận không khớp'
    valid = false
  }

  return valid
}

async function handleRegister() {
  if (!validateRegister()) return
  if (!agreeTerms.value) {
    emitError('update:error', 'Vui lòng đồng ý với Điều khoản sử dụng')
    return
  }

  isLoading.value = true
  emitError('update:error', '')

  try {
    // 1. Tạo tài khoản thật trên Backend
    await authApi.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      passwordConfirm: confirmPassword.value
    })

    // 2. Đăng nhập luôn bằng tài khoản vừa tạo để người dùng không phải nhập lại
    const { data } = await authApi.login({
      email: email.value.trim(),
      password: password.value
    })
    authStore.setUser(data.data.user)
    uiStore.closeAuthModal()
    toast.success(`Chào mừng ${data.data.user?.name || name.value.trim()} đến với VietBlog!`)
  } catch (err: any) {
    emitError('update:error', err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleRegister" class="px-8 pb-8 space-y-4">
    <!-- Name -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">Họ và tên</label>
      <div class="relative">
        <User :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="name"
          type="text"
          placeholder="Nguyễn Văn A"
          :class="[
            'w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
            nameError ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
          ]"
        />
      </div>
      <p v-if="nameError" class="mt-1.5 text-xs text-red-400">{{ nameError }}</p>
    </div>

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
          placeholder="Tối thiểu 8 ký tự"
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
      <!-- Password strength -->
      <AuthPasswordStrength :password="password" />
    </div>

    <!-- Confirm Password -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">Xác nhận mật khẩu</label>
      <div class="relative">
        <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Nhập lại mật khẩu"
          :class="[
            'w-full pl-11 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
            confirmPasswordError ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary-500/50 focus:border-primary-500/50'
          ]"
        />
        <Check
          v-if="confirmPassword && confirmPassword === password && !confirmPasswordError"
          :size="18"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
        />
      </div>
      <p v-if="confirmPasswordError" class="mt-1.5 text-xs text-red-400">{{ confirmPasswordError }}</p>
    </div>

    <!-- Terms -->
    <label class="flex items-start gap-3 cursor-pointer">
      <input
        v-model="agreeTerms"
        type="checkbox"
        class="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/30 mt-0.5"
      />
      <span class="text-sm text-gray-400">
        Tôi đồng ý với
        <button type="button" @click.stop="showTermsNotice('Điều khoản sử dụng')" class="text-primary-400 hover:text-primary-300 underline">Điều khoản sử dụng</button>
        và
        <button type="button" @click.stop="showTermsNotice('Chính sách bảo mật')" class="text-primary-400 hover:text-primary-300 underline">Chính sách bảo mật</button>
      </span>
    </label>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="isLoading || !agreeTerms"
      class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
    >
      <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <template v-else>
        Tạo tài khoản
        <ArrowRight :size="18" />
      </template>
    </button>
  </form>
</template>

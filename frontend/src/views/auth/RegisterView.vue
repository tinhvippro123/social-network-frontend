<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from '@lucide/vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

const router = useRouter()
const showPassword = ref(false)
const isLoading = ref(false)
const agreeTerms = ref(false)

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Vui lòng nhập họ tên'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu').min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  })
)

const { handleSubmit } = useForm({
  validationSchema: schema,
})

const { value: name, errorMessage: nameError } = useField<string>('name')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')

const passwordStrength = ref(0)
const watchPassword = (val: string) => {
  let strength = 0
  if (val.length >= 8) strength++
  if (/[A-Z]/.test(val)) strength++
  if (/[0-9]/.test(val)) strength++
  if (/[^A-Za-z0-9]/.test(val)) strength++
  passwordStrength.value = strength
}

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh']

const handleRegister = handleSubmit(async (values) => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    router.push('/')
  }, 1500)
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-1">Tạo tài khoản mới</h2>
    <p class="text-gray-400 text-sm mb-8">Tham gia cộng đồng VietBlog ngay hôm nay</p>

    <form @submit.prevent="handleRegister" class="space-y-4">
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
        <p v-if="nameError" class="mt-1.5 text-sm text-red-500">{{ nameError }}</p>
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
            placeholder="Tối thiểu 8 ký tự"
            @input="watchPassword(($event.target as HTMLInputElement).value)"
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
        <!-- Password strength indicator -->
        <div v-if="password.length > 0" class="mt-2">
          <div class="flex gap-1 mb-1">
            <div
              v-for="i in 4"
              :key="i"
              :class="[
                'h-1 flex-1 rounded-full transition-all duration-300',
                i <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'
              ]"
            />
          </div>
          <p class="text-xs" :class="strengthColors[passwordStrength - 1]?.replace('bg-', 'text-')">
            {{ passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Nhập mật khẩu' }}
          </p>
        </div>
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
        <p v-if="confirmPasswordError" class="mt-1.5 text-sm text-red-500">{{ confirmPasswordError }}</p>
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
          <a href="#" class="text-primary-400 hover:text-primary-300">Điều khoản sử dụng</a>
          và
          <a href="#" class="text-primary-400 hover:text-primary-300">Chính sách bảo mật</a>
        </span>
      </label>

      <!-- Register Button -->
      <button
        type="submit"
        :disabled="isLoading || !agreeTerms"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-500/25 disabled:opacity-50"
      >
        <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <template v-else>
          Tạo tài khoản
          <ArrowRight :size="18" />
        </template>
      </button>
    </form>

    <!-- Login link -->
    <p class="text-center text-sm text-gray-400 mt-6">
      Đã có tài khoản?
      <router-link to="/login" class="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
        Đăng nhập
      </router-link>
    </p>
  </div>
</template>

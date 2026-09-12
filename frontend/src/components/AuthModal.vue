<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, User, Check } from '@lucide/vue'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

const uiStore = useUiStore()
const authStore = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const name = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const agreeTerms = ref(false)

// Validation errors
const emailError = ref('')
const passwordError = ref('')
const nameError = ref('')
const confirmPasswordError = ref('')

// Password strength
const passwordStrength = ref(0)
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh']

watch(password, (val) => {
  let score = 0
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  passwordStrength.value = score
})

// Reset form when switching tabs
watch(() => uiStore.authModalTab, () => {
  email.value = ''
  password.value = ''
  name.value = ''
  confirmPassword.value = ''
  error.value = ''
  emailError.value = ''
  passwordError.value = ''
  nameError.value = ''
  confirmPasswordError.value = ''
  showPassword.value = false
  agreeTerms.value = false
})

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

function validateRegister(): boolean {
  let valid = validateLogin()
  nameError.value = ''
  confirmPasswordError.value = ''

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

async function handleLogin() {
  if (!validateLogin()) return
  
  isLoading.value = true
  error.value = ''

  // Mock login - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Mock: accept any email with password >= 6 chars
  const mockUser = {
    id: '1',
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

async function handleRegister() {
  if (!validateRegister()) return
  if (!agreeTerms.value) {
    error.value = 'Vui lòng đồng ý với Điều khoản sử dụng'
    return
  }

  isLoading.value = true
  error.value = ''

  // Mock register - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const mockUser = {
    id: Date.now().toString(),
    name: name.value,
    email: email.value,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name.value)}`,
    bio: '',
    role: 'user' as const,
    joinedAt: new Date().toISOString(),
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  }

  authStore.setToken('mock-jwt-token-' + Date.now())
  authStore.setUser(mockUser)

  isLoading.value = false
  uiStore.closeAuthModal()
}

function close() {
  if (!isLoading.value) {
    uiStore.closeAuthModal()
  }
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="uiStore.showAuthModal"
        class="fixed inset-0 z-100 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

        <!-- Modal -->
        <div class="relative w-full max-w-md bg-surface-800 rounded-2xl shadow-2xl border border-surface-700 overflow-hidden">
          <!-- Close button -->
          <button
            @click="close"
            class="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X :size="18" />
          </button>

          <!-- Header / Tab switch -->
          <div class="px-8 pt-8 pb-4">
            <div class="flex items-center gap-1 bg-surface-700/50 rounded-xl p-1 mb-6">
              <button
                @click="uiStore.authModalTab = 'login'"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  uiStore.authModalTab === 'login'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-gray-400 hover:text-gray-300'
                ]"
              >
                Đăng nhập
              </button>
              <button
                @click="uiStore.authModalTab = 'register'"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  uiStore.authModalTab === 'register'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-gray-400 hover:text-gray-300'
                ]"
              >
                Đăng ký
              </button>
            </div>

            <h2 class="text-xl font-bold text-white mb-1">
              {{ uiStore.authModalTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới' }}
            </h2>
            <p class="text-sm text-gray-400">
              {{ uiStore.authModalTab === 'login' ? 'Đăng nhập để tiếp tục hành trình của bạn' : 'Tham gia cộng đồng VietBlog ngay hôm nay' }}
            </p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="mx-8 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {{ error }}
          </div>

          <!-- LOGIN Form -->
          <form v-if="uiStore.authModalTab === 'login'" @submit.prevent="handleLogin" class="px-8 pb-8 space-y-4">
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

          <!-- REGISTER Form -->
          <form v-else @submit.prevent="handleRegister" class="px-8 pb-8 space-y-4">
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
                  placeholder="Tối thiểu 6 ký tự"
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
                <p class="text-xs text-gray-400">
                  {{ passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : '' }}
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
                <a href="#" class="text-primary-400 hover:text-primary-300">Điều khoản sử dụng</a>
                và
                <a href="#" class="text-primary-400 hover:text-primary-300">Chính sách bảo mật</a>
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
        </div>
      </div>
    </transition>
  </teleport>
</template>

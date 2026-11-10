<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { useUiStore } from '@/stores/ui.store'
import AuthLoginForm from './AuthLoginForm.vue'
import AuthRegisterForm from './AuthRegisterForm.vue'
import AuthSocialLogin from '@/views/auth/components/AuthSocialLogin.vue'

const uiStore = useUiStore()

const isLoading = ref(false)
const error = ref('')

// Reset error when switching tabs or reopening modal
watch(() => uiStore.authModalTab, () => {
  error.value = ''
})

watch(() => uiStore.showAuthModal, (open) => {
  if (open) error.value = ''
})

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
        <div class="absolute inset-0 bg-black/50 backdrop-blur-xs" @click="close" />

        <!-- Modal -->
        <div class="relative w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-gray-200 dark:border-surface-700 overflow-hidden">
          <!-- Header: Title + Close button on top, full-width Tab switch below -->
          <div class="px-6 pt-5 pb-3">
            <div class="flex items-start justify-between gap-3 mb-3.5">
              <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {{ uiStore.authModalTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới' }}
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ uiStore.authModalTab === 'login' ? 'Đăng nhập để tiếp tục hành trình của bạn' : 'Tham gia cộng đồng VietBlog ngay hôm nay' }}
                </p>
              </div>
              <button
                @click="close"
                type="button"
                title="Đóng"
                class="w-8 h-8 -mr-1 -mt-0.5 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all shrink-0 cursor-pointer"
              >
                <X :size="18" />
              </button>
            </div>

            <div class="flex items-center gap-1 bg-gray-100 dark:bg-surface-700/60 rounded-xl p-1">
              <button
                @click="uiStore.authModalTab = 'login'"
                type="button"
                :class="[
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                  uiStore.authModalTab === 'login'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                Đăng nhập
              </button>
              <button
                @click="uiStore.authModalTab = 'register'"
                type="button"
                :class="[
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                  uiStore.authModalTab === 'register'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                Đăng ký
              </button>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="mx-6 mb-2.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {{ error }}
          </div>

          <!-- LOGIN Form -->
          <AuthLoginForm v-if="uiStore.authModalTab === 'login'" v-model:error="error" />

          <!-- REGISTER Form -->
          <AuthRegisterForm v-else v-model:error="error" />

          <div class="px-6 pb-5">
            <AuthSocialLogin />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

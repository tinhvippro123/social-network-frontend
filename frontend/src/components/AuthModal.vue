<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { useUiStore } from '@/stores/ui.store'
import AuthLoginForm from './AuthLoginForm.vue'
import AuthRegisterForm from './AuthRegisterForm.vue'

const uiStore = useUiStore()

const isLoading = ref(false)
const error = ref('')

// Reset error when switching tabs
watch(() => uiStore.authModalTab, () => {
  error.value = ''
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
          <AuthLoginForm v-if="uiStore.authModalTab === 'login'" v-model:error="error" />

          <!-- REGISTER Form -->
          <AuthRegisterForm v-else v-model:error="error" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

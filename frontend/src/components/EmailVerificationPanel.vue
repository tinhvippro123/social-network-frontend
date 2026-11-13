<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { MailCheck, KeyRound, ArrowRight, ArrowLeft, RefreshCw } from '@lucide/vue'
import { useEmailVerification } from '@/composables/auth/useEmailVerification'
import type { User } from '@/types'

const props = withDefaults(defineProps<{
  email: string
  compact?: boolean
  backLabel?: string
}>(), {
  compact: false,
  backLabel: 'Quay lại',
})

const emit = defineEmits<{
  (e: 'verified', user: User): void
  (e: 'back'): void
}>()

const {
  otp,
  otpError,
  isVerifying,
  isResending,
  resendCooldown,
  startCooldown,
  submitVerification,
  resendCode,
  resetState,
} = useEmailVerification()

onMounted(() => {
  startCooldown(60)
})

watch(() => props.email, () => {
  otp.value = ''
  otpError.value = ''
  startCooldown(60)
})

async function handleVerify() {
  const user = await submitVerification(props.email)
  if (user) {
    emit('verified', user)
  }
}

function handleBack() {
  resetState()
  emit('back')
}
</script>

<template>
  <div :class="compact ? 'px-6 pb-4 space-y-3' : 'space-y-4'">
    <div class="flex items-start gap-3 p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/40">
      <div class="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
        <MailCheck :size="18" />
      </div>
      <div class="min-w-0 text-xs leading-relaxed">
        <p class="font-semibold text-gray-900 dark:text-white">Xác thực địa chỉ email</p>
        <p class="text-gray-600 dark:text-gray-300 mt-0.5">
          Nhập mã OTP gồm 6 chữ số đã được gửi tới
          <span class="font-semibold text-primary-600 dark:text-primary-400 break-all">{{ email }}</span>.
          Kiểm tra cả thư mục Spam nếu chưa thấy email.
        </p>
      </div>
    </div>

    <form @submit.prevent="handleVerify" class="space-y-3">
      <div>
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mã xác thực OTP (hiệu lực 15 phút)</label>
        <div class="relative">
          <KeyRound :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="otp"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            placeholder="Nhập 6 chữ số (VD: 123456)"
            :class="[
              'w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 placeholder:tracking-normal focus:outline-none focus:ring-2 transition-all',
              otpError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-white/10 focus:ring-primary-500/40 focus:border-primary-500'
            ]"
          />
        </div>
        <p v-if="otpError" class="mt-1.5 text-xs text-red-500 dark:text-red-400">{{ otpError }}</p>
      </div>

      <button
        type="submit"
        :disabled="isVerifying"
        class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
      >
        <span v-if="isVerifying" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <template v-else>
          Xác nhận & Đăng nhập
          <ArrowRight :size="16" />
        </template>
      </button>
    </form>

    <div class="flex items-center justify-between pt-1 text-xs">
      <button
        type="button"
        @click="handleBack"
        class="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium cursor-pointer"
      >
        <ArrowLeft :size="14" /> {{ backLabel }}
      </button>

      <button
        type="button"
        @click="resendCode(email)"
        :disabled="isResending || resendCooldown > 0"
        class="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline font-medium disabled:opacity-50 disabled:no-underline cursor-pointer"
      >
        <RefreshCw :size="13" :class="{ 'animate-spin': isResending }" />
        <template v-if="resendCooldown > 0">
          Gửi lại mã ({{ resendCooldown }}s)
        </template>
        <template v-else>
          Gửi lại mã
        </template>
      </button>
    </div>
  </div>
</template>


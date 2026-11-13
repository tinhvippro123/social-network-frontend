import { ref, onUnmounted } from 'vue'
import authApi from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '../ui/useToast'
import type { User } from '@/types'

/** Shared OTP countdown and verification helper for login and registration forms. */
export function useEmailVerification() {
  const authStore = useAuthStore()
  const toast = useToast()

  const otp = ref('')
  const otpError = ref('')
  const isVerifying = ref(false)
  const isResending = ref(false)
  const resendCooldown = ref(0)

  let cooldownTimer: ReturnType<typeof setInterval> | null = null

  function clearTimer() {
    if (cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }

  function startCooldown(seconds: number = 60) {
    clearTimer()
    resendCooldown.value = seconds
    cooldownTimer = setInterval(() => {
      if (resendCooldown.value <= 1) {
        resendCooldown.value = 0
        clearTimer()
      } else {
        resendCooldown.value -= 1
      }
    }, 1000)
  }

  async function submitVerification(email: string): Promise<User | null> {
    otpError.value = ''
    const cleanedOtp = otp.value.trim()
    if (!cleanedOtp) {
      otpError.value = 'Vui lòng nhập mã xác thực 6 chữ số'
      return null
    }

    isVerifying.value = true
    try {
      const { data } = await authApi.verifyEmail({
        email: email.trim(),
        otp: cleanedOtp,
      })
      const user = data.data.user
      authStore.setUser(user)
      toast.success(`Xác thực email thành công! Chào mừng ${user?.name || 'bạn'}!`)
      return user
    } catch (err: any) {
      otpError.value = err.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn'
      return null
    } finally {
      isVerifying.value = false
    }
  }

  async function resendCode(email: string): Promise<boolean> {
    if (resendCooldown.value > 0 || isResending.value) return false
    isResending.value = true
    otpError.value = ''
    try {
      await authApi.resendVerification({ email: email.trim() })
      toast.success('Đã gửi lại mã xác thực mới về email của bạn!')
      startCooldown(60)
      return true
    } catch (err: any) {
      otpError.value = err.response?.data?.message || 'Không thể gửi lại mã xác thực lúc này'
      return false
    } finally {
      isResending.value = false
    }
  }

  function resetState() {
    otp.value = ''
    otpError.value = ''
    resendCooldown.value = 0
    clearTimer()
  }

  onUnmounted(() => {
    clearTimer()
  })

  return {
    otp,
    otpError,
    isVerifying,
    isResending,
    resendCooldown,
    startCooldown,
    submitVerification,
    resendCode,
    resetState,
  }
}


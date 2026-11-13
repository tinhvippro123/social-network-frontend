import { ref } from 'vue'
import type { User } from '@/types'
import { useAuth } from './useAuth'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export function useLogin() {
  const { login, redirectByRole } = useAuth()

  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('vb_remember_email') || '' : ''
  const showPassword = ref(false)
  const isLoading = ref(false)
  const rememberMe = ref(Boolean(savedEmail))
  const verificationEmail = ref('')

  const schema = toTypedSchema(
    z.object({
      email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ').default(savedEmail),
      password: z.string().min(1, 'Vui lòng nhập mật khẩu').min(8, 'Mật khẩu phải có ít nhất 8 ký tự').default(''),
    })
  )

  const { handleSubmit } = useForm({
    validationSchema: schema,
  })

  const { value: email, errorMessage: emailError } = useField<string>('email')
  const { value: password, errorMessage: passwordError } = useField<string>('password')

  const handleLogin = handleSubmit(async (values) => {
    isLoading.value = true
    try {
      if (typeof window !== 'undefined') {
        if (rememberMe.value) {
          localStorage.setItem('vb_remember_email', values.email)
        } else {
          localStorage.removeItem('vb_remember_email')
        }
      }
      const result = await login({ email: values.email, password: values.password })
      if (!result.ok && result.errorCode === 'EMAIL_NOT_VERIFIED') {
        verificationEmail.value = values.email.trim()
      }
    } finally {
      isLoading.value = false
    }
  })

  function handleVerified(user: User) {
    verificationEmail.value = ''
    redirectByRole(user.role)
  }

  function cancelVerification() {
    verificationEmail.value = ''
  }

  return {
    email,
    emailError,
    password,
    passwordError,
    showPassword,
    isLoading,
    rememberMe,
    verificationEmail,
    handleLogin,
    handleVerified,
    cancelVerification,
  }
}

import { ref } from 'vue'

import { useAuth } from './useAuth'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export function useLogin() {
  const { login } = useAuth()

  const showPassword = ref(false)
  const isLoading = ref(false)
  const rememberMe = ref(false)

  const schema = toTypedSchema(
    z.object({
      email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
      password: z.string().min(1, 'Vui lòng nhập mật khẩu').min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
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
      await login({ email: values.email, password: values.password })
    } finally {
      isLoading.value = false
    }
  })

  return {
    email,
    emailError,
    password,
    passwordError,
    showPassword,
    isLoading,
    rememberMe,
    handleLogin
  }
}

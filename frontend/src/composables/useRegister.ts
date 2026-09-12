import { ref, watch } from 'vue'

import { useAuth } from './useAuth'
import { PASSWORD_STRENGTH } from '@/constants'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export function useRegister() {
  const { register } = useAuth()

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
  
  watch(password, (val) => {
    let strength = 0
    if (val) {
      if (val.length >= 8) strength++
      if (/[A-Z]/.test(val)) strength++
      if (/[0-9]/.test(val)) strength++
      if (/[^A-Za-z0-9]/.test(val)) strength++
    }
    passwordStrength.value = strength
  })

  const strengthColors = PASSWORD_STRENGTH.COLORS
  const strengthLabels = PASSWORD_STRENGTH.LABELS

  const handleRegister = handleSubmit(async (values) => {
    isLoading.value = true
    try {
      await register({ 
        name: values.name, 
        email: values.email, 
        password: values.password,
        passwordConfirm: values.confirmPassword
      })
    } finally {
      isLoading.value = false
    }
  })

  return {
    name,
    nameError,
    email,
    emailError,
    password,
    passwordError,
    confirmPassword,
    confirmPasswordError,
    showPassword,
    isLoading,
    agreeTerms,
    passwordStrength,
    strengthColors,
    strengthLabels,
    handleRegister
  }
}

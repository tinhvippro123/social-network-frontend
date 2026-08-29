// ==========================================
// Utils — Validators (Form Validation)
// ==========================================

export function validateEmail(email: string): string | null {
  if (!email) return 'Email không được để trống'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) return 'Email không hợp lệ'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Mật khẩu không được để trống'
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa'
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường'
  if (!/[0-9]/.test(password)) return 'Mật khẩu phải có ít nhất 1 số'
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} không được để trống`
  return null
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (value.length < min) return `${fieldName} phải có ít nhất ${min} ký tự`
  return null
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value.length > max) return `${fieldName} không được quá ${max} ký tự`
  return null
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (password !== confirm) return 'Mật khẩu xác nhận không khớp'
  return null
}

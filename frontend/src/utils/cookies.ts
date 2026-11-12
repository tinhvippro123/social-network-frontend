// ==========================================
// Cookie Helpers — Hỗ trợ kiểm tra cờ phiên đăng nhập (không chứa JWT nhạy cảm)
// JWT Access & Refresh Token được lưu hoàn toàn trong HttpOnly Cookie do Backend cấp
// ==========================================
import { COOKIE_NAMES } from '@/constants'

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) return null
  const prefix = `${encodeURIComponent(name)}=`
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length))
    }
  }
  return null
}

export function hasAuthSessionCookie(): boolean {
  return getCookie(COOKIE_NAMES.LOGGED_IN) === '1'
}

export function setAuthIndicatorCookie(): void {
  if (typeof document === 'undefined') return
  const secureAttr = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(COOKIE_NAMES.LOGGED_IN)}=1; path=/; SameSite=Lax${secureAttr}`
}

export function clearAuthIndicatorCookie(): void {
  if (typeof document === 'undefined') return
  const secureAttr = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(COOKIE_NAMES.LOGGED_IN)}=; Max-Age=0; path=/; SameSite=Lax${secureAttr}`
}


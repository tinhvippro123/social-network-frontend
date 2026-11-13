// ==========================================
// API — Authentication (HttpOnly Cookie Session)
// ==========================================
import type { AxiosRequestConfig } from 'axios'
import http from './client'
import type { ApiResponse } from './client'
import type { User } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

export interface AuthTokens {
  accessToken?: string
}

export interface GoogleLoginPayload {
  accessToken?: string
  idToken?: string
}

const authApi = {
  login: (data: LoginRequest) =>
    http.post<ApiResponse<AuthTokens & { user: User }>>('/auth/login', data),

  loginWithGoogle: (data: GoogleLoginPayload) =>
    http.post<ApiResponse<AuthTokens & { user: User }>>('/auth/google', data),

  register: (data: RegisterRequest) =>
    http.post<ApiResponse<{ message: string }>>('/auth/register', data),

  logout: () =>
    http.post<ApiResponse>('/auth/logout'),

  refreshToken: (config?: AxiosRequestConfig) =>
    http.post<ApiResponse<AuthTokens & { user: User }>>('/auth/refresh', {}, config),

  getWsTicket: () =>
    http.post<ApiResponse<{ ticket: string }>>('/auth/ws-ticket', {}, { skipErrorToast: true, skipAuthRedirect: true } as AxiosRequestConfig),

  getProfile: (config?: AxiosRequestConfig) =>
    http.get<ApiResponse<User>>('/auth/me', config),

  updateProfile: (data: Partial<User>) =>
    http.put<ApiResponse<User>>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    http.put<ApiResponse>('/auth/me/password', data),

  forgotPassword: (data: { email: string }) =>
    http.post<ApiResponse<{ message: string; resetToken?: string; otp?: string; expiresInSeconds?: number }>>('/auth/forgot-password', data),

  resetPassword: (data: { token: string; newPassword: string; email?: string }) =>
    http.post<ApiResponse<void>>('/auth/reset-password', data),
}

export default authApi

// ==========================================
// API — Authentication
// ==========================================
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
  accessToken: string
  refreshToken: string
}



const authApi = {
  login: (data: LoginRequest) =>
    http.post<ApiResponse<AuthTokens & { user: User }>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    http.post<ApiResponse<{ message: string }>>('/auth/register', data),

  logout: () =>
    http.post<ApiResponse>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    http.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  getProfile: () =>
    http.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    http.put<ApiResponse<User>>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    http.put<ApiResponse>('/auth/me/password', data),
}

export default authApi

// ==========================================
// API — Authentication
// ==========================================
import http from './client'
import type { ApiResponse } from './client'

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

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  role: 'user' | 'admin' | 'moderator'
  joinedAt: string
  followersCount: number
  followingCount: number
  postsCount: number
}

const authApi = {
  login: (data: LoginRequest) =>
    http.post<ApiResponse<AuthTokens & { user: UserProfile }>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    http.post<ApiResponse<{ message: string }>>('/auth/register', data),

  logout: () =>
    http.post<ApiResponse>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    http.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  getProfile: () =>
    http.get<ApiResponse<UserProfile>>('/auth/me'),

  updateProfile: (data: Partial<UserProfile>) =>
    http.put<ApiResponse<UserProfile>>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    http.put<ApiResponse>('/auth/me/password', data),
}

export default authApi

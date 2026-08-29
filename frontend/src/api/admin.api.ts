// ==========================================
// API — Admin (Quản trị)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { AdminStats, Report, User } from '@/types'

const adminApi = {
  // ── Dashboard ─────────────────────────────
  getStats: () =>
    http.get<ApiResponse<AdminStats>>('/admin/stats'),

  // ── Users ─────────────────────────────────
  getUsers: (params?: { page?: number; role?: string; search?: string }) =>
    http.get<ApiResponse<User[]>>('/admin/users', { params }),

  updateUserRole: (userId: string, role: string) =>
    http.put<ApiResponse>(`/admin/users/${userId}/role`, { role }),

  banUser: (userId: string) =>
    http.post<ApiResponse>(`/admin/users/${userId}/ban`),

  deleteUser: (userId: string) =>
    http.delete<ApiResponse>(`/admin/users/${userId}`),

  // ── Moderation ────────────────────────────
  getReports: (params?: { status?: string; page?: number }) =>
    http.get<ApiResponse<Report[]>>('/admin/reports', { params }),

  resolveReport: (reportId: string, action: 'keep' | 'delete' | 'ban') =>
    http.put<ApiResponse>(`/admin/reports/${reportId}`, { action }),

  dismissReport: (reportId: string) =>
    http.put<ApiResponse>(`/admin/reports/${reportId}/dismiss`),

  // ── Categories ────────────────────────────
  getCategories: () =>
    http.get<ApiResponse>('/admin/categories'),

  createCategory: (data: { name: string; icon: string }) =>
    http.post<ApiResponse>('/admin/categories', data),

  updateCategory: (id: string, data: { name?: string; icon?: string }) =>
    http.put<ApiResponse>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    http.delete<ApiResponse>(`/admin/categories/${id}`),

  // ── Settings ──────────────────────────────
  getSettings: () =>
    http.get<ApiResponse>('/admin/settings'),

  updateSettings: (data: Record<string, unknown>) =>
    http.put<ApiResponse>('/admin/settings', data),
}

export default adminApi

// ==========================================
// API — Admin (Quản trị)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { AdminStats, Report, User } from '@/types'
import { slugify } from '@/utils/formatters'

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/** Nhãn trục X theo độ dài khoảng: ≤7 mốc → thứ; còn lại → dd/MM */
function growthLabel(dateStr: string, total: number): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  if (total <= 7) return WEEKDAYS[d.getDay()] ?? ''
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function mapAdminStats(s: any): AdminStats {
  const growth = Array.isArray(s?.growth) ? s.growth : []
  return {
    totalUsers: s?.totalUsers ?? 0,
    newUsersToday: s?.newUsersToday ?? 0,
    totalPosts: s?.totalPosts ?? 0,
    newPostsToday: s?.newPostsToday ?? 0,
    totalComments: s?.totalComments ?? 0,
    totalGroups: s?.totalGroups ?? 0,
    totalReports: s?.totalReports ?? 0,
    pendingReports: s?.pendingReports ?? 0,
    totalViews: s?.totalViews ?? 0,
    growthLabels: growth.map((g: any) => growthLabel(g.date, growth.length)),
    userGrowth: growth.map((g: any) => g.users ?? 0),
    postGrowth: growth.map((g: any) => g.posts ?? 0),
    newUsersInRange: s?.newUsersInRange ?? 0,
    newPostsInRange: s?.newPostsInRange ?? 0,
    topCategories: s?.topCategories || [],
    recentActivities: s?.recentActivities || [],
  }
}

const adminApi = {
  // ── Dashboard ─────────────────────────────
  getStats: async (days = 7) => {
    const res = await http.get<ApiResponse<any>>('/admin/stats', { params: { days } })
    return {
      ...res,
      data: {
        ...res.data,
        data: mapAdminStats(res.data.data),
      },
    }
  },

  // ── Users ─────────────────────────────────
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    http.get<ApiResponse<User[]>>('/admin/users', { params }),

  updateUserRole: (userId: string, role: string) =>
    http.patch<ApiResponse<any>>(`/admin/users/${userId}/role`, { role: role.toUpperCase() }),

  banUser: (userId: string, banned = true) =>
    http.patch<ApiResponse<any>>(`/admin/users/${userId}/ban`, { banned }),

  deleteUser: (userId: string) =>
    http.delete<ApiResponse<void>>(`/admin/users/${userId}`),

  // ── Posts Moderation ──────────────────────
  getPosts: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    http.get<ApiResponse<any[]>>('/admin/posts', { params }),

  updatePostStatus: (postId: string, status: string) =>
    http.patch<ApiResponse<any>>(`/admin/posts/${postId}/status`, { status: status.toUpperCase() }),

  // ── Moderation / Reports ──────────────────
  getReports: (params?: { status?: string; page?: number; limit?: number }) =>
    http.get<ApiResponse<Report[]>>('/admin/reports', { params }),

  resolveReport: (reportId: string, action: 'keep' | 'delete' | 'ban') =>
    http.patch<ApiResponse<any>>(`/admin/reports/${reportId}/resolve`, { action: action.toUpperCase() }),

  dismissReport: (reportId: string) =>
    http.patch<ApiResponse<any>>(`/admin/reports/${reportId}/dismiss`),

  // ── Sentiment Analysis (AI/NLP) ───────────
  getSentimentStats: () =>
    http.get<ApiResponse<{ positive: number; negative: number; neutral: number }>>('/moderation/sentiment'),

  // ── Categories ────────────────────────────
  getCategories: () =>
    http.get<ApiResponse<any[]>>('/categories'),

  createCategory: (data: { name: string; icon?: string }) =>
    http.post<ApiResponse<any>>('/categories', {
      name: data.name,
      icon: data.icon || '📁',
      slug: slugify(data.name),
    }),

  updateCategory: (id: string, data: { name: string; icon?: string }) =>
    http.put<ApiResponse<any>>(`/categories/${id}`, {
      name: data.name,
      icon: data.icon || '📁',
      slug: slugify(data.name),
    }),

  deleteCategory: (id: string) =>
    http.delete<ApiResponse<void>>(`/categories/${id}`),

  // ── Tags ──────────────────────────────────
  renameTag: (name: string, replacement: string) =>
    http.patch<ApiResponse<void>>(`/admin/tags/${encodeURIComponent(name)}`, { name: replacement }, {
      params: { replacement },
    }),

  deleteTag: (name: string) =>
    http.delete<ApiResponse<void>>(`/admin/tags/${encodeURIComponent(name)}`),

  // ── Settings ──────────────────────────────
  getSettings: () =>
    http.get<ApiResponse<any>>('/admin/settings'),

  updateSettings: (data: Record<string, unknown>) =>
    http.put<ApiResponse<any>>('/admin/settings', data),
}

export default adminApi

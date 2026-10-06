// ==========================================
// API — Admin (Quản trị)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { AdminStats, Report, User } from '@/types'
import { mockAdminStats, mockUsers, mockReports, mockCategories } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const adminApi = {
  // ── Dashboard ─────────────────────────────
  getStats: async () => {
    await delay(500)
    return { data: { data: mockAdminStats, success: true, message: 'Success' } } as { data: ApiResponse<AdminStats> }
  },

  // ── Users ─────────────────────────────────
  getUsers: async (params?: { page?: number; role?: string; search?: string }) => {
    await delay(500)
    return { data: { data: mockUsers, success: true, message: 'Success' } } as { data: ApiResponse<User[]> }
  },

  updateUserRole: async (userId: string, role: string) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  banUser: async (userId: string) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  deleteUser: async (userId: string) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  // ── Moderation ────────────────────────────
  getReports: async (params?: { status?: string; page?: number }) => {
    await delay(500)
    return { data: { data: mockReports, success: true, message: 'Success' } } as { data: ApiResponse<Report[]> }
  },

  resolveReport: async (reportId: string, action: 'keep' | 'delete' | 'ban') => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  dismissReport: async (reportId: string) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  // ── Categories ────────────────────────────
  getCategories: async () => {
    await delay(500)
    return { data: { data: mockCategories, success: true, message: 'Success' } } as { data: ApiResponse }
  },

  createCategory: async (data: { name: string; icon: string }) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  updateCategory: async (id: string, data: { name?: string; icon?: string }) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  deleteCategory: async (id: string) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },

  // ── Settings ──────────────────────────────
  getSettings: async () => {
    await delay(500)
    return { data: { data: {}, success: true, message: 'Success' } } as { data: ApiResponse }
  },

  updateSettings: async (data: Record<string, unknown>) => {
    await delay(500)
    return { data: { success: true, message: 'Success' } } as { data: ApiResponse }
  },
}

export default adminApi

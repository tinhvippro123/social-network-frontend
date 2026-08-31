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
    return { data: { data: mockAdminStats, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<AdminStats> }>
  },

  // ── Users ─────────────────────────────────
  getUsers: async (params?: { page?: number; role?: string; search?: string }) => {
    await delay(500)
    return { data: { data: mockUsers, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<User[]> }>
  },

  updateUserRole: async (userId: string, role: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  banUser: async (userId: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  deleteUser: async (userId: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  // ── Moderation ────────────────────────────
  getReports: async (params?: { status?: string; page?: number }) => {
    await delay(500)
    return { data: { data: mockReports, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Report[]> }>
  },

  resolveReport: async (reportId: string, action: 'keep' | 'delete' | 'ban') => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  dismissReport: async (reportId: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  // ── Categories ────────────────────────────
  getCategories: async () => {
    await delay(500)
    return { data: { data: mockCategories, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  createCategory: async (data: { name: string; icon: string }) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  updateCategory: async (id: string, data: { name?: string; icon?: string }) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  deleteCategory: async (id: string) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  // ── Settings ──────────────────────────────
  getSettings: async () => {
    await delay(500)
    return { data: { data: {}, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },

  updateSettings: async (data: Record<string, unknown>) => {
    await delay(500)
    return { data: { status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse }>
  },
}

export default adminApi

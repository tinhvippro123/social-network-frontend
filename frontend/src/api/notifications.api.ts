// ==========================================
// API — Notifications (Thông báo)
// ==========================================
import http from './client'
import type { ApiResponse } from './client'
import type { Notification } from '@/types'

export interface NotificationQuery {
  unreadOnly?: boolean
  page?: number
  limit?: number
}

const notificationsApi = {
  getAll: (params?: NotificationQuery) =>
    http.get<ApiResponse<Notification[]>>('/notifications', { params }),

  getUnreadCount: () =>
    http.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markRead: (id: string) =>
    http.patch<ApiResponse<void>>(`/notifications/${id}/read`),

  markAllRead: () =>
    http.patch<ApiResponse<{ updated: number }>>('/notifications/read-all'),
}

export default notificationsApi

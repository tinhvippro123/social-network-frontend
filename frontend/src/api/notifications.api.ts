import http from './client'
import type { ApiResponse } from './client'
import type { Notification } from '@/types'
import { mockNotifications } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const notificationsApi = {
  getAll: async () => {
    await delay(500)
    return { data: { data: mockNotifications, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<Notification[]> }>
  },
}

export default notificationsApi

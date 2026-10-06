import http from './client'
import type { ApiResponse } from './client'
import type { Notification } from '@/types'
import { mockNotifications } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const notificationsApi = {
  getAll: async () => {
    await delay(500)
    return { data: { data: mockNotifications, success: true, message: 'Success' } } as { data: ApiResponse<Notification[]> }
  },
}

export default notificationsApi

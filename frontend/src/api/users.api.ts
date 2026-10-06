import http from './client'
import type { ApiResponse } from './client'
import type { User } from '@/types'
import { mockUsers } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const usersApi = {
  getAll: async () => {
    await delay(500)
    return { data: { data: mockUsers, success: true, message: 'Success' } } as { data: ApiResponse<User[]> }
  },
  getRecommended: async () => {
    await delay(500)
    return { data: { data: mockUsers.slice(0, 5), success: true, message: 'Success' } } as { data: ApiResponse<User[]> }
  },
}

export default usersApi

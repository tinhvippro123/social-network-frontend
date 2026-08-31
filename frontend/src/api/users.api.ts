import http from './client'
import type { ApiResponse } from './client'
import type { User } from '@/types'
import { mockUsers } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const usersApi = {
  getAll: async () => {
    await delay(500)
    return { data: { data: mockUsers, status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<User[]> }>
  },
  getRecommended: async () => {
    await delay(500)
    return { data: { data: mockUsers.slice(0, 5), status: 200, message: 'Success' } } as unknown as Promise<{ data: ApiResponse<User[]> }>
  },
}

export default usersApi

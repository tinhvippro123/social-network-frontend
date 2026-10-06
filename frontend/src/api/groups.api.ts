import http from './client'
import type { ApiResponse } from './client'
import type { Group } from '@/types'
import { mockGroups } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const groupsApi = {
  getAll: async (params?: any) => {
    await delay(500)
    return { data: { data: mockGroups, success: true, message: 'Success' } } as { data: ApiResponse<Group[]> }
  },

  getById: async (id: string) => {
    await delay(500)
    const group = mockGroups.find(g => g.id === id) || mockGroups[0]
    return { data: { data: group, success: true, message: 'Success' } } as { data: ApiResponse<Group> }
  },
}

export default groupsApi

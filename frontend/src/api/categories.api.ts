import http from './client'
import type { ApiResponse } from './client'
import { mockCategories } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const categoriesApi = {
  getAll: async (params?: any) => {
    await delay(500)
    return { data: { data: mockCategories, success: true, message: 'Success' } } as { data: ApiResponse<any[]> }
  }
}

export default categoriesApi

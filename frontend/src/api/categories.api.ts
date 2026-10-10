import http from './client'
import type { ApiResponse } from './client'
const categoriesApi = {
  getAll: async (params?: any) => {
    return await http.get('/categories', { params })
  }
}

export default categoriesApi

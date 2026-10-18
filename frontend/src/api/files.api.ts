import http from './client'
import type { ApiResponse } from './client'

export interface UploadFileResponse {
  fileName: string
  fileUrl: string
  fileType: string
  size: number
}

const filesApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // We must ensure the client does not set Content-Type header manually to allow the browser to set it with boundary
    // The axios instance usually handles this if we pass FormData
    return await http.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default filesApi

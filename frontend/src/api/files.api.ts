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
    
    // Let the browser set multipart/form-data Content-Type with the generated boundary automatically
    return await http.post('/files/upload', formData, {
      headers: {
        'Content-Type': undefined
      }
    })
  }
}

export default filesApi

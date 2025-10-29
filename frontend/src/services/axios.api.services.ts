'use client'

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refresh = localStorage.getItem('refresh')
      if (!refresh) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        if (typeof window !== 'undefined')
          location.assign('/login?expSession=true')
        return Promise.reject(error)
      }
      try {
        const res = await axios.post<{ access: string }>(
          'http://localhost:8000/api/users/token/refresh/',
          { refresh }
        )
        localStorage.setItem('access', res.data.access)
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        if (typeof window !== 'undefined')
          location.assign('/login?expSession=true')
      }
    }
    return Promise.reject(error)
  }
)

export default api



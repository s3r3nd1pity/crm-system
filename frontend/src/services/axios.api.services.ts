'use client'

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
})

let isRefreshing = false

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
      if (isRefreshing) return Promise.reject(error) // если refresh уже идёт, не трогаем
      originalRequest._retry = true
      isRefreshing = true

      const refresh = localStorage.getItem('refresh')
      if (!refresh) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        if (typeof window !== 'undefined') location.assign('/login?expSession=true')
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const res: any = await axios.post('http://localhost:8000/api/users/token/refresh/', { refresh })
        localStorage.setItem('access', res.data.access)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`
        isRefreshing = false
        return api(originalRequest)
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        if (typeof window !== 'undefined') location.assign('/login?expSession=true')
        isRefreshing = false
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api

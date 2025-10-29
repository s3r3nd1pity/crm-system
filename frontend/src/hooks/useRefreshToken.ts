'use client'

import axios from 'axios'

export const useRefreshToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem('refresh')
  if (!refresh) return null

  try {
    const res = await axios.post<{ access: string }>(
      'http://localhost:8000/api/users/token/refresh/',
      { refresh }
    )
    localStorage.setItem('access', res.data.access)
    return res.data.access
  } catch {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    return null
  }
}

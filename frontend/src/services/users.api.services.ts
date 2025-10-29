import api from '@/services/axios.api.services'
import axios from 'axios'

interface TokenResponse {
  access: string
  refresh: string
}

interface IUser {
  id: number
  email: string
  role: string
}

const BASE_URL = 'http://localhost:8000/api/users'

export const usersApi = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const res = await axios.post<TokenResponse>(`${BASE_URL}/token/`, {
      email,
      password,
    })
    return res.data
  },

  refresh: async (refresh: string): Promise<{ access: string }> => {
    const res = await axios.post<{ access: string }>(
      `${BASE_URL}/token/refresh/`,
      { refresh }
    )
    return res.data
  },

  getCurrentUser: async (): Promise<IUser> => {
    const res = await api.get<IUser>(`${BASE_URL}/me/`)
    return res.data
  },

  logout: (): void => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    window.location.href = '/login'
  },
}

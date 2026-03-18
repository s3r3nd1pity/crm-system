'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usersApi } from '@/services/users.api.services'

export interface IUser {
  id: number
  email: string
  role: string
  first_name?: string
  last_name?: string
}


interface IAuthContext {
  user: IUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<IAuthContext | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const access = localStorage.getItem('access')
      if (!access) {
        setLoading(false)
        return
      }
      try {
        const data = await usersApi.getCurrentUser()
        setUser(data)
      } catch {
        const refreshed = await refreshToken()
        if (!refreshed) logout()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const tokens = await usersApi.login(email, password)
      localStorage.setItem('access', tokens.access)
      localStorage.setItem('refresh', tokens.refresh)

      const data = await usersApi.getCurrentUser()
      setUser(data)
      router.replace('/orders')
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    const refresh = localStorage.getItem('refresh')
    if (!refresh) return false

    try {
      const data = await usersApi.refresh(refresh)
      localStorage.setItem('access', data.access)
      return true
    } catch {
      logout()
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

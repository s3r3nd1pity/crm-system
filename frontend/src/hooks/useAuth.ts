'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useRefreshToken } from './useRefreshToken'

interface IUser {
  id: number
  email: string
  role: string
}

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get<IUser>('http://localhost:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(res.data)
      } catch {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const newToken = await useRefreshToken()
        if (newToken) {
          const res = await axios.get<IUser>('http://localhost:8000/api/users/me/', {
            headers: { Authorization: `Bearer ${newToken}` },
          })
          setUser(res.data)
        } else {
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  return { user, loading }
}

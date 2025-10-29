'use client'

import {useEffect, useState} from 'react'
import {usersApi} from '@/services/users.api.services'

interface IUser {
  id: number
  email: string
  role: string
  last_name?: string
}

export const useUser = () => {
  const [user, setUser] = useState<IUser | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await usersApi.getCurrentUser()
        setUser(data)
      } catch {
        setUser(null)
      }
    }
    load()
  }, [])

  return user
}

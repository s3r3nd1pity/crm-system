'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usersApi } from '@/services/users.api.services'

export const useRedirectAuth = () => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const currentPath = pathname
    const access = localStorage.getItem('access')
    const refresh = localStorage.getItem('refresh')

    if (currentPath === '/login') {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      return
    }

    if (!access || !refresh) {
      router.replace('/login')
      return
    }

    const run = async () => {
      try {
        await usersApi.getCurrentUser()
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        router.replace('/login')
      }
    }
    run()

    const expiresIn = 60 * 60 * 1000
    const timer = setTimeout(() => {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      router.replace('/login?expSession=true')
    }, expiresIn)

    return () => clearTimeout(timer)
  }, [router, pathname.toString()])
}


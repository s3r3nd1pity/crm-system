'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginFormComponent } from '@/components/auth/LoginFormComponent'

export default function LoginPage() {
  const { user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (user) router.replace('/orders')
  }, [user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-pink-50">
      <LoginFormComponent />
    </div>
  )
}





'use client'

import { useRedirectAuth } from '@/hooks/useRedirectAuth'
import { LoginFormComponent } from '@/components/auth/LoginFormComponent'

export default function LoginPage() {
  useRedirectAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-pink-50">
      <LoginFormComponent />
    </div>
  )
}




'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

export const HeaderComponent = () => {
  const router = useRouter()
  const { user, logout } = useAuthContext()

  const handleLogoClick = () => {
    router.push('/orders')
  }

  const handleAdminClick = () => {
    router.push('/admin')
  }

  return (
    <header className="flex justify-between items-center bg-pink-200 px-6 py-3 text-pink-900 shadow">
      <div
        onClick={handleLogoClick}
        className="text-lg font-bold cursor-pointer hover:text-pink-700 transition"
      >
        Logo
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'admin' ? (
          <>
            <span className="text-sm font-semibold">admin</span>
            <button onClick={handleAdminClick}>
              <img
                src="/icons/admin.png"
                alt="Admin"
                className="w-10 h-10 hover:opacity-80 transition"
              />
            </button>
          </>
        ) : (
          <span className="text-sm font-semibold">{user?.email?.split('@')[0]}</span>
        )}

        <button onClick={logout}>
          <img
            src="/icons/logout.png"
            alt="Logout"
            className="w-10 h-10 hover:opacity-80 transition"
          />
        </button>
      </div>
    </header>
  )
}



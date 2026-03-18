'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { OrdersComponent } from '@/components/orders/OrdersComponent'

export default function OrdersPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <main className="min-h-screen bg-pink-50">
      <OrdersComponent />
    </main>
  )
}



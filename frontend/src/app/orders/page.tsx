'use client'

import { useRedirectAuth } from '@/hooks/useRedirectAuth'
import { OrdersComponent } from '@/components/orders/OrdersComponent'

export default function OrdersPage() {
  useRedirectAuth()

  return (
    <main className="min-h-screen bg-pink-50">
      <OrdersComponent />
    </main>
  )
}


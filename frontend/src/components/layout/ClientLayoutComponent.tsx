'use client'

import { usePathname } from 'next/navigation'
import { HeaderComponent } from '@/components/layout/HeaderComponent'

export const ClientLayoutComponent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const hideHeader = pathname === '/login' ||
  pathname.startsWith('/activate') ||
  pathname.startsWith('/recovery')


  return (
    <>
      {!hideHeader && <HeaderComponent />}
      {children}
    </>
  )
}

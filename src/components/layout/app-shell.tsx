'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileNav } from './mobile-nav'
import type { UserRole } from '@/lib/auth'

interface AppShellProps {
  children: React.ReactNode
  userName: string
  userRole: UserRole
  onLogout: () => void
}

export function AppShell({ children, userName, userRole, onLogout }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleOpenMobileNav = useCallback(() => {
    setMobileNavOpen(true)
  }, [])

  const handleCloseMobileNav = useCallback(() => {
    setMobileNavOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar userRole={userRole} />

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={handleCloseMobileNav}
        userName={userName}
        userRole={userRole}
      />

      {/* Main content area */}
      <div className="md:pl-64">
        <Header
          userName={userName}
          userRole={userRole}
          onMenuClick={handleOpenMobileNav}
          onLogout={onLogout}
        />

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

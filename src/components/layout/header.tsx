'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { NotificationsMenu } from './notifications-menu'
import type { UserRole } from '@/lib/auth'

interface HeaderProps {
  userName: string
  userRole: UserRole
  onMenuClick: () => void
  onLogout: () => void
}

export function Header({ userName, userRole, onMenuClick, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-[0_1px_15px_oklch(0.65_0.29_336_/_0.08)]">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Deschide meniu</span>
      </Button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-subtle">
          <span className="text-primary-foreground font-bold text-sm">LZ</span>
        </div>
        <span className="font-display font-bold text-lg text-glow text-primary">LaserZone</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationsMenu />
        <UserMenu userName={userName} userRole={userRole} onLogout={onLogout} />
      </div>
    </header>
  )
}

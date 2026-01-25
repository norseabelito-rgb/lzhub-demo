'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getNavItemsForRole } from './nav-items'
import type { UserRole } from '@/lib/auth'

interface SidebarProps {
  userRole: UserRole
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItemsForRole(userRole)

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex flex-col flex-1 min-h-0 bg-sidebar border-r border-sidebar-border shadow-[1px_0_15px_oklch(0.65_0.29_336_/_0.05)]">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-subtle">
              <span className="text-primary-foreground font-bold text-sm">LZ</span>
            </div>
            <span className="font-display font-bold text-xl text-glow text-primary">
              LaserZone
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary border-l-2 border-primary glow-subtle'
                    : 'text-sidebar-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Version footer */}
        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary/80">LaserZone Hub</span> v0.1.0
          </p>
        </div>
      </div>
    </aside>
  )
}

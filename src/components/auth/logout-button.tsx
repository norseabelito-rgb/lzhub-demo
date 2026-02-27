'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  /** Show text label alongside icon */
  showLabel?: boolean
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
  /** Additional class names */
  className?: string
}

export function LogoutButton({
  showLabel = false,
  variant = 'ghost',
  size = showLabel ? 'default' : 'icon',
  className,
}: LogoutButtonProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      title="Deconectare"
    >
      <LogOut className="size-4" />
      {showLabel && <span>Deconectare</span>}
    </Button>
  )
}

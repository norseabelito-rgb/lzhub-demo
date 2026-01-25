'use client'

/**
 * DriveConnect - OAuth connect/disconnect UI
 * Simulates Google Drive connection flow for prototype
 */

import { Cloud, Check, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ============================================================================
// Types
// ============================================================================

export interface DriveConnectProps {
  /** Whether user is connected to Google Drive */
  isConnected: boolean
  /** Called when user clicks Connect */
  onConnect: () => void
  /** Called when user clicks Disconnect */
  onDisconnect: () => void
}

// ============================================================================
// Component
// ============================================================================

/**
 * DriveConnect - OAuth connection UI
 *
 * States:
 * - Not connected: Shows "Connect Google Drive" button
 * - Connected: Shows green badge with disconnect dropdown
 *
 * For prototype: Connection is instant (no actual OAuth)
 */
export function DriveConnect({
  isConnected,
  onConnect,
  onDisconnect,
}: DriveConnectProps) {
  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-green-500 hover:text-green-600"
          >
            <Check className="h-4 w-4" />
            <span>Connected</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={onDisconnect}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button size="sm" onClick={onConnect} className="gap-2">
      <Cloud className="h-4 w-4" />
      <span>Connect Google Drive</span>
    </Button>
  )
}

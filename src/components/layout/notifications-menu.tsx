'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock notifications for placeholder
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Checklist nou disponibil',
    description: 'Checklist-ul pentru deschidere a fost actualizat.',
    time: 'Acum 5 min',
    unread: true,
  },
  {
    id: '2',
    title: 'Tura ta incepe in curand',
    description: 'Tura de maine dimineata incepe la 09:00.',
    time: 'Acum 1 ora',
    unread: true,
  },
  {
    id: '3',
    title: 'Document nou adaugat',
    description: 'Un fisier nou a fost adaugat in Drive.',
    time: 'Ieri',
    unread: false,
  },
]

export function NotificationsMenu() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificari</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificari</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} noi
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Nu ai notificari noi
          </div>
        ) : (
          MOCK_NOTIFICATIONS.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium text-sm">{notification.title}</span>
                {notification.unread && (
                  <span className="h-2 w-2 rounded-full bg-primary ml-auto" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.description}
              </p>
              <p className="text-xs text-muted-foreground/70">{notification.time}</p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

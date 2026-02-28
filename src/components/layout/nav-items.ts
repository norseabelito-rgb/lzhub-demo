import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  UserPlus,
  FolderOpen,
  Share2,
  QrCode,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/lib/auth'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
  /** Indent level for sub-items */
  indent?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['angajat', 'manager'],
  },
  {
    label: 'Checklists',
    href: '/checklists',
    icon: ClipboardCheck,
    roles: ['angajat', 'manager'],
  },
  {
    label: 'Scaneaza QR',
    href: '/checklists/scan',
    icon: QrCode,
    roles: ['angajat', 'manager'],
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    roles: ['angajat', 'manager'],
  },
  {
    label: 'Avertismente',
    href: '/warnings',
    icon: AlertTriangle,
    roles: ['manager'],
  },
  {
    label: 'Onboarding',
    href: '/onboarding',
    icon: UserPlus,
    roles: ['angajat', 'manager'],
  },
  {
    label: 'Onboarding Admin',
    href: '/onboarding/admin',
    icon: Users,
    roles: ['manager'],
    indent: true,
  },
  {
    label: 'Onboarding Config',
    href: '/onboarding/config',
    icon: Settings,
    roles: ['manager'],
    indent: true,
  },
  {
    label: 'Drive',
    href: '/drive',
    icon: FolderOpen,
    roles: ['angajat', 'manager'],
  },
  {
    label: 'Social Media',
    href: '/social',
    icon: Share2,
    roles: ['angajat', 'manager'],
  },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export type { UserRole }

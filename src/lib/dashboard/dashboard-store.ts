'use client'

import { create } from 'zustand'
import { api } from '@/lib/api-client'

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: string
}

export interface TodayTask {
  id: string
  title: string
  description?: string
  type: 'checklist' | 'onboarding' | 'reservation' | 'warning'
  priority: 'high' | 'medium' | 'low'
  dueTime?: string
  completed: boolean
}

export interface QuickAction {
  id: string
  label: string
  href: string
  icon: string
  description?: string
}

export interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  time: string
  type: 'checklist' | 'reservation' | 'onboarding' | 'warning' | 'login'
}

// ============================================================================
// Static Quick Actions (not from API - pure UI config)
// ============================================================================

export const MANAGER_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-1',
    label: 'Adauga rezervare',
    href: '/calendar?action=new',
    icon: 'Calendar',
    description: 'Rezervare noua din telefon',
  },
  {
    id: 'qa-2',
    label: 'Vezi checklisturi',
    href: '/checklists',
    icon: 'CheckSquare',
    description: 'Status completare azi',
  },
  {
    id: 'qa-3',
    label: 'Onboarding status',
    href: '/onboarding',
    icon: 'GraduationCap',
    description: 'Angajati noi in training',
  },
  {
    id: 'qa-4',
    label: 'Programeaza postare',
    href: '/social?action=new',
    icon: 'Share2',
    description: 'Social media',
  },
]

export const EMPLOYEE_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-1',
    label: 'Checklisturile mele',
    href: '/checklists',
    icon: 'CheckSquare',
    description: 'Task-uri de completat',
  },
  {
    id: 'qa-2',
    label: 'Calendar rezervari',
    href: '/calendar',
    icon: 'Calendar',
    description: 'Vezi rezervarile de azi',
  },
  {
    id: 'qa-3',
    label: 'Poze din Drive',
    href: '/drive',
    icon: 'FolderOpen',
    description: 'Acceseaza pozele',
  },
]

// ============================================================================
// Store
// ============================================================================

interface DashboardState {
  stats: DashboardStats[]
  activities: ActivityItem[]
  isLoadingStats: boolean
  isLoadingActivity: boolean
  error: string | null
}

interface DashboardActions {
  fetchStats: () => Promise<void>
  fetchActivity: () => Promise<void>
  clearError: () => void
}

export type DashboardStore = DashboardState & DashboardActions

export const useDashboardStore = create<DashboardStore>()((set) => ({
  stats: [],
  activities: [],
  isLoadingStats: false,
  isLoadingActivity: false,
  error: null,

  fetchStats: async () => {
    set({ isLoadingStats: true, error: null })
    try {
      const data = await api<{ stats: DashboardStats[] }>('/api/dashboard/stats')
      set({ stats: data.stats, isLoadingStats: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la incarcarea statisticilor',
        isLoadingStats: false,
      })
    }
  },

  fetchActivity: async () => {
    set({ isLoadingActivity: true, error: null })
    try {
      const data = await api<ActivityItem[]>('/api/dashboard/activity')
      set({ activities: data, isLoadingActivity: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Eroare la incarcarea activitatii',
        isLoadingActivity: false,
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

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

// Manager dashboard stats
export const MANAGER_STATS: DashboardStats[] = [
  {
    label: 'Angajati activi azi',
    value: 8,
    change: '+2 fata de ieri',
    changeType: 'positive',
  },
  {
    label: 'Checklisturi completate',
    value: '12/15',
    change: '80%',
    changeType: 'neutral',
  },
  {
    label: 'Rezervari azi',
    value: 23,
    change: '+5 noi',
    changeType: 'positive',
  },
  {
    label: 'Onboarding in asteptare',
    value: 2,
    changeType: 'neutral',
  },
]

// Employee dashboard stats
export const EMPLOYEE_STATS: DashboardStats[] = [
  {
    label: 'Task-uri de azi',
    value: 5,
    change: '2 completate',
    changeType: 'neutral',
  },
  {
    label: 'Checklisturi',
    value: '1/2',
    change: '50%',
    changeType: 'neutral',
  },
  {
    label: 'Ture saptamana asta',
    value: 4,
    changeType: 'neutral',
  },
]

// Today's tasks for manager
export const MANAGER_TODAY_TASKS: TodayTask[] = [
  {
    id: 'task-1',
    title: 'Aproba onboarding Andrei Marin',
    description: 'A finalizat video-ul de training',
    type: 'onboarding',
    priority: 'high',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Verifica checklistul de deschidere',
    description: 'Tura dimineata',
    type: 'checklist',
    priority: 'high',
    dueTime: '10:00',
    completed: true,
  },
  {
    id: 'task-3',
    title: 'Rezervare VIP - petrecere corporate',
    description: '15 persoane, ora 18:00',
    type: 'reservation',
    priority: 'medium',
    dueTime: '18:00',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Review avertisment Ion Vasile',
    description: 'Intarziere repetata',
    type: 'warning',
    priority: 'medium',
    completed: false,
  },
]

// Today's tasks for employee
export const EMPLOYEE_TODAY_TASKS: TodayTask[] = [
  {
    id: 'task-1',
    title: 'Checklist deschidere locatie',
    description: 'Verifica echipamentele si curatenia',
    type: 'checklist',
    priority: 'high',
    dueTime: '10:00',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Checklist inchidere locatie',
    description: 'Oprire sisteme si securizare',
    type: 'checklist',
    priority: 'high',
    dueTime: '22:00',
    completed: false,
  },
]

// Quick actions for manager
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

// Quick actions for employee
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

// Recent activity (for manager view)
export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    user: 'Elena Dumitrescu',
    action: 'a completat',
    target: 'Checklist deschidere',
    time: 'Acum 10 min',
    type: 'checklist',
  },
  {
    id: 'act-2',
    user: 'Ion Vasile',
    action: 'a adaugat',
    target: 'Rezervare petrecere',
    time: 'Acum 25 min',
    type: 'reservation',
  },
  {
    id: 'act-3',
    user: 'Andrei Marin',
    action: 'a finalizat',
    target: 'Video training',
    time: 'Acum 1 ora',
    type: 'onboarding',
  },
  {
    id: 'act-4',
    user: 'Maria Ionescu',
    action: 's-a autentificat',
    target: '',
    time: 'Acum 2 ore',
    type: 'login',
  },
]

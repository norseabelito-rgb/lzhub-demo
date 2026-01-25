/**
 * Employee mock data for LaserZone Hub
 * Extends auth mock users with shift assignment information
 */

export type ShiftType = 'dimineata' | 'seara' | null

export interface Employee {
  id: string
  name: string
  email: string
  role: 'manager' | 'angajat'
  shiftType: ShiftType
  avatar?: string
  isNew?: boolean
}

/**
 * Mock employees based on auth mock users
 * Extended with shift assignments for checklist system
 */
export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Alexandru Popescu',
    email: 'manager@laserzone.ro',
    role: 'manager',
    shiftType: null, // Managers don't have fixed shifts
  },
  {
    id: '2',
    name: 'Maria Ionescu',
    email: 'maria@laserzone.ro',
    role: 'manager',
    shiftType: null, // Managers don't have fixed shifts
  },
  {
    id: '3',
    name: 'Ion Vasile',
    email: 'angajat@laserzone.ro',
    role: 'angajat',
    shiftType: 'dimineata', // Morning shift
  },
  {
    id: '4',
    name: 'Elena Dumitrescu',
    email: 'elena@laserzone.ro',
    role: 'angajat',
    shiftType: 'seara', // Evening shift
  },
  {
    id: '5',
    name: 'Andrei Marin',
    email: 'nou@laserzone.ro',
    role: 'angajat',
    shiftType: 'dimineata', // Morning shift
    isNew: true,
  },
]

/**
 * Get employees by shift type
 */
export function getEmployeesByShift(shiftType: ShiftType): Employee[] {
  if (shiftType === null) {
    return MOCK_EMPLOYEES.filter((e) => e.shiftType === null)
  }
  return MOCK_EMPLOYEES.filter((e) => e.shiftType === shiftType)
}

/**
 * Get employee by ID
 */
export function getEmployeeById(id: string): Employee | undefined {
  return MOCK_EMPLOYEES.find((e) => e.id === id)
}

/**
 * Get all non-manager employees
 */
export function getStaffEmployees(): Employee[] {
  return MOCK_EMPLOYEES.filter((e) => e.role === 'angajat')
}

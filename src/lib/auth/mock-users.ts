import type { User, LoginCredentials } from './types'

/**
 * Mock users for development and testing
 * In production, this would be replaced with actual database queries
 */

interface MockUserWithPassword extends User {
  password: string
}

export const mockUsers: MockUserWithPassword[] = [
  {
    id: '1',
    email: 'manager@laserzone.ro',
    password: 'manager123',
    name: 'Alexandru Popescu',
    role: 'manager',
    avatar: undefined,
    isNew: false,
  },
  {
    id: '2',
    email: 'maria@laserzone.ro',
    password: 'maria123',
    name: 'Maria Ionescu',
    role: 'manager',
    avatar: undefined,
    isNew: false,
  },
  {
    id: '3',
    email: 'angajat@laserzone.ro',
    password: 'angajat123',
    name: 'Ion Vasile',
    role: 'angajat',
    avatar: undefined,
    isNew: false,
  },
  {
    id: '4',
    email: 'elena@laserzone.ro',
    password: 'elena123',
    name: 'Elena Dumitrescu',
    role: 'angajat',
    avatar: undefined,
    isNew: false,
  },
  {
    id: '5',
    email: 'nou@laserzone.ro',
    password: 'nou123',
    name: 'Andrei Marin',
    role: 'angajat',
    avatar: undefined,
    isNew: true,
    startDate: new Date(), // Started today
  },
]

/**
 * Authenticate a user with mock credentials
 * Simulates async database lookup with slight delay
 */
export async function authenticateMockUser(
  credentials: LoginCredentials
): Promise<{ success: true; user: User } | { success: false; error: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const { email, password } = credentials
  const normalizedEmail = email.toLowerCase().trim()

  const mockUser = mockUsers.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  )

  if (!mockUser) {
    return {
      success: false,
      error: 'Email sau parola incorecta',
    }
  }

  // Return user without password
  const { password: _pass, ...user } = mockUser

  return {
    success: true,
    user,
  }
}

/**
 * Get mock user by ID (for session restoration)
 */
export function getMockUserById(id: string): User | null {
  const mockUser = mockUsers.find((u) => u.id === id)
  if (!mockUser) return null

  const { password: _pwd, ...user } = mockUser
  return user
}

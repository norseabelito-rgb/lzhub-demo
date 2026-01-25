import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Autentificare | LaserZone Hub',
  description: 'Autentificati-va pentru a accesa platforma LaserZone Hub',
}

export default function LoginPage() {
  return <LoginForm />
}

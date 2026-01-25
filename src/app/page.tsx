import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect root to dashboard
  // AuthGuard in dashboard layout will redirect to login if not authenticated
  redirect('/dashboard')
}

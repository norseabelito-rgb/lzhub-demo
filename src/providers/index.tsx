'use client'

import { Toaster } from 'sonner'
import { AuthProvider } from './auth-provider'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Combined providers wrapper for the application
 * Add additional providers here as needed (theme, query client, etc.)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
      />
    </AuthProvider>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/auth'
import { WarningsDashboard } from '@/components/warnings/warnings-dashboard'
import { WarningModal } from '@/components/warnings'

/**
 * Main warnings dashboard page
 * Manager-only: redirects employees to /dashboard
 */
export default function WarningsPage() {
  const router = useRouter()
  const { user, isManager } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  // Manager-only check
  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    )
  }

  if (!isManager) {
    // Redirect employees to dashboard
    router.replace('/dashboard')
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Redirectionare...</p>
      </div>
    )
  }

  // Handle employee selection - navigate to employee history page
  const handleSelectEmployee = (employeeId: string) => {
    router.push(`/warnings/${employeeId}`)
  }

  // Handle create warning - open modal
  const handleCreateWarning = () => {
    setSelectedEmployeeId(null)
    setModalOpen(true)
  }

  return (
    <div className="container py-6">
      <WarningsDashboard
        onSelectEmployee={handleSelectEmployee}
        onCreateWarning={handleCreateWarning}
      />

      {/* Warning creation modal */}
      <WarningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        preselectedEmployeeId={selectedEmployeeId ?? undefined}
      />
    </div>
  )
}

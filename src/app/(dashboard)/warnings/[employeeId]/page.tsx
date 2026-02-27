'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'

import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api-client'
import { useWarningStore } from '@/lib/warnings'
import type { Warning } from '@/lib/warnings'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WarningTimeline, DisciplineStepper, WarningModal, SignatureDisplay } from '@/components/warnings'

interface ApiEmployee {
  id: string
  name: string
  email: string
  role: string
}

/**
 * Employee warning history page
 * Manager-only: redirects employees to /dashboard
 * Shows timeline of all warnings for a specific employee
 */
export default function EmployeeWarningsPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.employeeId as string
  const { user, isManager } = useAuth()

  const {
    getWarningsForEmployee,
    getCurrentLevel,
    clearWarning,
    fetchWarnings,
    warnings,
  } = useWarningStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [detailWarning, setDetailWarning] = useState<Warning | null>(null)
  const [employee, setEmployee] = useState<ApiEmployee | null>(null)
  const [employeeLoading, setEmployeeLoading] = useState(true)

  // Fetch employee info from API
  useEffect(() => {
    let cancelled = false
    setEmployeeLoading(true)
    api<ApiEmployee>(`/api/employees/${employeeId}`)
      .then((data) => {
        if (!cancelled) setEmployee(data)
      })
      .catch(() => {
        if (!cancelled) setEmployee(null)
      })
      .finally(() => {
        if (!cancelled) setEmployeeLoading(false)
      })
    return () => { cancelled = true }
  }, [employeeId])

  // Fetch warnings if not loaded
  useEffect(() => {
    if (warnings.length === 0) {
      fetchWarnings()
    }
  }, [warnings.length, fetchWarnings])

  // Get warnings for this employee
  const employeeWarnings = useMemo(() => {
    return getWarningsForEmployee(employeeId)
  }, [employeeId, getWarningsForEmployee, warnings])

  // Get current discipline level
  const currentLevel = useMemo(() => {
    return getCurrentLevel(employeeId)
  }, [employeeId, getCurrentLevel, warnings])

  // Manager-only check
  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    )
  }

  if (!isManager) {
    router.replace('/dashboard')
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Redirectionare...</p>
      </div>
    )
  }

  // Loading state
  if (employeeLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se incarca...</p>
      </div>
    )
  }

  // Employee not found
  if (!employee) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground mb-4">
            Angajatul nu a fost gasit
          </p>
          <Button asChild variant="outline">
            <Link href="/warnings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Inapoi la avertismente
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Handle view detail
  const handleViewDetail = (warning: Warning) => {
    setDetailWarning(warning)
  }

  // Handle clear warning
  const handleClearWarning = async (warningId: string, reason: string) => {
    if (user) {
      await clearWarning(warningId, user.id, reason)
    }
  }

  // Handle create warning
  const handleCreateWarning = () => {
    setModalOpen(true)
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/warnings">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Istoric Avertismente - {employee.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {employee.email}
            </p>
          </div>
        </div>

        <Button onClick={handleCreateWarning}>
          <Plus className="h-4 w-4 mr-2" />
          Avertisment Nou
        </Button>
      </div>

      {/* Discipline stepper - current level */}
      <div className="rounded-lg border p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          Nivel disciplina curent
        </h2>
        <DisciplineStepper
          currentLevel={currentLevel}
          className="max-w-xl"
        />
      </div>

      {/* Timeline */}
      <div className="rounded-lg border p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          Istoricul avertismentelor
        </h2>
        <WarningTimeline
          warnings={employeeWarnings}
          onViewDetail={handleViewDetail}
          onClearWarning={handleClearWarning}
          showClearOption={true}
        />
      </div>

      {/* Warning creation modal */}
      <WarningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        preselectedEmployeeId={employeeId}
      />

      {/* Warning detail dialog */}
      <Dialog open={!!detailWarning} onOpenChange={() => setDetailWarning(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalii Avertisment</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDetailWarning(null)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {detailWarning && (
            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Angajat</p>
                  <p className="font-medium">{detailWarning.employeeName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Manager</p>
                  <p className="font-medium">{detailWarning.managerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nivel</p>
                  <p className="font-medium capitalize">{detailWarning.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Categorie</p>
                  <p className="font-medium">{detailWarning.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data incident</p>
                  <p className="font-medium">
                    {new Date(detailWarning.incidentDate).toLocaleDateString('ro-RO')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">
                    {detailWarning.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Descriere</p>
                <p className="text-sm">{detailWarning.description}</p>
              </div>

              {/* Witness */}
              {detailWarning.witness && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Martor</p>
                  <p className="text-sm">{detailWarning.witness}</p>
                </div>
              )}

              {/* Manager signature */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Semnatura manager</p>
                <SignatureDisplay
                  dataUrl={detailWarning.managerSignature.dataUrl}
                  signerName={detailWarning.managerSignature.signerName}
                  signedAt={detailWarning.managerSignature.signedAt}
                  className="max-w-[250px]"
                />
              </div>

              {/* Employee acknowledgment */}
              {detailWarning.acknowledgment && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Confirmare angajat</p>

                  {detailWarning.acknowledgment.signature && (
                    <SignatureDisplay
                      dataUrl={detailWarning.acknowledgment.signature.dataUrl}
                      signerName={detailWarning.acknowledgment.signature.signerName}
                      signedAt={detailWarning.acknowledgment.signature.signedAt}
                      className="max-w-[250px]"
                    />
                  )}

                  {detailWarning.acknowledgment.refusedToSign && (
                    <div className="text-sm text-destructive">
                      <p>Refuzat sa semneze</p>
                      {detailWarning.acknowledgment.refusedWitnessedBy && (
                        <p className="text-muted-foreground">
                          Martor: {detailWarning.acknowledgment.refusedWitnessedBy}
                        </p>
                      )}
                    </div>
                  )}

                  {detailWarning.acknowledgment.employeeComments && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Comentarii angajat:</p>
                      <p className="text-sm">{detailWarning.acknowledgment.employeeComments}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cleared info */}
              {detailWarning.isCleared && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    Avertisment sters
                  </p>
                  <p className="text-sm">{detailWarning.clearedReason}</p>
                  {detailWarning.clearedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sters la: {new Date(detailWarning.clearedAt).toLocaleDateString('ro-RO')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

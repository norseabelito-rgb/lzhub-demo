'use client'

import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
import { useWarningStore, type Signature } from '@/lib/warnings'
import { WarningForm, type WarningFormData } from './warning-form'

// ============================================================================
// Types
// ============================================================================

export interface WarningModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Pre-selected employee ID (when opening from employee view) */
  preselectedEmployeeId?: string
  /** Callback after successful warning creation */
  onSuccess?: () => void
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modal wrapper for warning creation
 * Handles form submission and success feedback
 */
export function WarningModal({
  open,
  onOpenChange,
  preselectedEmployeeId,
  onSuccess,
}: WarningModalProps) {
  const { user } = useAuth()
  const createWarning = useWarningStore((state) => state.createWarning)

  // Handle form submission
  const handleSubmit = async (data: WarningFormData) => {
    if (!user) {
      toast.error('Trebuie sa fii autentificat pentru a crea avertismente')
      return
    }

    // Create manager signature object
    const managerSignature: Signature = {
      dataUrl: data.managerSignature,
      signedAt: new Date(),
      signedBy: user.id,
      signerName: user.name,
      signerRole: 'manager',
    }

    try {
      // The API resolves the employee name from employeeId
      await createWarning({
        employeeId: data.employeeId,
        employeeName: '', // API resolves from employeeId
        managerId: user.id,
        managerName: user.name,
        level: data.level,
        category: data.category,
        description: data.description,
        incidentDate: data.incidentDate,
        witness: data.witness,
        managerSignature,
        status: 'pending_acknowledgment',
        isCleared: false,
      })

      // Success feedback
      toast.success('Avertisment inregistrat')

      // Close modal and notify success
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Eroare la crearea avertismentului. Incearca din nou.')
    }
  }

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false)
  }

  // Don't render if no user
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avertisment Nou</DialogTitle>
          <DialogDescription>
            Creaza un nou avertisment pentru un angajat. Toate campurile marcate cu * sunt obligatorii.
          </DialogDescription>
        </DialogHeader>

        <WarningForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          managerId={user.id}
          managerName={user.name}
          preselectedEmployeeId={preselectedEmployeeId}
        />
      </DialogContent>
    </Dialog>
  )
}

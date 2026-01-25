'use client'

import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuthStore, mockUsers } from '@/lib/auth'
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
  const user = useAuthStore((state) => state.user)
  const createWarning = useWarningStore((state) => state.createWarning)

  // Handle form submission
  const handleSubmit = (data: WarningFormData) => {
    if (!user) {
      toast.error('Trebuie sa fii autentificat pentru a crea avertismente')
      return
    }

    // Get employee name for denormalization
    const employee = mockUsers.find((u) => u.id === data.employeeId)
    if (!employee) {
      toast.error('Angajatul nu a fost gasit')
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

    // Create the warning
    createWarning({
      employeeId: data.employeeId,
      employeeName: employee.name,
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
    toast.success('Avertisment inregistrat', {
      description: `Avertisment ${data.level} pentru ${employee.name} a fost creat.`,
    })

    // Close modal and notify success
    onOpenChange(false)
    onSuccess?.()
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

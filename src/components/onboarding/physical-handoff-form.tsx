'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { useOnboardingStore } from '@/lib/onboarding'
import { SignatureCanvas } from '@/components/warnings'
import { toast } from 'sonner'
import { Package, FileText, Key, Shield, CheckCircle } from 'lucide-react'

interface PhysicalHandoffFormProps {
  employeeId: string
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * List of physical items being handed over to the employee
 */
const HANDOFF_ITEMS = [
  { id: 'key', icon: Key, label: 'Cheie acces cladire' },
  { id: 'uniform', icon: Shield, label: 'Uniforma completa (2 seturi)' },
  { id: 'badge', icon: FileText, label: 'Ecuson cu nume' },
  { id: 'locker', icon: Package, label: 'Cheie dulapior personal' },
]

/**
 * Dialog for manager to mark physical document/equipment handoff
 * Captures manager signature as proof of handoff
 */
export function PhysicalHandoffForm({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: PhysicalHandoffFormProps) {
  const { user } = useAuth()
  const managerMarkHandoff = useOnboardingStore((state) => state.managerMarkHandoff)
  const loadProgress = useOnboardingStore((state) => state.loadProgress)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl)
  }

  const handleSignatureClear = () => {
    setSignatureDataUrl(null)
  }

  const handleSubmit = async () => {
    if (!signatureDataUrl || !user) return

    setIsSubmitting(true)

    try {
      // Load the employee's progress first to make sure we have the right one
      loadProgress(employeeId)

      // Mark handoff with manager signature
      managerMarkHandoff({
        dataUrl: signatureDataUrl,
        signedBy: user.id,
        signerName: user.name,
      })

      toast.success('Predare marcata cu succes', {
        description: `Echipamentele au fost predate catre ${employeeName}`,
      })

      // Reset and close
      setSignatureDataUrl(null)
      onOpenChange(false)
    } catch (error) {
      toast.error('Eroare la marcarea predarii', {
        description: 'Va rugam incercati din nou',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSignatureDataUrl(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Predare Documente Fizice
          </DialogTitle>
          <DialogDescription>
            Confirma predarea documentelor si echipamentelor catre{' '}
            <span className="font-medium text-foreground">{employeeName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Items being handed over */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Echipamente predate:</p>
            <div className="space-y-2">
              {HANDOFF_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3"
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                  <CheckCircle className="ml-auto size-4 text-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Manager signature */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Semnatura manager:</p>
            <p className="text-xs text-muted-foreground">
              Prin semnatura de mai jos confirm ca am predat echipamentele enumerate
              angajatului {employeeName}.
            </p>
            <SignatureCanvas
              onSave={handleSignatureSave}
              onClear={handleSignatureClear}
              label=""
              width={350}
              height={150}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Anuleaza
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!signatureDataUrl || isSubmitting}
          >
            {isSubmitting ? 'Se salveaza...' : 'Confirm si semnez'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { PhysicalHandoffFormProps }

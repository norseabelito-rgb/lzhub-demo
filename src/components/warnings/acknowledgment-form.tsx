'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SignatureCanvas } from './signature-canvas'
import { useWarningStore } from '@/lib/warnings/warning-store'
import {
  type Warning,
  type Signature,
  VIOLATION_CATEGORY_LABELS,
  DISCIPLINE_LEVEL_LABELS,
} from '@/lib/warnings'
import type { User } from '@/lib/auth/types'

export interface AcknowledgmentFormProps {
  /** Warning being acknowledged */
  warning: Warning
  /** Current logged-in user (employee or manager) */
  currentUser: User
  /** Callback after acknowledgment completes */
  onComplete: () => void
  /** Additional CSS classes */
  className?: string
}

/** Get badge classes for discipline level */
function getLevelBadgeClasses(level: Warning['level']): string {
  switch (level) {
    case 'verbal':
      return 'bg-accent text-accent-foreground'
    case 'written':
      return 'bg-amber-500 text-white'
    case 'final':
      return 'bg-orange-500 text-white'
    case 'termination':
      return 'bg-destructive text-destructive-foreground'
  }
}

/**
 * Acknowledgment form for employee warnings
 *
 * Two modes:
 * - Employee mode: Sign to acknowledge receipt
 * - Manager mode: Can mark "refuses to sign" with witness or hand device to employee for signing
 */
export function AcknowledgmentForm({
  warning,
  currentUser,
  onComplete,
  className,
}: AcknowledgmentFormProps) {
  // State
  const [employeeComments, setEmployeeComments] = useState('')
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [refusesToSign, setRefusesToSign] = useState(false)
  const [witnessName, setWitnessName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Store actions
  const acknowledgeWarning = useWarningStore((s) => s.acknowledgeWarning)
  const refuseWarning = useWarningStore((s) => s.refuseWarning)

  // Determine mode
  const isEmployeeMode = currentUser.id === warning.employeeId
  const isManagerMode = currentUser.role === 'manager'

  // Validation
  const canSubmit = () => {
    if (refusesToSign) {
      // Refusal requires witness name
      return witnessName.trim().length > 0
    }
    // Signing requires signature
    return signatureDataUrl !== null
  }

  // Handle signature capture
  const handleSignatureSave = useCallback((dataUrl: string) => {
    setSignatureDataUrl(dataUrl)
  }, [])

  const handleSignatureClear = useCallback(() => {
    setSignatureDataUrl(null)
  }, [])

  // Handle form submission
  const handleSubmit = async () => {
    if (!canSubmit()) return

    setIsSubmitting(true)

    try {
      if (refusesToSign) {
        // Record refusal with witness
        await refuseWarning(warning.id, witnessName.trim())
        toast.success('Refuzul a fost inregistrat')
      } else {
        // Record acknowledgment with signature
        const signature: Signature = {
          dataUrl: signatureDataUrl!,
          signedAt: new Date(),
          signedBy: warning.employeeId, // Always the employee's signature
          signerName: warning.employeeName,
          signerRole: 'angajat',
        }

        await acknowledgeWarning(warning.id, {
          signature,
          refusedToSign: false,
          employeeComments: employeeComments.trim() || undefined,
          acknowledgedAt: new Date(),
        })
        toast.success('Avertismentul a fost confirmat')
      }

      onComplete()
    } catch {
      toast.error('Eroare la procesare. Incearca din nou.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Confirmare Avertisment</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Warning Summary (read-only) */}
        <section className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className={getLevelBadgeClasses(warning.level)}>
              {DISCIPLINE_LEVEL_LABELS[warning.level]}
            </Badge>
            <Badge variant="secondary">
              {VIOLATION_CATEGORY_LABELS[warning.category]}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Angajat: </span>
              <span className="font-medium">{warning.employeeName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data incident: </span>
              <span className="font-medium">
                {format(warning.incidentDate, 'd MMMM yyyy', { locale: ro })}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-muted-foreground block mb-1">Descriere:</span>
              <p className="text-foreground/80 whitespace-pre-wrap line-clamp-3">
                {warning.description}
              </p>
            </div>
          </div>
        </section>

        {/* Acknowledgment instruction */}
        <div className="text-sm text-muted-foreground">
          {isEmployeeMode ? (
            <p>
              Prin semnarea mai jos, confirm ca am primit si inteles acest avertisment.
            </p>
          ) : (
            <p>
              Angajatul trebuie sa semneze pentru confirmare, sau selecteaza optiunea
              de refuz daca angajatul nu doreste sa semneze.
            </p>
          )}
        </div>

        {/* Manager mode: Refusal checkbox */}
        {isManagerMode && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="refuses-to-sign"
              checked={refusesToSign}
              onCheckedChange={(checked) => {
                setRefusesToSign(checked === true)
                if (checked) {
                  setSignatureDataUrl(null)
                }
              }}
            />
            <Label
              htmlFor="refuses-to-sign"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Angajatul refuza sa semneze
            </Label>
          </div>
        )}

        {/* Conditional: Signature canvas OR witness field */}
        {refusesToSign ? (
          <div className="space-y-2">
            <Label htmlFor="witness-name">
              Martor prezent la refuz <span className="text-destructive">*</span>
            </Label>
            <Input
              id="witness-name"
              placeholder="Numele complet al martorului"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Un martor trebuie sa fie prezent cand angajatul refuza sa semneze.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Employee comments (optional) */}
            <div className="space-y-2">
              <Label htmlFor="employee-comments">Comentarii (optional)</Label>
              <Textarea
                id="employee-comments"
                placeholder="Orice comentariu sau clarificare..."
                value={employeeComments}
                onChange={(e) => setEmployeeComments(e.target.value)}
                rows={3}
              />
            </div>

            {/* Signature canvas */}
            <div className="space-y-2">
              <Label>
                Semnatura Angajat <span className="text-destructive">*</span>
              </Label>
              <SignatureCanvas
                label="Semneaza aici"
                onSave={handleSignatureSave}
                onClear={handleSignatureClear}
                width={350}
                height={150}
              />
              {signatureDataUrl && (
                <p className="text-xs text-green-500">Semnatura capturata</p>
              )}
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting
              ? 'Se proceseaza...'
              : refusesToSign
              ? 'Inregistreaza Refuzul'
              : 'Confirma Primirea'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

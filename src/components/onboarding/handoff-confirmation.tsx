'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FileCheck, Clock, Package, Key, Shield, FileText, CheckCircle, User } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboarding'
import { SignatureDisplay } from '@/components/warnings'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'

/**
 * List of physical items that should have been received
 */
const HANDOFF_ITEMS = [
  { id: 'key', icon: Key, label: 'Cheie acces cladire' },
  { id: 'uniform', icon: Shield, label: 'Uniforma completa (2 seturi)' },
  { id: 'badge', icon: FileText, label: 'Ecuson cu nume' },
  { id: 'locker', icon: Package, label: 'Cheie dulapior personal' },
]

/**
 * Employee confirmation of physical document/equipment receipt
 * Shows manager signature and allows employee to confirm receipt
 * Shown when currentStep is 'handoff' or 'confirmation'
 */
export function HandoffConfirmation() {
  const currentProgress = useOnboardingStore((state) => state.currentProgress)
  const employeeConfirmHandoff = useOnboardingStore((state) => state.employeeConfirmHandoff)
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding)
  const [confirmed, setConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if manager has marked handoff
  const handoffMarked = currentProgress?.physicalHandoff?.markedByManager
  const alreadyConfirmed = currentProgress?.physicalHandoff?.confirmedByEmployee
  const managerSignature = currentProgress?.physicalHandoff?.managerSignature

  // If manager hasn't marked yet, show waiting state
  if (!handoffMarked) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-500/10">
            <Clock className="size-8 text-amber-500" />
          </div>
          <CardTitle>In Asteptare</CardTitle>
          <CardDescription className="text-base">
            Managerul trebuie sa marcheze predarea echipamentelor inainte de a continua.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Vei primi o notificare cand managerul va marca predarea.
            Pana atunci, asigura-te ca ai toate echipamentele pregatite.
          </p>
        </CardContent>
      </Card>
    )
  }

  // If already confirmed, show success state
  if (alreadyConfirmed) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="size-8 text-green-500" />
          </div>
          <CardTitle>Predare Confirmata</CardTitle>
          <CardDescription className="text-base">
            Ai confirmat primirea tuturor echipamentelor.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Onboarding-ul tau este aproape complet! Urmeaza pasul final.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleConfirm = async () => {
    if (!confirmed) return

    setIsSubmitting(true)

    try {
      // Confirm handoff
      employeeConfirmHandoff()

      // Complete onboarding
      completeOnboarding()

      toast.success('Primire confirmata!', {
        description: 'Felicitari! Ai finalizat procesul de onboarding.',
      })
    } catch (error) {
      toast.error('Eroare la confirmare', {
        description: 'Va rugam incercati din nou',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <FileCheck className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle>Confirma Primirea Documentelor</CardTitle>
            <CardDescription>
              Verifica ca ai primit toate echipamentele enumerate mai jos
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Manager handoff info */}
        {managerSignature && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Predat de:</span>
              <span className="font-medium">{managerSignature.signerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">La data:</span>
              <span className="font-medium">
                {format(new Date(managerSignature.signedAt), "d MMMM yyyy 'la' HH:mm", {
                  locale: ro,
                })}
              </span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Semnatura manager:</p>
              <SignatureDisplay
                dataUrl={managerSignature.dataUrl}
                signerName={managerSignature.signerName}
                signedAt={new Date(managerSignature.signedAt)}
              />
            </div>
          </div>
        )}

        {/* Items received */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Echipamente primite:</p>
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

        {/* Confirmation checkbox */}
        <div className="flex items-start gap-3 rounded-lg border border-border p-4">
          <Checkbox
            id="confirm-receipt"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(!!checked)}
            disabled={isSubmitting}
          />
          <Label htmlFor="confirm-receipt" className="text-sm leading-relaxed cursor-pointer">
            Confirm ca am primit toate echipamentele fizice enumerate mai sus si ca acestea
            sunt in stare buna de functionare.
          </Label>
        </div>

        {/* Confirm button */}
        <Button
          onClick={handleConfirm}
          disabled={!confirmed || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Se confirma...' : 'Confirm primirea'}
        </Button>
      </CardContent>
    </Card>
  )
}

export type HandoffConfirmationProps = Record<string, never>

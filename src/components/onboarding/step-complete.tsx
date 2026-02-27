'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { PartyPopper, Star, CheckCircle2, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOnboardingStore } from '@/lib/onboarding/onboarding-store'
import { useAuth } from '@/lib/auth'

export interface StepCompleteProps {
  /** Callback when user clicks to go to dashboard */
  onGoToDashboard?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Completion step component for onboarding wizard
 *
 * Celebrates successful completion with:
 * - Confetti animation using canvas-confetti
 * - Welcome message
 * - Summary of completed training
 * - Link to dashboard
 */
export function StepComplete({ onGoToDashboard, className }: StepCompleteProps) {
  const { currentProgress, completeOnboarding } = useOnboardingStore()
  const { markOnboardingComplete } = useAuth()
  const confettiFiredRef = useRef(false)

  // Fire confetti on mount (once)
  useEffect(() => {
    if (confettiFiredRef.current) return
    confettiFiredRef.current = true

    // Mark onboarding as complete if not already
    if (currentProgress && !currentProgress.isComplete) {
      completeOnboarding().then(() => {
        // Sync to auth store - marks user.isNew = false
        if (currentProgress.employeeId) {
          markOnboardingComplete(currentProgress.employeeId)
        }
      })
    }

    // Fire confetti celebration
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 1000,
      colors: ['#d946ef', '#22d3ee', '#f97316', '#84cc16', '#eab308'], // Neon colors
    }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Fire from two sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    // Also fire a burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: defaults.colors,
    })

    return () => clearInterval(interval)
  }, [currentProgress, completeOnboarding, markOnboardingComplete])

  const employeeName = currentProgress?.employeeName ?? 'Nou Coleg'

  return (
    <div className={cn('flex flex-col gap-6 max-w-xl mx-auto', className)}>
      <Card className="overflow-hidden">
        {/* Celebration header with gradient */}
        <div className="relative bg-gradient-to-r from-accent/30 via-purple-500/30 to-accent/30 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,70,239,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.2),transparent_50%)]" />

          <div className="relative flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              <PartyPopper className="w-12 h-12 text-accent" />
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>

        <CardHeader className="text-center pt-6 pb-4">
          <CardTitle className="text-3xl text-primary text-glow glow-intense">Felicitari!</CardTitle>
          <CardDescription className="text-lg text-foreground mt-2">
            Bine ai venit in echipa, {employeeName}!
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Welcome message */}
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              Ai finalizat cu succes toate etapele de onboarding. Esti acum pregatit sa incepi
              lucrul la LaserZone Arena!
            </p>
          </div>

          {/* Completed steps summary */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground text-center">Ai completat:</h4>
            <div className="grid grid-cols-2 gap-3">
              <CompletedItem label="NDA Semnat" />
              <CompletedItem label="Documente Citite" />
              <CompletedItem label="Video Training" />
              <CompletedItem label="Quiz Trecut" />
              <CompletedItem label="Echipamente Primite" />
              <CompletedItem label="Confirmare Finala" />
            </div>
          </div>

          {/* Next steps hint */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
            <Rocket className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Urmatorul pas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Acceseaza dashboard-ul pentru a vedea programul tau si checklist-urile zilnice.
              </p>
            </div>
          </div>

          {/* Go to dashboard button */}
          {onGoToDashboard && (
            <Button onClick={onGoToDashboard} size="lg" variant="glow" className="w-full mt-4">
              <Rocket className="w-4 h-4 mr-2" />
              Mergi la Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CompletedItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-primary/10 transition-colors">
      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

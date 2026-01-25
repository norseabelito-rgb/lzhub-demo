'use client'

import Link from 'next/link'
import { ArrowLeft, Settings, Clock, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AuthGuard } from '@/components/auth/auth-guard'
import { CapacitySettings } from '@/components/calendar'

// ============================================================================
// Page Component
// ============================================================================

function CalendarSettingsContent() {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/calendar">
            <ArrowLeft className="size-5" />
            <span className="sr-only">Inapoi la calendar</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Setari Calendar</h1>
          <p className="text-muted-foreground">
            Configureaza optiunile pentru sistemul de rezervari
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Capacity Settings Section */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Setari Capacitate</h2>
              <p className="text-sm text-muted-foreground">
                Configureaza capacitatea maxima si pragurile de avertizare
              </p>
            </div>
          </div>

          <CapacitySettings />
        </section>

        <Separator />

        {/* Operating Hours Section - Placeholder */}
        <section className="rounded-lg border bg-card/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground">
                Program de Functionare
              </h2>
              <p className="text-sm text-muted-foreground">
                Configureaza orele de deschidere si inchidere
              </p>
            </div>
          </div>
          <div className="rounded-md bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            Aceasta functionalitate va fi disponibila intr-o versiune viitoare.
          </div>
        </section>

        {/* Notification Settings Section - Placeholder */}
        <section className="rounded-lg border bg-card/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Bell className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground">
                Preferinte Notificari
              </h2>
              <p className="text-sm text-muted-foreground">
                Configureaza notificarile pentru rezervari
              </p>
            </div>
          </div>
          <div className="rounded-md bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            Aceasta functionalitate va fi disponibila intr-o versiune viitoare.
          </div>
        </section>
      </div>
    </div>
  )
}

export default function CalendarSettingsPage() {
  return (
    <AuthGuard allowedRoles={['manager']}>
      <CalendarSettingsContent />
    </AuthGuard>
  )
}

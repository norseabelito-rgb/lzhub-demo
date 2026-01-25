'use client'

import { FileText, Key, Shirt, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface StepNotificationProps {
  /** Callback when user acknowledges and proceeds */
  onProceed: () => void
  /** Additional CSS classes */
  className?: string
}

interface NotificationItem {
  icon: React.ReactNode
  title: string
  description: string
}

const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    icon: <Key className="w-6 h-6 text-accent" />,
    title: 'Chei si Carduri Acces',
    description: 'Vei primi cheile si cardul de acces la locatie de la manager.',
  },
  {
    icon: <Shirt className="w-6 h-6 text-accent" />,
    title: 'Uniforma',
    description: 'Uniforma completa (tricou cu logo, pantaloni negri) va fi furnizata.',
  },
  {
    icon: <FileText className="w-6 h-6 text-accent" />,
    title: 'Documente Originale',
    description: 'Contractul de munca si fisa postului vor fi semnate in persoana.',
  },
]

/**
 * Notification step component for onboarding wizard
 *
 * Informs the employee about physical items and documents
 * they will receive when they come to the location.
 * This is an informational step between quiz and handoff.
 */
export function StepNotification({ onProceed, className }: StepNotificationProps) {
  return (
    <div className={cn('flex flex-col gap-6 max-w-xl mx-auto', className)}>
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl">Aproape ai terminat!</CardTitle>
          <CardDescription className="text-base">
            Ai trecut quiz-ul cu succes. Mai sunt doar cativa pasi fizici.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Info header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Urmatorul pas: Predarea echipamentelor
            </h3>
            <p className="text-sm text-muted-foreground">
              Cand vii la locatie, managerul iti va preda urmatoarele:
            </p>
          </div>

          {/* Notification items */}
          <div className="flex flex-col gap-4">
            {NOTIFICATION_ITEMS.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-background flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Important note */}
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
            <p className="text-sm text-center">
              <span className="font-semibold text-accent">Nota importanta:</span>{' '}
              <span className="text-muted-foreground">
                Aceasta etapa va fi completata de manager cand iti preda echipamentele fizice.
              </span>
            </p>
          </div>

          {/* Proceed button */}
          <Button onClick={onProceed} size="lg" className="w-full mt-4">
            Am inteles, continua
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SignatureDisplay } from './signature-display'
import { DisciplineStepper } from './discipline-stepper'
import {
  type Warning,
  VIOLATION_CATEGORY_LABELS,
  DISCIPLINE_LEVEL_LABELS,
  WARNING_STATUS_LABELS,
} from '@/lib/warnings'

export interface WarningDetailProps {
  /** Warning to display */
  warning: Warning
  /** Show acknowledgment action section */
  showAcknowledgmentSection?: boolean
  /** Callback after acknowledgment */
  onAcknowledge?: () => void
  /** Additional CSS classes */
  className?: string
}

/** Get badge variant based on warning status */
function getStatusBadgeVariant(
  status: Warning['status']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending_acknowledgment':
      return 'secondary'
    case 'acknowledged':
      return 'default'
    case 'refused':
      return 'destructive'
    case 'cleared':
      return 'outline'
  }
}

/** Get badge variant based on discipline level */
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
 * Full warning display with all details and signatures
 * Shows complete incident record including manager and employee acknowledgments
 */
export function WarningDetail({
  warning,
  showAcknowledgmentSection = false,
  onAcknowledge,
  className,
}: WarningDetailProps) {
  const hasAcknowledgment = warning.acknowledgment !== undefined
  const wasRefused = warning.acknowledgment?.refusedToSign === true

  return (
    <Card className={className}>
      {/* Header with badges */}
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level badge */}
          <Badge className={getLevelBadgeClasses(warning.level)}>
            {DISCIPLINE_LEVEL_LABELS[warning.level]}
          </Badge>

          {/* Status badge */}
          <Badge variant={getStatusBadgeVariant(warning.status)}>
            {WARNING_STATUS_LABELS[warning.status]}
          </Badge>

          {/* Cleared indicator */}
          {warning.isCleared && (
            <Badge variant="outline" className="border-green-500 text-green-500">
              Anulat
            </Badge>
          )}
        </div>

        <CardTitle className="text-lg">
          {VIOLATION_CATEGORY_LABELS[warning.category]}
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Emis {formatDistanceToNow(warning.createdAt, { addSuffix: true, locale: ro })}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Incident Information Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Informatii Incident
          </h3>

          <div className="grid gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Angajat</span>
              <p className="text-sm font-medium">{warning.employeeName}</p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Categorie</span>
              <p className="text-sm font-medium">
                {VIOLATION_CATEGORY_LABELS[warning.category]}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Data Incident</span>
              <p className="text-sm font-medium">
                {format(warning.incidentDate, 'd MMMM yyyy', { locale: ro })}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Descriere</span>
              <p className="text-sm whitespace-pre-wrap">{warning.description}</p>
            </div>

            {warning.witness && (
              <div>
                <span className="text-xs text-muted-foreground">Martor</span>
                <p className="text-sm font-medium">{warning.witness}</p>
              </div>
            )}
          </div>
        </section>

        <Separator />

        {/* Discipline Level Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Nivel Disciplina
          </h3>

          <DisciplineStepper
            currentLevel={warning.level}
            readonly={true}
            size="sm"
            showLabels={true}
          />
        </section>

        <Separator />

        {/* Manager Signature Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Semnatura Manager
          </h3>

          <SignatureDisplay
            dataUrl={warning.managerSignature.dataUrl}
            signerName={warning.managerSignature.signerName}
            signedAt={warning.managerSignature.signedAt}
            className="max-w-[300px]"
          />
        </section>

        {/* Acknowledgment Section (if acknowledged or refused) */}
        {hasAcknowledgment && (
          <>
            <Separator />

            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Confirmare Angajat
              </h3>

              {wasRefused ? (
                <div className="space-y-3">
                  <Badge variant="destructive" className="text-sm">
                    Refuza sa semneze
                  </Badge>

                  {warning.acknowledgment?.refusedWitnessedBy && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Martor la refuz
                      </span>
                      <p className="text-sm font-medium">
                        {warning.acknowledgment.refusedWitnessedBy}
                      </p>
                    </div>
                  )}

                  {warning.acknowledgment?.refusedAt && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Data refuz
                      </span>
                      <p className="text-sm">
                        {format(
                          warning.acknowledgment.refusedAt,
                          'd MMMM yyyy, HH:mm',
                          { locale: ro }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {warning.acknowledgment?.signature && (
                    <SignatureDisplay
                      dataUrl={warning.acknowledgment.signature.dataUrl}
                      signerName={warning.acknowledgment.signature.signerName}
                      signedAt={warning.acknowledgment.signature.signedAt}
                      className="max-w-[300px]"
                    />
                  )}

                  {warning.acknowledgment?.employeeComments && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Comentarii angajat
                      </span>
                      <p className="text-sm whitespace-pre-wrap">
                        {warning.acknowledgment.employeeComments}
                      </p>
                    </div>
                  )}

                  {warning.acknowledgment?.acknowledgedAt && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Data confirmare
                      </span>
                      <p className="text-sm">
                        {format(
                          warning.acknowledgment.acknowledgedAt,
                          'd MMMM yyyy, HH:mm',
                          { locale: ro }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* Cleared Section (if cleared) */}
        {warning.isCleared && (
          <>
            <Separator />

            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Anulare Avertisment
              </h3>

              <div className="space-y-3">
                {warning.clearedAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Data anulare
                    </span>
                    <p className="text-sm">
                      {format(warning.clearedAt, 'd MMMM yyyy, HH:mm', {
                        locale: ro,
                      })}
                    </p>
                  </div>
                )}

                {warning.clearedBy && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Anulat de
                    </span>
                    <p className="text-sm font-medium">{warning.clearedBy}</p>
                  </div>
                )}

                {warning.clearedReason && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Motiv anulare
                    </span>
                    <p className="text-sm whitespace-pre-wrap">
                      {warning.clearedReason}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Acknowledgment Action Section (if requested and pending) */}
        {showAcknowledgmentSection &&
          !hasAcknowledgment &&
          warning.status === 'pending_acknowledgment' && (
            <>
              <Separator />

              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Actiuni
                </h3>

                <p className="text-sm text-muted-foreground">
                  Acest avertisment asteapta confirmare.
                  {onAcknowledge && (
                    <button
                      onClick={onAcknowledge}
                      className="ml-1 text-accent underline underline-offset-2 hover:text-accent/80"
                    >
                      Confirma acum
                    </button>
                  )}
                </p>
              </section>
            </>
          )}
      </CardContent>
    </Card>
  )
}

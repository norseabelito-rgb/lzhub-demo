'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Warning, DisciplineLevel } from '@/lib/warnings'
import { DISCIPLINE_LEVEL_LABELS, WARNING_STATUS_LABELS } from '@/lib/warnings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignatureDisplay } from './signature-display'

// ============================================================================
// Types
// ============================================================================

export interface WarningTimelineProps {
  warnings: Warning[]
  onViewDetail: (warning: Warning) => void
  onClearWarning?: (warningId: string, reason: string) => void
  showClearOption?: boolean
}

interface ClearDialogState {
  open: boolean
  warningId: string | null
  reason: string
}

// ============================================================================
// Constants
// ============================================================================

/** Color mapping for discipline levels */
const LEVEL_DOT_COLORS: Record<DisciplineLevel, string> = {
  verbal: 'bg-accent', // pink
  written: 'bg-amber-500',
  final: 'bg-orange-500',
  termination: 'bg-destructive',
}

const LEVEL_BADGE_VARIANTS: Record<DisciplineLevel, string> = {
  verbal: 'bg-accent/20 text-accent border-accent/30',
  written: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  final: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  termination: 'bg-destructive/20 text-destructive border-destructive/30',
}

// ============================================================================
// Main Component
// ============================================================================

export function WarningTimeline({
  warnings,
  onViewDetail,
  onClearWarning,
  showClearOption = false,
}: WarningTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [signaturesExpandedId, setSignaturesExpandedId] = useState<string | null>(null)
  const [clearDialog, setClearDialog] = useState<ClearDialogState>({
    open: false,
    warningId: null,
    reason: '',
  })

  // Sort warnings chronologically (oldest first for timeline)
  const sortedWarnings = useMemo(() => {
    return [...warnings].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [warnings])

  // Toggle description expansion
  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Toggle signatures expansion
  const toggleSignatures = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSignaturesExpandedId(signaturesExpandedId === id ? null : id)
  }

  // Handle clear button click
  const handleClearClick = (e: React.MouseEvent, warningId: string) => {
    e.stopPropagation()
    setClearDialog({
      open: true,
      warningId,
      reason: '',
    })
  }

  // Handle clear confirmation
  const handleClearConfirm = () => {
    if (clearDialog.warningId && clearDialog.reason.trim() && onClearWarning) {
      onClearWarning(clearDialog.warningId, clearDialog.reason.trim())
      setClearDialog({ open: false, warningId: null, reason: '' })
    }
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setClearDialog({ open: false, warningId: null, reason: '' })
  }

  // Empty state
  if (sortedWarnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-success/10 p-4">
          <Check className="h-8 w-8 text-success" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          Niciun avertisment inregistrat
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

        {/* Timeline items */}
        <div className="space-y-6">
          {sortedWarnings.map((warning) => {
            const isExpanded = expandedId === warning.id
            const isSignaturesExpanded = signaturesExpandedId === warning.id
            const isCleared = warning.isCleared
            const description = warning.description
            const shouldTruncate = description.length > 200 && !isExpanded

            return (
              <div
                key={warning.id}
                className={cn(
                  'relative pl-8 cursor-pointer group',
                  isCleared && 'opacity-60'
                )}
                onClick={() => onViewDetail(warning)}
              >
                {/* Colored dot */}
                <div
                  className={cn(
                    'absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-background',
                    LEVEL_DOT_COLORS[warning.level],
                    isCleared && 'bg-muted'
                  )}
                />

                {/* Timeline item content */}
                <div
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    'hover:bg-accent/5',
                    isCleared && 'border-dashed'
                  )}
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Date */}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(warning.createdAt), 'dd MMM yyyy', { locale: ro })}
                    </span>

                    {/* Level badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        LEVEL_BADGE_VARIANTS[warning.level],
                        isCleared && 'line-through'
                      )}
                    >
                      {DISCIPLINE_LEVEL_LABELS[warning.level]}
                    </Badge>

                    {/* Category */}
                    <Badge variant="secondary" className="text-xs">
                      {warning.category}
                    </Badge>

                    {/* Status badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        warning.status === 'pending_acknowledgment' &&
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
                        warning.status === 'acknowledged' &&
                          'bg-success/10 text-success border-success/30',
                        warning.status === 'refused' &&
                          'bg-destructive/10 text-destructive border-destructive/30',
                        warning.status === 'cleared' &&
                          'bg-muted text-muted-foreground'
                      )}
                    >
                      {WARNING_STATUS_LABELS[warning.status]}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p
                    className={cn(
                      'text-sm text-foreground/80',
                      isCleared && 'line-through'
                    )}
                  >
                    {shouldTruncate ? `${description.slice(0, 200)}...` : description}
                  </p>

                  {/* Expand/collapse description */}
                  {description.length > 200 && (
                    <button
                      type="button"
                      className="mt-1 text-xs text-accent hover:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpanded(warning.id)
                      }}
                    >
                      {isExpanded ? 'Arata mai putin' : 'Citeste mai mult'}
                    </button>
                  )}

                  {/* Signatures section (collapsible) */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={(e) => toggleSignatures(warning.id, e)}
                    >
                      {isSignaturesExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      Semnaturi
                    </button>

                    {isSignaturesExpanded && (
                      <div className="mt-2 space-y-2">
                        {/* Manager signature */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Manager:</p>
                          <SignatureDisplay
                            dataUrl={warning.managerSignature.dataUrl}
                            signerName={warning.managerSignature.signerName}
                            signedAt={warning.managerSignature.signedAt}
                            className="max-w-[200px]"
                          />
                        </div>

                        {/* Employee signature (if acknowledged) */}
                        {warning.acknowledgment?.signature && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Angajat:
                            </p>
                            <SignatureDisplay
                              dataUrl={warning.acknowledgment.signature.dataUrl}
                              signerName={warning.acknowledgment.signature.signerName}
                              signedAt={warning.acknowledgment.signature.signedAt}
                              className="max-w-[200px]"
                            />
                          </div>
                        )}

                        {/* Refused to sign */}
                        {warning.acknowledgment?.refusedToSign && (
                          <div className="text-xs text-destructive">
                            Refuzat sa semneze
                            {warning.acknowledgment.refusedWitnessedBy && (
                              <span className="text-muted-foreground">
                                {' '}
                                - Martor: {warning.acknowledgment.refusedWitnessedBy}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Clear button (manager only, not already cleared) */}
                  {showClearOption && !isCleared && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleClearClick(e, warning.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sterge avertisment
                      </Button>
                    </div>
                  )}

                  {/* Cleared info */}
                  {isCleared && warning.clearedReason && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      Sters: {warning.clearedReason}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Clear confirmation dialog */}
      <Dialog open={clearDialog.open} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sterge Avertisment</DialogTitle>
            <DialogDescription>
              Aceasta actiune va marca avertismentul ca sters dupa o perioada de
              comportament bun. Istoricul ramane vizibil.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clear-reason">Motivul stergerii *</Label>
              <Input
                id="clear-reason"
                placeholder="ex: Comportament exemplar timp de 6 luni"
                value={clearDialog.reason}
                onChange={(e) =>
                  setClearDialog((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleDialogClose}>
              Anuleaza
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearConfirm}
              disabled={!clearDialog.reason.trim()}
            >
              Confirma Stergerea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

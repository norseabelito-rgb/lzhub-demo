'use client'

import { Pencil, Trash2, Clock, Users, ListChecks, QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ChecklistTemplate } from '@/lib/checklist/types'

// ============================================================================
// Types
// ============================================================================

interface TemplateCardProps {
  /** Template data to display */
  template: ChecklistTemplate
  /** Called when edit button is clicked */
  onEdit: () => void
  /** Called when delete button is clicked */
  onDelete: () => void
  /** Called when QR button is clicked */
  onShowQR?: () => void
}

// ============================================================================
// Helpers
// ============================================================================

function getTypeBadgeVariant(type: ChecklistTemplate['type']) {
  switch (type) {
    case 'deschidere':
      return 'default'
    case 'inchidere':
      return 'secondary'
    case 'custom':
      return 'outline'
    default:
      return 'outline'
  }
}

function getTypeLabel(type: ChecklistTemplate['type']) {
  switch (type) {
    case 'deschidere':
      return 'Deschidere'
    case 'inchidere':
      return 'Inchidere'
    case 'custom':
      return 'Custom'
    default:
      return type
  }
}

function formatTimeWindow(template: ChecklistTemplate): string {
  const { startHour, startMinute, endHour, endMinute } = template.timeWindow
  const start = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
  const end = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
  return `${start} - ${end}`
}

function getAssignmentLabel(assignedTo: ChecklistTemplate['assignedTo']): string {
  if (assignedTo === 'all') return 'Toti'
  if (assignedTo === 'shift') return 'Tura'
  if (Array.isArray(assignedTo)) {
    return `${assignedTo.length} angajat${assignedTo.length === 1 ? '' : 'i'}`
  }
  return 'Necunoscut'
}

// ============================================================================
// Component
// ============================================================================

export function TemplateCard({ template, onEdit, onDelete, onShowQR }: TemplateCardProps) {
  return (
    <Card className="group relative hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base truncate">
                {template.name}
              </CardTitle>
              <Badge variant={getTypeBadgeVariant(template.type)}>
                {getTypeLabel(template.type)}
              </Badge>
            </div>
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" />
            <span>{template.items.length} elemente</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatTimeWindow(template)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{getAssignmentLabel(template.assignedTo)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editeaza
          </Button>
          {onShowQR && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowQR}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

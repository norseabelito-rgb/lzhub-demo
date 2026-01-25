'use client'

import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateCard } from './template-card'
import type { ChecklistTemplate } from '@/lib/checklist/types'

// ============================================================================
// Types
// ============================================================================

interface TemplateListProps {
  /** Array of templates to display */
  templates: ChecklistTemplate[]
  /** Called when edit is clicked on a template */
  onEdit: (id: string) => void
  /** Called when delete is clicked on a template */
  onDelete: (id: string) => void
  /** Called when create new button is clicked */
  onCreateNew: () => void
  /** Called when QR is clicked on a template */
  onShowQR?: (id: string) => void
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Nu exista template-uri</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Creeaza primul template pentru a incepe sa gestionezi checklisturile echipei tale.
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Creeaza primul template
      </Button>
    </div>
  )
}

// ============================================================================
// Component
// ============================================================================

export function TemplateList({
  templates,
  onEdit,
  onDelete,
  onCreateNew,
  onShowQR,
}: TemplateListProps) {
  if (templates.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Template-uri Checklisturi</h2>
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length === 1 ? '' : '-uri'} disponibil{templates.length === 1 ? '' : 'e'}
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Adauga template
        </Button>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => onEdit(template.id)}
            onDelete={() => onDelete(template.id)}
            onShowQR={onShowQR ? () => onShowQR(template.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

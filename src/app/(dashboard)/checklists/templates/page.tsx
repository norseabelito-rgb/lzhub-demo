'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/auth'
import { TemplateList, TemplateForm, QRCodeDisplay, type TemplateFormData } from '@/components/checklists'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
// AlertDialog can be added to ui/ later if needed
import { useChecklistStore } from '@/lib/checklist/checklist-store'
import { useAuth } from '@/lib/auth'
import type { ChecklistTemplate } from '@/lib/checklist/types'

// ============================================================================
// Alert Dialog Component (inline since not yet in UI lib)
// ============================================================================

// Using simple confirm for now - AlertDialog can be added to ui/ later

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  templateName,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateName: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sterge template</DialogTitle>
          <DialogDescription>
            Esti sigur ca vrei sa stergi template-ul &quot;{templateName}&quot;?
            Aceasta actiune nu poate fi anulata.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Anuleaza
          </button>
          <button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-destructive text-white hover:bg-destructive/90"
          >
            Sterge
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Page Content Component
// ============================================================================

function TemplatesPageContent() {
  const { user } = useAuth()
  const { templates, createTemplate, updateTemplate, deleteTemplate, getTemplateById } =
    useChecklistStore()

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<ChecklistTemplate | null>(null)

  // QR dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrTemplateId, setQrTemplateId] = useState<string | null>(null)

  // Get template being edited
  const selectedTemplate = selectedTemplateId
    ? getTemplateById(selectedTemplateId)
    : undefined

  // Get template for QR display
  const qrTemplate = qrTemplateId ? getTemplateById(qrTemplateId) : undefined

  // Handlers
  const handleCreateNew = () => {
    setSelectedTemplateId(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    setSelectedTemplateId(id)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    const template = getTemplateById(id)
    if (template) {
      setTemplateToDelete(template)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id)
      toast.success(`Template-ul "${templateToDelete.name}" a fost sters`)
      setTemplateToDelete(null)
    }
  }

  const handleShowQR = (id: string) => {
    setQrTemplateId(id)
    setQrDialogOpen(true)
  }

  const handleFormSubmit = (data: TemplateFormData) => {
    setIsSubmitting(true)

    try {
      if (selectedTemplateId) {
        // Update existing
        updateTemplate(selectedTemplateId, {
          name: data.name,
          description: data.description || '',
          type: data.type,
          timeWindow: {
            startHour: data.timeWindow.startHour,
            startMinute: data.timeWindow.startMinute,
            endHour: data.timeWindow.endHour,
            endMinute: data.timeWindow.endMinute,
            allowLateCompletion: data.timeWindow.allowLateCompletion,
            lateWindowMinutes: data.timeWindow.lateWindowMinutes,
          },
          assignedTo: data.assignedTo,
          items: data.items,
        })
        toast.success(`Template-ul "${data.name}" a fost actualizat`)
      } else {
        // Create new
        createTemplate({
          name: data.name,
          description: data.description || '',
          type: data.type,
          timeWindow: {
            startHour: data.timeWindow.startHour,
            startMinute: data.timeWindow.startMinute,
            endHour: data.timeWindow.endHour,
            endMinute: data.timeWindow.endMinute,
            allowLateCompletion: data.timeWindow.allowLateCompletion,
            lateWindowMinutes: data.timeWindow.lateWindowMinutes,
          },
          assignedTo: data.assignedTo,
          items: data.items,
          createdBy: user?.id || 'unknown',
        })
        toast.success(`Template-ul "${data.name}" a fost creat`)
      }

      setIsDialogOpen(false)
      setSelectedTemplateId(null)
    } catch (error) {
      toast.error('A aparut o eroare. Te rugam sa incerci din nou.')
      console.error('Template save error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setSelectedTemplateId(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Gestionare Template-uri</h1>
        <p className="text-muted-foreground">
          Creeaza si gestioneaza template-urile pentru checklisturile echipei.
        </p>
      </div>

      {/* Template List */}
      <TemplateList
        templates={templates}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onCreateNew={handleCreateNew}
        onShowQR={handleShowQR}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplateId ? 'Editeaza template' : 'Creeaza template nou'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplateId
                ? 'Modifica detaliile template-ului existent.'
                : 'Completeaza detaliile pentru noul template.'}
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            template={selectedTemplate}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        templateName={templateToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
      />

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cod QR - {qrTemplate?.name}</DialogTitle>
            <DialogDescription>
              Scaneaza acest cod pentru a deschide rapid checklistul.
            </DialogDescription>
          </DialogHeader>
          {qrTemplate && (
            <QRCodeDisplay
              template={qrTemplate}
              size={250}
              showPrintButton={true}
              showDownloadButton={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// Page Component with Auth Guard
// ============================================================================

export default function TemplatesPage() {
  return (
    <AuthGuard allowedRoles={['manager']}>
      <TemplatesPageContent />
    </AuthGuard>
  )
}

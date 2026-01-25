'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  useSocialStore,
  templateSchema,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABELS,
  type CaptionTemplate,
  type TemplateFormData,
} from '@/lib/social'

// ============================================================================
// Types
// ============================================================================

interface TemplateManagerProps {
  className?: string
}

interface TemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: CaptionTemplate | null
  onSave: (data: TemplateFormData) => void
}

// ============================================================================
// Template Form Dialog
// ============================================================================

function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateFormDialogProps) {
  const isEditing = !!template

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name ?? '',
      content: template?.content ?? '',
      category: template?.category ?? '',
    },
  })

  const onSubmit = (data: TemplateFormData) => {
    onSave(data)
    reset()
    onOpenChange(false)
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editeaza Template' : 'Adauga Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nume *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="ex: Promotie Weekend"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category dropdown */}
          <div className="space-y-2">
            <Label htmlFor="category">Categorie *</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.category}>
                    <SelectValue placeholder="Selecteaza categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {TEMPLATE_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Content textarea */}
          <div className="space-y-2">
            <Label htmlFor="content">Continut *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Scrie continutul template-ului aici...&#10;&#10;Poti folosi placeholder-e precum:&#10;[OFERTA_DETALII], [DATA], [ORA], [PRET]"
              rows={8}
              aria-invalid={!!errors.content}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Foloseste [PLACEHOLDER] pentru valori care se vor completa la fiecare postare
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Anuleaza
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Se salveaza...' : 'Salveaza'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  templateName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  templateName: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sterge Template</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Esti sigur ca vrei sa stergi template-ul <strong>{templateName}</strong>?
          Aceasta actiune nu poate fi anulata.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuleaza
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Sterge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Template Card
// ============================================================================

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: CaptionTemplate
  onEdit: () => void
  onDelete: () => void
}) {
  const contentPreview = template.content.length > 100
    ? template.content.slice(0, 100) + '...'
    : template.content

  return (
    <Card className="group transition-colors hover:border-accent/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{template.name}</h3>
              <Badge variant="secondary" className="shrink-0">
                {TEMPLATE_CATEGORY_LABELS[template.category as keyof typeof TEMPLATE_CATEGORY_LABELS] || template.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
              {contentPreview}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editeaza</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Sterge</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function TemplateManager({ className }: TemplateManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CaptionTemplate | null>(null)
  const [deleteTemplate, setDeleteTemplate] = useState<CaptionTemplate | null>(null)

  // Store access
  const captionTemplates = useSocialStore((state) => state.captionTemplates)
  const createTemplate = useSocialStore((state) => state.createTemplate)
  const updateTemplate = useSocialStore((state) => state.updateTemplate)
  const deleteTemplateAction = useSocialStore((state) => state.deleteTemplate)

  // Handle create/edit
  const handleSave = (data: TemplateFormData) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, data)
      toast.success('Template actualizat')
    } else {
      createTemplate(data)
      toast.success('Template creat')
    }
    setEditingTemplate(null)
  }

  // Handle edit click
  const handleEdit = (template: CaptionTemplate) => {
    setEditingTemplate(template)
    setIsFormOpen(true)
  }

  // Handle delete
  const handleDelete = () => {
    if (deleteTemplate) {
      deleteTemplateAction(deleteTemplate.id)
      toast.success('Template sters')
      setDeleteTemplate(null)
    }
  }

  // Open create dialog
  const handleCreate = () => {
    setEditingTemplate(null)
    setIsFormOpen(true)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Template-uri</h2>
          <p className="text-sm text-muted-foreground">
            {captionTemplates.length} template-uri salvate
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Adauga template
        </Button>
      </div>

      {/* Template list */}
      {captionTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nu ai template-uri</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Creeaza primul template pentru a scrie postari mai rapid!
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Creeaza primul template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {captionTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => handleEdit(template)}
              onDelete={() => setDeleteTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <TemplateFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        template={editingTemplate}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteTemplate}
        onOpenChange={(open) => !open && setDeleteTemplate(null)}
        onConfirm={handleDelete}
        templateName={deleteTemplate?.name ?? ''}
      />
    </div>
  )
}

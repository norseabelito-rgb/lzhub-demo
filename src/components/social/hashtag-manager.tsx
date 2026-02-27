'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Hash, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  useSocialStore,
  hashtagSetSchema,
  type HashtagSet,
  type HashtagSetFormData,
} from '@/lib/social'

// ============================================================================
// Types
// ============================================================================

interface HashtagManagerProps {
  className?: string
}

interface HashtagFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hashtagSet?: HashtagSet | null
  onSave: (data: HashtagSetFormData) => void
}

// ============================================================================
// Hashtag Form Dialog
// ============================================================================

function HashtagFormDialog({
  open,
  onOpenChange,
  hashtagSet,
  onSave,
}: HashtagFormDialogProps) {
  const isEditing = !!hashtagSet
  // Initialize state from props - component remounts with key when hashtagSet changes
  const [hashtags, setHashtags] = useState<string[]>(hashtagSet?.hashtags ?? [])
  const [inputValue, setInputValue] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HashtagSetFormData>({
    resolver: zodResolver(hashtagSetSchema),
    defaultValues: {
      name: hashtagSet?.name ?? '',
      hashtags: hashtagSet?.hashtags ?? [],
    },
  })

  // Sync hashtags state with form using callback in setHashtags
  // No useEffect needed - we sync on change

  // Add hashtag
  const addHashtag = () => {
    if (!inputValue.trim()) return

    // Strip # prefix if present and clean up
    const cleaned = inputValue.trim().replace(/^#/, '').toLowerCase()

    if (!cleaned) return

    // Check for duplicates
    if (hashtags.includes(cleaned)) {
      toast.error('Acest hashtag exista deja')
      return
    }

    const newHashtags = [...hashtags, cleaned]
    setHashtags(newHashtags)
    setValue('hashtags', newHashtags)
    setInputValue('')
  }

  // Remove hashtag
  const removeHashtag = (tag: string) => {
    const newHashtags = hashtags.filter((t) => t !== tag)
    setHashtags(newHashtags)
    setValue('hashtags', newHashtags)
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addHashtag()
    }
  }

  const onSubmit = (data: HashtagSetFormData) => {
    if (hashtags.length === 0) {
      toast.error('Adauga cel putin un hashtag')
      return
    }
    onSave({ ...data, hashtags })
    reset()
    setHashtags([])
    setInputValue('')
    onOpenChange(false)
  }

  const handleClose = () => {
    reset()
    setHashtags([])
    setInputValue('')
    onOpenChange(false)
  }

  return (
    <Dialog key={hashtagSet?.id ?? 'new'} open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editeaza Set de Hashtag-uri' : 'Adauga Set de Hashtag-uri'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nume Set *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="ex: LaserZone General"
              maxLength={30}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Maxim 30 caractere
            </p>
          </div>

          {/* Hashtags input */}
          <div className="space-y-2">
            <Label htmlFor="hashtag-input">Hashtag-uri *</Label>
            <div className="flex gap-2">
              <Input
                id="hashtag-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scrie un hashtag si apasa Enter"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addHashtag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.hashtags && (
              <p className="text-sm text-destructive">{errors.hashtags.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Scrie fara # - se adauga automat. Apasa Enter sau butonul + pentru a adauga.
            </p>
          </div>

          {/* Hashtags display */}
          {hashtags.length > 0 && (
            <div className="space-y-2">
              <Label>Hashtag-uri adaugate ({hashtags.length})</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/30 min-h-[60px]">
                {hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1 bg-accent/20 text-accent border-accent/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-0.5 rounded-full p-0.5 opacity-60 transition-opacity hover:bg-black/10 hover:opacity-100"
                    >
                      <X className="size-3" />
                      <span className="sr-only">Sterge #{tag}</span>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Anuleaza
            </Button>
            <Button type="submit" disabled={isSubmitting || hashtags.length === 0}>
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
  hashtagSetName,
  hashtagCount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  hashtagSetName: string
  hashtagCount: number
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sterge Set de Hashtag-uri</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Esti sigur ca vrei sa stergi setul <strong>{hashtagSetName}</strong> cu{' '}
          {hashtagCount} hashtag-uri? Aceasta actiune nu poate fi anulata.
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
// Hashtag Set Card
// ============================================================================

function HashtagSetCard({
  hashtagSet,
  onEdit,
  onDelete,
}: {
  hashtagSet: HashtagSet
  onEdit: () => void
  onDelete: () => void
}) {
  const displayHashtags = hashtagSet.hashtags.slice(0, 5)
  const remainingCount = hashtagSet.hashtags.length - 5

  return (
    <Card className="group transition-colors hover:border-accent/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{hashtagSet.name}</h3>
              <span className="text-sm text-muted-foreground">
                ({hashtagSet.hashtags.length} hashtag-uri)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displayHashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-accent/10 text-accent border-accent/30"
                >
                  #{tag}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{remainingCount} mai mult
                </Badge>
              )}
            </div>
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

export function HashtagManager({ className }: HashtagManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSet, setEditingSet] = useState<HashtagSet | null>(null)
  const [deleteSet, setDeleteSet] = useState<HashtagSet | null>(null)

  // Store access
  const hashtagSets = useSocialStore((state) => state.hashtagSets)
  const createHashtagSet = useSocialStore((state) => state.createHashtagSet)
  const updateHashtagSet = useSocialStore((state) => state.updateHashtagSet)
  const deleteHashtagSetAction = useSocialStore((state) => state.deleteHashtagSet)

  // Handle create/edit
  const handleSave = async (data: HashtagSetFormData) => {
    if (editingSet) {
      await updateHashtagSet(editingSet.id, data)
      toast.success('Set de hashtag-uri actualizat')
    } else {
      await createHashtagSet(data)
      toast.success('Set de hashtag-uri creat')
    }
    setEditingSet(null)
  }

  // Handle edit click
  const handleEdit = (set: HashtagSet) => {
    setEditingSet(set)
    setIsFormOpen(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (deleteSet) {
      await deleteHashtagSetAction(deleteSet.id)
      toast.success('Set de hashtag-uri sters')
      setDeleteSet(null)
    }
  }

  // Open create dialog
  const handleCreate = () => {
    setEditingSet(null)
    setIsFormOpen(true)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Seturi de Hashtag-uri</h2>
          <p className="text-sm text-muted-foreground">
            {hashtagSets.length} seturi salvate
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Adauga set
        </Button>
      </div>

      {/* Hashtag set list */}
      {hashtagSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Hash className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nu ai seturi de hashtag-uri</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Creeaza primul set pentru a adauga hashtag-uri rapid in postari!
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Creeaza primul set
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {hashtagSets.map((set) => (
            <HashtagSetCard
              key={set.id}
              hashtagSet={set}
              onEdit={() => handleEdit(set)}
              onDelete={() => setDeleteSet(set)}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <HashtagFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        hashtagSet={editingSet}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteSet}
        onOpenChange={(open) => !open && setDeleteSet(null)}
        onConfirm={handleDelete}
        hashtagSetName={deleteSet?.name ?? ''}
        hashtagCount={deleteSet?.hashtags.length ?? 0}
      />
    </div>
  )
}

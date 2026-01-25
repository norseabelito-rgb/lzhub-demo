'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { useSocialStore, type MediaType } from '@/lib/social'

// ============================================================================
// Types
// ============================================================================

interface LibraryUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ============================================================================
// Schema
// ============================================================================

const uploadSchema = z.object({
  name: z
    .string()
    .min(1, 'Numele este obligatoriu')
    .max(100, 'Maxim 100 caractere'),
  type: z.enum(['image', 'video'], {
    message: 'Selecteaza tipul',
  }),
})

type UploadFormData = z.infer<typeof uploadSchema>

// ============================================================================
// Component
// ============================================================================

export function LibraryUpload({ open, onOpenChange }: LibraryUploadProps) {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const addToLibrary = useSocialStore((state) => state.addToLibrary)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
      type: undefined,
    },
  })

  const selectedType = watch('type')

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset()
      setTags([])
      setTagInput('')
    }
  }, [open, reset])

  // Add tag
  const addTag = () => {
    if (!tagInput.trim()) return

    const cleaned = tagInput.trim().toLowerCase()

    if (tags.includes(cleaned)) {
      toast.error('Acest tag exista deja')
      return
    }

    setTags((prev) => [...prev, cleaned])
    setTagInput('')
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Submit
  const onSubmit = (data: UploadFormData) => {
    // Create mock library item
    const isVideo = data.type === 'video'
    const mockId = crypto.randomUUID().slice(0, 8)

    addToLibrary({
      name: data.name,
      type: data.type as MediaType,
      url: isVideo
        ? `/videos/social/upload-${mockId}.mp4`
        : `/images/social/upload-${mockId}.jpg`,
      thumbnailUrl: `/images/social/upload-${mockId}-thumb.jpg`,
      mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
      size: isVideo ? 25000000 : 2000000, // Mock sizes
      dimensions: isVideo
        ? { width: 1080, height: 1920 }
        : { width: 1080, height: 1080 },
      duration: isVideo ? 30 : undefined,
      tags,
    })

    toast.success('Media adaugata in biblioteca')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adauga Media</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mock upload area */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Selectare fisiere dezactivata in prototip
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Completeaza detaliile mai jos pentru a adauga o intrare mock
            </p>
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nume *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="ex: Poza arena principala"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Type selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Tip Media *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as 'image' | 'video')}
            >
              <SelectTrigger aria-invalid={!!errors.type}>
                <SelectValue placeholder="Selecteaza tipul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Imagine</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Tags input */}
          <div className="space-y-2">
            <Label htmlFor="tag-input">Tag-uri (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Adauga un tag"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/30">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 rounded-full p-0.5 opacity-60 transition-opacity hover:bg-black/10 hover:opacity-100"
                  >
                    <X className="size-3" />
                    <span className="sr-only">Sterge {tag}</span>
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuleaza
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Se adauga...' : 'Adauga'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

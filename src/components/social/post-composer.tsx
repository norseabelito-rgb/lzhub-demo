'use client'

import React, { useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, Save, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSocialStore } from '@/lib/social/social-store'
import { postFormSchema, type PostFormData } from '@/lib/social/validation'
import type { SocialPost } from '@/lib/social/types'
import { PlatformToggle } from './platform-toggle'
import { CaptionEditor } from './caption-editor'
import { HashtagPicker } from './hashtag-picker'
import { MediaPicker } from './media-picker'
import { SchedulePicker } from './schedule-picker'

// ============================================================================
// Types
// ============================================================================

interface PostComposerProps {
  /** Initial post data for editing */
  initialData?: SocialPost
  /** Mode: create or edit */
  mode: 'create' | 'edit'
  /** Callback after successful save */
  onSave: () => void
  /** Callback for cancel action */
  onCancel: () => void
}

// ============================================================================
// Collapsible Section Component
// ============================================================================

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {isOpen ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  )
}

// ============================================================================
// Component
// ============================================================================

export function PostComposer({ initialData, mode, onSave, onCancel }: PostComposerProps) {
  const createPost = useSocialStore((state) => state.createPost)
  const updatePost = useSocialStore((state) => state.updatePost)
  const hashtagSets = useSocialStore((state) => state.hashtagSets)

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      caption: initialData?.caption ?? '',
      platforms: initialData?.platforms ?? [],
      mediaIds: initialData?.mediaIds ?? [],
      hashtagSetIds: [],
      customHashtags: initialData?.hashtags ?? [],
      scheduledAt: initialData?.scheduledAt
        ? (initialData.scheduledAt instanceof Date
            ? initialData.scheduledAt.toISOString()
            : initialData.scheduledAt)
        : null,
    },
  })

  // Watch form values
  const watchedPlatforms = watch('platforms')
  const watchedScheduledAt = watch('scheduledAt')
  const watchedHashtagSetIds = watch('hashtagSetIds')
  const watchedCustomHashtags = watch('customHashtags')

  // Resolve hashtags from sets + custom
  const resolvedHashtags = useMemo(() => {
    const fromSets = hashtagSets
      .filter((set) => watchedHashtagSetIds?.includes(set.id))
      .flatMap((set) => set.hashtags)

    return [...new Set([...fromSets, ...(watchedCustomHashtags ?? [])])]
  }, [hashtagSets, watchedHashtagSetIds, watchedCustomHashtags])

  // Determine if scheduling
  const isScheduled = watchedScheduledAt !== null && watchedScheduledAt !== undefined

  // Handle form submission
  const onSubmit = (data: PostFormData) => {
    try {
      // Resolve hashtags
      const hashtags = resolvedHashtags

      if (mode === 'create') {
        // Create new post
        createPost({
          caption: data.caption,
          platforms: data.platforms,
          mediaIds: data.mediaIds,
          hashtags,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          createdBy: 'current-user', // Would come from auth in real app
        })

        toast.success(
          isScheduled ? 'Postare programata cu succes!' : 'Ciorna salvata cu succes!'
        )
      } else if (initialData) {
        // Update existing post
        updatePost(initialData.id, {
          caption: data.caption,
          platforms: data.platforms,
          mediaIds: data.mediaIds,
          hashtags,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          status: data.scheduledAt ? 'scheduled' : 'draft',
        })

        toast.success('Postare actualizata cu succes!')
      }

      onSave()
    } catch (error) {
      toast.error('Eroare la salvare. Incearca din nou.')
      console.error('Save error:', error)
    }
  }

  // Page title based on mode
  const pageTitle = mode === 'create' ? 'Postare noua' : 'Editeaza postare'

  // Button text based on schedule
  const submitButtonText = isScheduled ? 'Programeaza' : 'Salveaza ciorna'
  const submitButtonIcon = isScheduled ? CalendarIcon : Save

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platforme *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Controller
            name="platforms"
            control={control}
            render={({ field }) => (
              <PlatformToggle
                selected={field.value}
                onChange={field.onChange}
                hasError={!!errors.platforms}
              />
            )}
          />
          {errors.platforms && (
            <p className="text-sm text-destructive">{errors.platforms.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Caption Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descriere *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Controller
            name="caption"
            control={control}
            render={({ field }) => (
              <CaptionEditor
                value={field.value}
                onChange={field.onChange}
                platforms={watchedPlatforms}
                hasError={!!errors.caption}
              />
            )}
          />
          {errors.caption && (
            <p className="text-sm text-destructive">{errors.caption.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Hashtags (Collapsible) */}
      <CollapsibleSection title="Hashtag-uri">
        <Controller
          name="hashtagSetIds"
          control={control}
          render={({ field: setIdsField }) => (
            <Controller
              name="customHashtags"
              control={control}
              render={({ field: customField }) => (
                <HashtagPicker
                  selectedSetIds={setIdsField.value ?? []}
                  customHashtags={customField.value ?? []}
                  onSetIdsChange={setIdsField.onChange}
                  onCustomHashtagsChange={customField.onChange}
                  platforms={watchedPlatforms}
                />
              )}
            />
          )}
        />
      </CollapsibleSection>

      {/* Media Picker (Collapsible) */}
      <CollapsibleSection title="Media">
        <Controller
          name="mediaIds"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <MediaPicker
                selectedIds={field.value}
                onChange={field.onChange}
              />
              {errors.mediaIds && (
                <p className="text-sm text-destructive">{errors.mediaIds.message}</p>
              )}
            </div>
          )}
        />
      </CollapsibleSection>

      {/* Schedule Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Programare</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="scheduledAt"
            control={control}
            render={({ field }) => (
              <SchedulePicker
                value={field.value ?? null}
                onChange={field.onChange}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuleaza
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            'Se salveaza...'
          ) : (
            <>
              {React.createElement(submitButtonIcon, { className: 'size-4' })}
              {submitButtonText}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { Save, Loader2 } from 'lucide-react'

interface DocumentFormProps {
  initialData?: {
    title: string
    content: string
    minReadingSeconds: number
  }
  onSubmit: (data: { title: string; content: string; minReadingSeconds: number }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function DocumentForm({ initialData, onSubmit, onCancel, isLoading }: DocumentFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [minReadingSeconds, setMinReadingSeconds] = useState(initialData?.minReadingSeconds ?? 30)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    await onSubmit({ title: title.trim(), content, minReadingSeconds })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="doc-title">Titlu document</Label>
        <Input
          id="doc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: Regulament Intern"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Continut document</Label>
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Scrieti continutul documentului..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="min-reading">Timp minim citire (secunde)</Label>
        <Input
          id="min-reading"
          type="number"
          min={0}
          value={minReadingSeconds}
          onChange={(e) => setMinReadingSeconds(parseInt(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">
          Butonul de confirmare va fi blocat pana trece acest timp.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuleaza
        </Button>
        <Button type="submit" disabled={!title.trim() || !content.trim() || isLoading} className="gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {initialData ? 'Actualizeaza' : 'Adauga'}
        </Button>
      </div>
    </form>
  )
}

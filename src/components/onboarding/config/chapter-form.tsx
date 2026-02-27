'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2 } from 'lucide-react'

interface ChapterFormProps {
  initialData?: {
    title: string
    timestamp: number
  }
  onSubmit: (data: { title: string; timestamp: number }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

function secondsToMmSs(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function mmSsToSeconds(value: string): number {
  const parts = value.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  return parseInt(value) || 0
}

export function ChapterForm({ initialData, onSubmit, onCancel, isLoading }: ChapterFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [timestampStr, setTimestampStr] = useState(
    initialData ? secondsToMmSs(initialData.timestamp) : '0:00'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await onSubmit({ title: title.trim(), timestamp: mmSsToSeconds(timestampStr) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 space-y-1">
        <Label htmlFor="ch-title">Titlu capitol</Label>
        <Input
          id="ch-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: Introducere"
          required
        />
      </div>
      <div className="w-28 space-y-1">
        <Label htmlFor="ch-ts">Timestamp (mm:ss)</Label>
        <Input
          id="ch-ts"
          value={timestampStr}
          onChange={(e) => setTimestampStr(e.target.value)}
          placeholder="0:00"
          required
        />
      </div>
      <Button type="submit" disabled={!title.trim() || isLoading} size="sm" className="gap-1">
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
        {initialData ? 'Salveaza' : 'Adauga'}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onCancel}>
        Anuleaza
      </Button>
    </form>
  )
}

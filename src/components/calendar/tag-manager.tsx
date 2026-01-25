'use client'

import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useCustomerStore, type CustomerTag } from '@/lib/calendar'

// ============================================================================
// Types
// ============================================================================

interface TagManagerProps {
  customerId: string
  currentTags: CustomerTag[]
  className?: string
}

// Preset colors for new tags
const PRESET_COLORS = [
  { name: 'Pink', hex: '#f535aa' },
  { name: 'Cyan', hex: '#22d3ee' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Red', hex: '#ef4444' },
]

// ============================================================================
// Component
// ============================================================================

export function TagManager({
  customerId,
  currentTags,
  className,
}: TagManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0].hex)

  const {
    availableTags,
    addTag,
    addTagToCustomer,
    removeTagFromCustomer,
  } = useCustomerStore()

  // Tags not yet assigned to this customer
  const unassignedTags = availableTags.filter(
    (tag) => !currentTags.some((t) => t.id === tag.id)
  )

  // Handle adding existing tag
  const handleAddTag = (tagId: string) => {
    addTagToCustomer(customerId, tagId)
    setIsAddOpen(false)
  }

  // Handle removing tag
  const handleRemoveTag = (tagId: string) => {
    removeTagFromCustomer(customerId, tagId)
  }

  // Handle creating new tag
  const handleCreateTag = () => {
    if (!newTagName.trim()) return

    const newTagId = addTag({
      name: newTagName.trim(),
      color: newTagColor,
    })

    // Also add to this customer
    addTagToCustomer(customerId, newTagId)

    // Reset and close
    setNewTagName('')
    setNewTagColor(PRESET_COLORS[0].hex)
    setIsCreateOpen(false)
    setIsAddOpen(false)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Current Tags */}
      {currentTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className="group gap-1 pr-1"
          style={{
            backgroundColor: `${tag.color}20`,
            borderColor: `${tag.color}50`,
            color: tag.color,
          }}
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="ml-0.5 rounded-full p-0.5 opacity-60 transition-opacity hover:bg-black/10 hover:opacity-100"
          >
            <X className="size-3" />
            <span className="sr-only">Sterge eticheta {tag.name}</span>
          </button>
        </Badge>
      ))}

      {/* Add Tag Button */}
      <Popover open={isAddOpen} onOpenChange={setIsAddOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 gap-1 rounded-full px-2 text-xs"
          >
            <Plus className="size-3" />
            Adauga
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          {/* Available tags list */}
          {unassignedTags.length > 0 ? (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Etichete disponibile
              </p>
              {unassignedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              Toate etichetele sunt aplicate
            </p>
          )}

          {/* Create new tag button */}
          <div className="mt-2 border-t pt-2">
            <button
              onClick={() => {
                setIsCreateOpen(true)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-accent"
            >
              <Plus className="size-4" />
              Creaza eticheta noua
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creaza eticheta noua</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tag name input */}
            <div>
              <label className="text-sm font-medium">Nume eticheta</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="ex: VIP, Fidel, Corporate..."
                className="mt-1"
                autoFocus
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="text-sm font-medium">Culoare</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setNewTagColor(color.hex)}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110',
                      newTagColor === color.hex && 'ring-2 ring-ring ring-offset-2'
                    )}
                    style={{ backgroundColor: color.hex }}
                  >
                    {newTagColor === color.hex && (
                      <Check className="size-4 text-white" />
                    )}
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="text-sm font-medium">Previzualizare</label>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className="text-sm"
                  style={{
                    backgroundColor: `${newTagColor}20`,
                    borderColor: `${newTagColor}50`,
                    color: newTagColor,
                  }}
                >
                  {newTagName || 'Nume eticheta'}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Anuleaza
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
            >
              <Check className="mr-2 size-4" />
              Creaza
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

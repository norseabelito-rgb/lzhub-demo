'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X, Image as ImageIcon, Film, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { LibraryItem } from './library-item'
import {
  useSocialStore,
  libraryItemSchema,
  type ContentLibraryItem,
  type MediaType,
  type LibraryItemFormData,
} from '@/lib/social'

// ============================================================================
// Types
// ============================================================================

export interface LibraryGridProps {
  items: ContentLibraryItem[]
  onSelect?: (item: ContentLibraryItem) => void
  selectedIds?: string[]
  className?: string
}

type FilterType = 'all' | 'image' | 'video'

// ============================================================================
// Edit Tags Dialog
// ============================================================================

function EditTagsDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ContentLibraryItem | null
  onSave: (data: { tags: string[] }) => void
}) {
  // Initialize tags from item - using initial state from prop
  const [tags, setTags] = useState<string[]>(item?.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  // Reset tags when item changes using key pattern (see Dialog key prop below)
  // No useEffect needed - component remounts with new key

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

  const handleSave = () => {
    onSave({ tags })
    onOpenChange(false)
  }

  return (
    <Dialog key={item?.id ?? 'new'} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editeaza Tag-uri</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tag-uri pentru: <strong>{item?.name}</strong>
          </p>

          {/* Tags input */}
          <div className="space-y-2">
            <Label htmlFor="tag-input">Adauga Tag</Label>
            <div className="flex gap-2">
              <Input
                id="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scrie un tag si apasa Enter"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags display */}
          <div className="space-y-2">
            <Label>Tag-uri ({tags.length})</Label>
            <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/30 min-h-[60px]">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">Niciun tag adaugat</p>
              ) : (
                tags.map((tag) => (
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
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuleaza
          </Button>
          <Button onClick={handleSave}>
            Salveaza
          </Button>
        </DialogFooter>
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
  itemName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemName: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sterge Media</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Esti sigur ca vrei sa stergi <strong>{itemName}</strong>?
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
// Main Component
// ============================================================================

export function LibraryGrid({
  items,
  onSelect,
  selectedIds = [],
  className,
}: LibraryGridProps) {
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterTag, setFilterTag] = useState<string>('')
  const [editingItem, setEditingItem] = useState<ContentLibraryItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<ContentLibraryItem | null>(null)

  // Store actions
  const updateLibraryItem = useSocialStore((state) => state.updateLibraryItem)
  const removeFromLibrary = useSocialStore((state) => state.removeFromLibrary)

  // Get all unique tags from items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    items.forEach((item) => {
      item.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [items])

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType)
    }

    // Filter by tag
    if (filterTag) {
      result = result.filter((item) =>
        item.tags.some((tag) => tag.toLowerCase() === filterTag.toLowerCase())
      )
    }

    return result
  }, [items, filterType, filterTag])

  // Handle edit tags save
  const handleEditTagsSave = (data: { tags: string[] }) => {
    if (editingItem) {
      updateLibraryItem(editingItem.id, { tags: data.tags })
      toast.success('Tag-uri actualizate')
      setEditingItem(null)
    }
  }

  // Handle delete
  const handleDelete = () => {
    if (deleteItem) {
      removeFromLibrary(deleteItem.id)
      toast.success('Media stearsa')
      setDeleteItem(null)
    }
  }

  // Empty state message based on filter
  const emptyMessage = useMemo(() => {
    if (filterType === 'image') {
      return 'Nu ai imagini. Adauga din butonul de sus.'
    }
    if (filterType === 'video') {
      return 'Nu ai video-uri. Adauga din butonul de sus.'
    }
    if (filterTag) {
      return `Nu exista media cu tag-ul "${filterTag}".`
    }
    return 'Biblioteca este goala. Adauga media din butonul de sus.'
  }, [filterType, filterTag])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Type filter tabs */}
        <Tabs
          value={filterType}
          onValueChange={(v) => setFilterType(v as FilterType)}
        >
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <FolderOpen className="h-4 w-4" />
              Toate
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1.5">
              <ImageIcon className="h-4 w-4" />
              Imagini
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1.5">
              <Film className="h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <Select
            value={filterTag || 'all'}
            onValueChange={(v) => setFilterTag(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtreaza dupa tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate tag-urile</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredItems.length} din {items.length} elemente
      </p>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {filterType === 'video' ? (
            <Film className="h-12 w-12 text-muted-foreground/50 mb-4" />
          ) : filterType === 'image' ? (
            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          ) : (
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          )}
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <LibraryItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              onEditTags={setEditingItem}
              onDelete={setDeleteItem}
              selected={selectedIds.includes(item.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Tags Dialog */}
      <EditTagsDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSave={handleEditTagsSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.name ?? ''}
      />
    </div>
  )
}

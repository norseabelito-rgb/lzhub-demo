'use client'

/**
 * PostActions - Dropdown menu with status-appropriate actions for social posts
 * Includes edit, delete, publish, cancel scheduling based on post status
 */

import { useState } from 'react'
import { MoreVertical, Pencil, Trash2, Send, XCircle, RotateCcw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SocialPost } from '@/lib/social/types'
import { useSocialStore } from '@/lib/social/social-store'
import { toast } from 'sonner'

interface PostActionsProps {
  post: SocialPost
  onEdit?: () => void
  onDelete?: () => void
  onViewDetails?: () => void
}

export function PostActions({
  post,
  onEdit,
  onDelete,
  onViewDetails,
}: PostActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const { deletePost, publishPost, cancelSchedule } = useSocialStore()

  const handleDelete = () => {
    deletePost(post.id)
    setShowDeleteDialog(false)
    onDelete?.()
    toast.success('Postarea a fost stearsa')
  }

  const handlePublishNow = async () => {
    setIsPublishing(true)
    try {
      await publishPost(post.id)
      toast.success('Postarea a fost publicata cu succes')
    } catch {
      toast.error('Publicarea a esuat')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCancelSchedule = () => {
    cancelSchedule(post.id)
    toast.success('Programarea a fost anulata')
  }

  const handleRetry = async () => {
    setIsPublishing(true)
    try {
      await publishPost(post.id)
      toast.success('Postarea a fost publicata cu succes')
    } catch {
      toast.error('Publicarea a esuat din nou')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreVertical className="size-4" />
            <span className="sr-only">Actiuni postare</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Actions based on status */}
          {post.status === 'draft' && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Editeaza
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Sterge
              </DropdownMenuItem>
            </>
          )}

          {post.status === 'scheduled' && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Editeaza
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePublishNow} disabled={isPublishing}>
                <Send className="mr-2 size-4" />
                {isPublishing ? 'Se publica...' : 'Publica acum'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCancelSchedule}>
                <XCircle className="mr-2 size-4" />
                Anuleaza programarea
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Sterge
              </DropdownMenuItem>
            </>
          )}

          {post.status === 'published' && (
            <>
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="mr-2 size-4" />
                Vezi detalii
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Sterge
              </DropdownMenuItem>
            </>
          )}

          {post.status === 'failed' && (
            <>
              <DropdownMenuItem onClick={handleRetry} disabled={isPublishing}>
                <RotateCcw className="mr-2 size-4" />
                {isPublishing ? 'Se reincearca...' : 'Reincearca'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Editeaza
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Sterge
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sterge postarea</DialogTitle>
            <DialogDescription>
              Esti sigur ca vrei sa stergi aceasta postare? Aceasta actiune nu poate fi anulata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Anuleaza
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sterge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

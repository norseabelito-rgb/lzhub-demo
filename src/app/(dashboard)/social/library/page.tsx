'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LibraryGrid } from '@/components/social/content-library/library-grid'
import { LibraryUpload } from '@/components/social/content-library/library-upload'
import { useSocialStore } from '@/lib/social'

export default function LibraryPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Get content library from store
  const contentLibrary = useSocialStore((state) => state.contentLibrary)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/social">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Inapoi la Social Media</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Biblioteca de Continut</h1>
            <p className="text-sm text-muted-foreground">
              Imagini si video reutilizabile pentru postarile tale
            </p>
          </div>
        </div>

        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adauga media
        </Button>
      </div>

      {/* Library Grid */}
      <LibraryGrid items={contentLibrary} />

      {/* Upload Dialog */}
      <LibraryUpload
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />
    </div>
  )
}

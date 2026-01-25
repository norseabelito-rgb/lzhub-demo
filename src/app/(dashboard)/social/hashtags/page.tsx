'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HashtagManager } from '@/components/social/hashtag-manager'

export default function HashtagsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/social">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Inapoi la Social Media</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Seturi de Hashtag-uri</h1>
          <p className="text-sm text-muted-foreground">
            Grupeaza hashtag-uri pentru campanii diferite
          </p>
        </div>
      </div>

      {/* Hashtag Manager */}
      <HashtagManager />
    </div>
  )
}

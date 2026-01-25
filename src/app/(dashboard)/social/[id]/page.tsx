'use client'

/**
 * Post Detail/Edit Page
 * Shows post details with edit capability for drafts/scheduled posts
 * Read-only view with metrics for published posts
 * Error handling and retry for failed posts
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { ArrowLeft, AlertCircle, Calendar, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSocialStore } from '@/lib/social/social-store'
import { PLATFORM_LABELS } from '@/lib/social/types'
import type { SocialPost } from '@/lib/social/types'
import { PostStatusBadge } from '@/components/social/post-status-badge'
import { MetricsDisplay } from '@/components/social/metrics-display'
import { PlatformIcon } from '@/components/social/platform-icon'
import { PostActions } from '@/components/social/post-actions'
import { toast } from 'sonner'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const { getPostById, publishPost } = useSocialStore()
  const [post, setPost] = useState<SocialPost | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Load post on mount and when ID changes
  useEffect(() => {
    const foundPost = getPostById(postId)
    if (foundPost) {
      setPost(foundPost)
    } else {
      toast.error('Postarea nu a fost gasita')
      router.push('/social')
    }
  }, [postId, getPostById, router])

  // Subscribe to store changes to update post
  useEffect(() => {
    const unsubscribe = useSocialStore.subscribe((state) => {
      const updatedPost = state.posts.find((p) => p.id === postId)
      if (updatedPost) {
        setPost(updatedPost)
      }
    })
    return unsubscribe
  }, [postId])

  const handleBack = () => {
    router.push('/social')
  }

  const handleEdit = () => {
    // Navigate to edit route (to be implemented with PostComposer)
    router.push(`/social/new?edit=${postId}`)
  }

  const handleDelete = () => {
    router.push('/social')
  }

  const handleRetry = async () => {
    if (!post) return
    setIsRetrying(true)
    try {
      await publishPost(post.id)
      toast.success('Postarea a fost publicata cu succes')
    } catch {
      toast.error('Publicarea a esuat din nou')
    } finally {
      setIsRetrying(false)
    }
  }

  if (!post) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Se incarca...</div>
      </div>
    )
  }

  const isEditable = post.status === 'draft' || post.status === 'scheduled'
  const showMetrics = post.status === 'published'
  const showError = post.status === 'failed'

  const formatDate = (date: Date | null) => {
    if (!date) return null
    const d = date instanceof Date ? date : new Date(date)
    return format(d, "d MMMM yyyy 'la' HH:mm", { locale: ro })
  }

  return (
    <div className="container mx-auto max-w-4xl py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="size-5" />
            <span className="sr-only">Inapoi</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditable ? 'Editeaza postare' : 'Detalii postare'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Creata {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PostStatusBadge status={post.status} />
          <PostActions
            post={post}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={() => {}}
          />
        </div>
      </div>

      {/* Error banner for failed posts */}
      {showError && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Publicarea a esuat</p>
                <p className="text-sm text-muted-foreground">
                  {post.platforms.map((platform) => {
                    const status = post.platformStatuses[platform]
                    if (status.error) {
                      return `${PLATFORM_LABELS[platform]}: ${status.error}`
                    }
                    return null
                  }).filter(Boolean).join(', ') || 'Eroare necunoscuta'}
                </p>
              </div>
            </div>
            <Button onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? 'Se reincearca...' : 'Reincearca'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Caption */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Continut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm">
                {post.caption || <span className="text-muted-foreground italic">Fara text</span>}
              </div>
              {post.hashtags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      <Hash className="size-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media (placeholder for content library items) */}
          {post.mediaIds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {post.mediaIds.map((mediaId) => (
                    <div
                      key={mediaId}
                      className="aspect-square rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
                    >
                      Media
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metrics for published posts */}
          {showMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metrici engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall metrics */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total</p>
                  <MetricsDisplay metrics={post.metrics} />
                </div>

                <Separator />

                {/* Per-platform metrics */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Per platforma</p>
                  {post.platforms.map((platform) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={platform} />
                        <span className="text-sm">{PLATFORM_LABELS[platform]}</span>
                        {post.platformStatuses[platform].postId && (
                          <Badge variant="outline" className="text-xs">
                            ID: {post.platformStatuses[platform].postId}
                          </Badge>
                        )}
                      </div>
                      <MetricsDisplay
                        metrics={post.metrics}
                        platform={platform}
                        compact
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {post.platforms.map((platform) => {
                const platformStatus = post.platformStatuses[platform]
                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={platform} size="lg" />
                      <span>{PLATFORM_LABELS[platform]}</span>
                    </div>
                    <PostStatusBadge status={platformStatus.status} size="sm" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Schedule info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="size-4" />
                Programare
              </CardTitle>
            </CardHeader>
            <CardContent>
              {post.status === 'published' && post.publishedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Publicat</p>
                  <p className="font-medium">{formatDate(post.publishedAt)}</p>
                </div>
              )}
              {post.status === 'scheduled' && post.scheduledAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Programat pentru</p>
                  <p className="font-medium">{formatDate(post.scheduledAt)}</p>
                </div>
              )}
              {post.status === 'draft' && (
                <p className="text-sm text-muted-foreground">
                  Aceasta postare este o ciorna si nu a fost programata.
                </p>
              )}
              {post.status === 'failed' && (
                <p className="text-sm text-muted-foreground">
                  Publicarea a esuat. Editeaza postarea sau reincearca.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action buttons for editable posts */}
          {isEditable && (
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full" onClick={handleEdit}>
                  Editeaza postarea
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

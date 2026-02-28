'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useOnboardingConfigStore } from '@/lib/onboarding'
import { ChapterForm } from './chapter-form'
import { Upload, Trash2, Plus, Pencil, Video, Clock, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_SIZE = 1024 * 1024 * 1024 // 1GB

export function VideoConfig() {
  const config = useOnboardingConfigStore((s) => s.config)
  const isLoading = useOnboardingConfigStore((s) => s.isLoading)
  const deleteVideo = useOnboardingConfigStore((s) => s.deleteVideo)
  const updateVideoDescription = useOnboardingConfigStore((s) => s.updateVideoDescription)
  const addChapter = useOnboardingConfigStore((s) => s.addChapter)
  const updateChapter = useOnboardingConfigStore((s) => s.updateChapter)
  const deleteChapter = useOnboardingConfigStore((s) => s.deleteChapter)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [description, setDescription] = useState(config?.videoDescription ?? '')
  const [descChanged, setDescChanged] = useState(false)
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [editingChapter, setEditingChapter] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef(false)

  const chapters = config?.chapters ?? []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE) {
      toast.error('Fisierul depaseste limita de 1GB')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    cancelRef.current = false

    const uploadId = crypto.randomUUID()
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

    try {
      // Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        if (cancelRef.current) {
          toast.info('Upload anulat')
          setUploading(false)
          return
        }

        const start = i * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append('action', 'chunk')
        formData.append('chunk', chunk)
        formData.append('chunkIndex', i.toString())
        formData.append('totalChunks', totalChunks.toString())
        formData.append('uploadId', uploadId)
        formData.append('totalSize', file.size.toString())

        const res = await fetch('/api/onboarding/config/video/upload', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Eroare la upload chunk')

        setUploadProgress(((i + 1) / totalChunks) * 90)
      }

      // Finalize
      const formData = new FormData()
      formData.append('action', 'finalize')
      formData.append('uploadId', uploadId)
      formData.append('fileName', file.name)
      formData.append('totalSize', file.size.toString())

      const res = await fetch('/api/onboarding/config/video/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Eroare la finalizare upload')

      setUploadProgress(100)
      toast.success('Video uploadat cu succes')

      // Reload config
      await useOnboardingConfigStore.getState().loadConfig()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteVideo = async () => {
    if (!confirm('Sigur doriti sa stergeti video-ul?')) return
    try {
      await deleteVideo()
      toast.success('Video sters')
    } catch {
      toast.error('Eroare la stergerea video-ului')
    }
  }

  const handleSaveDescription = async () => {
    try {
      await updateVideoDescription(description)
      setDescChanged(false)
      toast.success('Descriere salvata')
    } catch {
      toast.error('Eroare la salvare')
    }
  }

  const handleAddChapter = async (data: { title: string; timestamp: number }) => {
    try {
      await addChapter(data)
      setShowChapterForm(false)
      toast.success('Capitol adaugat')
    } catch {
      toast.error('Eroare la adaugarea capitolului')
    }
  }

  const handleUpdateChapter = async (data: { title: string; timestamp: number }) => {
    if (!editingChapter) return
    try {
      await updateChapter(editingChapter, data)
      setEditingChapter(null)
      toast.success('Capitol actualizat')
    } catch {
      toast.error('Eroare la actualizare')
    }
  }

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Stergeti capitolul?')) return
    try {
      await deleteChapter(id)
      toast.success('Capitol sters')
    } catch {
      toast.error('Eroare la stergere')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Video Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Video de Training</CardTitle>
          <CardDescription>
            Uploadati un video pe care angajatii il vor vizualiza in timpul onboarding-ului.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config?.videoUrl ? (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video src="/api/onboarding/config/video/stream" controls className="w-full h-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>{config.videoFileName}</p>
                  {config.videoFileSize && (
                    <p>{(config.videoFileSize / 1024 / 1024).toFixed(1)} MB</p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteVideo}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Sterge Video
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">
                Click pentru a selecta un video sau trageti fisierul aici
              </p>
              <p className="text-xs text-muted-foreground">Maxim 1 GB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!config?.videoUrl && !uploading && (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Selecteaza Video
            </Button>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Se uploadeaza...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => { cancelRef.current = true }}
              >
                Anuleaza
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descriere Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={description}
            onChange={(e) => { setDescription(e.target.value); setDescChanged(true) }}
            placeholder="Descriere afisata deasupra playerului..."
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSaveDescription}
              disabled={!descChanged || isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Salveaza
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chapters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Capitole Video</CardTitle>
              <CardDescription>Definiti capitolele cu timestamps pentru navigare.</CardDescription>
            </div>
            {!showChapterForm && !editingChapter && (
              <Button size="sm" onClick={() => setShowChapterForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adauga Capitol
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showChapterForm && (
            <ChapterForm
              onSubmit={handleAddChapter}
              onCancel={() => setShowChapterForm(false)}
              isLoading={isLoading}
            />
          )}

          {chapters.length === 0 && !showChapterForm ? (
            <p className="text-sm text-muted-foreground text-center py-4">Niciun capitol definit.</p>
          ) : (
            <div className="space-y-2">
              {chapters.map((ch) =>
                editingChapter === ch.id ? (
                  <ChapterForm
                    key={ch.id}
                    initialData={{ title: ch.title, timestamp: ch.timestamp }}
                    onSubmit={handleUpdateChapter}
                    onCancel={() => setEditingChapter(null)}
                    isLoading={isLoading}
                  />
                ) : (
                  <div key={ch.id} className="flex items-center gap-3 p-3 border border-border rounded-md">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground w-12">
                      {formatTime(ch.timestamp)}
                    </span>
                    <span className="flex-1 text-sm">{ch.title}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingChapter(ch.id)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteChapter(ch.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

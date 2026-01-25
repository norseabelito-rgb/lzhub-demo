'use client'

/**
 * Drive Integration Test Page
 * Demo page for testing the Google Drive file picker prototype
 */

import { useState } from 'react'
import { useDriveStore } from '@/lib/drive/drive-store'
import { DrivePicker } from '@/components/drive/drive-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, ImageIcon, Cloud, FolderOpen, Clock, CheckCircle } from 'lucide-react'
import type { DriveFile } from '@/lib/drive/types'
import Image from 'next/image'

export default function DriveTestPage() {
  // Selected files from picker
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([])

  // Get store state for debugging
  const isOpen = useDriveStore((s) => s.isOpen)
  const isConnected = useDriveStore((s) => s.isConnected)
  const currentTab = useDriveStore((s) => s.currentTab)
  const selectionCount = useDriveStore((s) => s.selectedIds.size)
  const open = useDriveStore((s) => s.open)

  // Handle picker selection
  const handleSelect = (files: DriveFile[]) => {
    setSelectedFiles(files)
  }

  // Handle picker cancel
  const handleCancel = () => {
    // Optional: do something on cancel
  }

  // Clear results
  const handleClear = () => {
    setSelectedFiles([])
  }

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-glow text-primary">Drive Integration</h1>
          <p className="text-sm text-muted-foreground">
            Selecteaza imagini din Google Drive
          </p>
        </div>
      </div>

      {/* Test scenarios */}
      <Card className="hover:border-primary/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg text-glow text-primary">Optiuni Selectare</CardTitle>
          <CardDescription>
            Deschide picker-ul in diferite moduri de selectare
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={() => open('single')} variant="glow" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Selectie Singulara
          </Button>
          <Button onClick={() => open('multi')} variant="outline-glow" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Selectie Multipla
          </Button>
        </CardContent>
      </Card>

      {/* Selected files display */}
      <Card className="hover:border-primary/30 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-glow text-primary">Fisiere Selectate</CardTitle>
              <CardDescription>
                Fisierele returnate din picker
              </CardDescription>
            </div>
            {selectedFiles.length > 0 && (
              <Button variant="outline-glow" size="sm" onClick={handleClear}>
                Sterge Selectia
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <ImageIcon className="mb-2 h-12 w-12" />
              <p>Niciun fisier selectat</p>
              <p className="text-sm">Foloseste picker-ul pentru a selecta poze</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-muted hover:border-primary/50 hover:glow-subtle transition-all cursor-pointer"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={file.thumbnailLink}
                      alt={file.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium" title={file.name}>
                      {file.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground" title={file.id}>
                      ID: {file.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store state debug panel */}
      <Card className="hover:border-primary/30 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg text-glow text-primary">Status Conectare</CardTitle>
          <CardDescription>
            Starea curenta a conexiunii Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-md border border-border p-3">
              {isOpen ? (
                <FolderOpen className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Picker</p>
                <p className="text-sm font-medium">{isOpen ? 'Open' : 'Closed'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border p-3">
              {isConnected ? (
                <Cloud className="h-5 w-5 text-green-500" />
              ) : (
                <Cloud className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Connected</p>
                <p className="text-sm font-medium">{isConnected ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border p-3">
              {currentTab === 'recent' ? (
                <Clock className="h-5 w-5 text-primary" />
              ) : (
                <FolderOpen className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Tab</p>
                <p className="text-sm font-medium capitalize">{currentTab}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border p-3">
              <CheckCircle className={`h-5 w-5 ${selectionCount > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-xs text-muted-foreground">Selected</p>
                <p className="text-sm font-medium">{selectionCount} files</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The picker component (rendered as dialog) */}
      <DrivePicker onSelect={handleSelect} onCancel={handleCancel} />
    </div>
  )
}

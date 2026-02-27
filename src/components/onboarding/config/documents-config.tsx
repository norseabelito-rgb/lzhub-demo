'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOnboardingConfigStore } from '@/lib/onboarding'
import { DocumentForm } from './document-form'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { OnboardingConfigDocument } from '@/lib/onboarding'

export function DocumentsConfig() {
  const config = useOnboardingConfigStore((s) => s.config)
  const isLoading = useOnboardingConfigStore((s) => s.isLoading)
  const addDocument = useOnboardingConfigStore((s) => s.addDocument)
  const updateDocument = useOnboardingConfigStore((s) => s.updateDocument)
  const deleteDocument = useOnboardingConfigStore((s) => s.deleteDocument)
  const reorderDocuments = useOnboardingConfigStore((s) => s.reorderDocuments)

  const [showForm, setShowForm] = useState(false)
  const [editingDoc, setEditingDoc] = useState<OnboardingConfigDocument | null>(null)

  const documents = config?.documents ?? []

  const handleAdd = async (data: { title: string; content: string; minReadingSeconds: number }) => {
    try {
      await addDocument(data)
      setShowForm(false)
      toast.success('Document adaugat')
    } catch {
      toast.error('Eroare la adaugarea documentului')
    }
  }

  const handleUpdate = async (data: { title: string; content: string; minReadingSeconds: number }) => {
    if (!editingDoc) return
    try {
      await updateDocument(editingDoc.id, data)
      setEditingDoc(null)
      toast.success('Document actualizat')
    } catch {
      toast.error('Eroare la actualizarea documentului')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriti sa stergeti acest document?')) return
    try {
      await deleteDocument(id)
      toast.success('Document sters')
    } catch {
      toast.error('Eroare la stergerea documentului')
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const ids = documents.map((d) => d.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    await reorderDocuments(ids)
  }

  const handleMoveDown = async (index: number) => {
    if (index === documents.length - 1) return
    const ids = documents.map((d) => d.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    await reorderDocuments(ids)
  }

  if (editingDoc) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Editeaza Document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm
            initialData={{
              title: editingDoc.title,
              content: editingDoc.content,
              minReadingSeconds: editingDoc.minReadingSeconds,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingDoc(null)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    )
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Nou</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documente de Instruire</CardTitle>
            <CardDescription>
              Gestioneaza documentele pe care angajatii trebuie sa le citeasca in timpul onboarding-ului.
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adauga Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Niciun document adaugat. Adaugati primul document.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-4 border border-border rounded-lg"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === documents.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Timp minim citire: {doc.minReadingSeconds}s
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingDoc(doc)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

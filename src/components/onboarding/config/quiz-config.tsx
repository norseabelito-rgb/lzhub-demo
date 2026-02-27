'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useOnboardingConfigStore } from '@/lib/onboarding'
import { QuestionForm } from './question-form'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, HelpCircle, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { OnboardingConfigQuestion, QuestionType, QuizQuestionOption } from '@/lib/onboarding'

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Alegere multipla',
  true_false: 'Adevarat/Fals',
  multi_select: 'Selectie multipla',
  open_text: 'Raspuns liber',
}

export function QuizConfig() {
  const config = useOnboardingConfigStore((s) => s.config)
  const isLoading = useOnboardingConfigStore((s) => s.isLoading)
  const updateQuizSettings = useOnboardingConfigStore((s) => s.updateQuizSettings)
  const addQuestion = useOnboardingConfigStore((s) => s.addQuestion)
  const updateQuestion = useOnboardingConfigStore((s) => s.updateQuestion)
  const deleteQuestion = useOnboardingConfigStore((s) => s.deleteQuestion)
  const reorderQuestions = useOnboardingConfigStore((s) => s.reorderQuestions)

  const [threshold, setThreshold] = useState(config?.quizPassThreshold ?? 80)
  const [maxAttempts, setMaxAttempts] = useState(config?.quizMaxAttempts ?? 3)
  const [settingsChanged, setSettingsChanged] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<OnboardingConfigQuestion | null>(null)

  const questions = config?.questions ?? []

  const handleSaveSettings = async () => {
    try {
      await updateQuizSettings(threshold, maxAttempts)
      setSettingsChanged(false)
      toast.success('Setari quiz salvate')
    } catch {
      toast.error('Eroare la salvare')
    }
  }

  const handleAddQuestion = async (data: { type: QuestionType; text: string; options: QuizQuestionOption[]; correctAnswer: string | string[]; sortOrder: number }) => {
    try {
      await addQuestion(data)
      setShowForm(false)
      toast.success('Intrebare adaugata')
    } catch {
      toast.error('Eroare la adaugare')
    }
  }

  const handleUpdateQuestion = async (data: { type: QuestionType; text: string; options: QuizQuestionOption[]; correctAnswer: string | string[]; sortOrder: number }) => {
    if (!editingQuestion) return
    try {
      await updateQuestion(editingQuestion.id, data)
      setEditingQuestion(null)
      toast.success('Intrebare actualizata')
    } catch {
      toast.error('Eroare la actualizare')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Stergeti intrebarea?')) return
    try {
      await deleteQuestion(id)
      toast.success('Intrebare stearsa')
    } catch {
      toast.error('Eroare la stergere')
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const ids = questions.map((q) => q.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    await reorderQuestions(ids)
  }

  const handleMoveDown = async (index: number) => {
    if (index === questions.length - 1) return
    const ids = questions.map((q) => q.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    await reorderQuestions(ids)
  }

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Setari Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Prag trecere: {threshold}%</Label>
            <Slider
              value={[threshold]}
              onValueChange={([v]) => { setThreshold(v); setSettingsChanged(true) }}
              min={0}
              max={100}
              step={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Numar maxim incercari</Label>
            <Input
              id="max-attempts"
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(e) => { setMaxAttempts(parseInt(e.target.value) || 1); setSettingsChanged(true) }}
              className="w-24"
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveSettings} disabled={!settingsChanged || isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Salveaza Setari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Intrebari Quiz</CardTitle>
              <CardDescription>{questions.length} intrebari definite</CardDescription>
            </div>
            {!showForm && !editingQuestion && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adauga Intrebare
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showForm && (
            <QuestionForm
              onSubmit={handleAddQuestion}
              onCancel={() => setShowForm(false)}
              sortOrder={questions.length}
              isLoading={isLoading}
            />
          )}

          {editingQuestion && (
            <QuestionForm
              initialData={{
                type: editingQuestion.type as QuestionType,
                text: editingQuestion.text,
                options: editingQuestion.options as QuizQuestionOption[],
                correctAnswer: editingQuestion.correctAnswer as string | string[],
              }}
              onSubmit={handleUpdateQuestion}
              onCancel={() => setEditingQuestion(null)}
              sortOrder={editingQuestion.sortOrder}
              isLoading={isLoading}
            />
          )}

          {questions.length === 0 && !showForm ? (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Niciun intrebare definita. Adaugati prima intrebare.</p>
            </div>
          ) : (
            !editingQuestion && (
              <div className="space-y-2">
                {questions.map((q, index) => (
                  <div key={q.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveDown(index)} disabled={index === questions.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{index + 1}. {q.text}</p>
                      <p className="text-xs text-muted-foreground">{TYPE_LABELS[q.type as QuestionType]}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingQuestion(q)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteQuestion(q.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}

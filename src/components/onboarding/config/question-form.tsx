'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import type { QuestionType, QuizQuestionOption } from '@/lib/onboarding'

interface QuestionFormProps {
  initialData?: {
    type: QuestionType
    text: string
    options: QuizQuestionOption[]
    correctAnswer: string | string[]
  }
  onSubmit: (data: {
    type: QuestionType
    text: string
    options: QuizQuestionOption[]
    correctAnswer: string | string[]
    sortOrder: number
  }) => Promise<void>
  onCancel: () => void
  sortOrder: number
  isLoading?: boolean
}

export function QuestionForm({ initialData, onSubmit, onCancel, sortOrder, isLoading }: QuestionFormProps) {
  const [type, setType] = useState<QuestionType>(initialData?.type ?? 'multiple_choice')
  const [text, setText] = useState(initialData?.text ?? '')
  const [options, setOptions] = useState<QuizQuestionOption[]>(
    initialData?.options ?? [
      { id: crypto.randomUUID(), text: '' },
      { id: crypto.randomUUID(), text: '' },
    ]
  )
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>(initialData?.correctAnswer ?? '')

  const handleTypeChange = (newType: QuestionType) => {
    setType(newType)
    if (newType === 'true_false') {
      const tId = crypto.randomUUID()
      const fId = crypto.randomUUID()
      setOptions([
        { id: tId, text: 'Adevarat' },
        { id: fId, text: 'Fals' },
      ])
      setCorrectAnswer(tId)
    } else if (newType === 'open_text') {
      setOptions([])
      setCorrectAnswer('')
    } else if (newType === 'multi_select') {
      setCorrectAnswer([])
    } else {
      setCorrectAnswer('')
    }
  }

  const handleAddOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: '' }])
  }

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter((o) => o.id !== id))
    if (Array.isArray(correctAnswer)) {
      setCorrectAnswer(correctAnswer.filter((a) => a !== id))
    } else if (correctAnswer === id) {
      setCorrectAnswer('')
    }
  }

  const handleOptionTextChange = (id: string, newText: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text: newText } : o)))
  }

  const handleCorrectToggle = (optionId: string) => {
    if (type === 'multi_select') {
      const arr = Array.isArray(correctAnswer) ? correctAnswer : []
      setCorrectAnswer(
        arr.includes(optionId) ? arr.filter((a) => a !== optionId) : [...arr, optionId]
      )
    } else {
      setCorrectAnswer(optionId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    await onSubmit({ type, text: text.trim(), options, correctAnswer, sortOrder })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tip intrebare</Label>
          <Select value={type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Alegere multipla (un raspuns)</SelectItem>
              <SelectItem value="true_false">Adevarat / Fals</SelectItem>
              <SelectItem value="multi_select">Selectie multipla (mai multe raspunsuri)</SelectItem>
              <SelectItem value="open_text">Raspuns liber</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Text intrebare</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrieti intrebarea..."
          required
        />
      </div>

      {type !== 'open_text' && (
        <div className="space-y-3">
          <Label>Optiuni {type === 'multi_select' ? '(bifati raspunsurile corecte)' : '(selectati raspunsul corect)'}</Label>
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              {type === 'multi_select' ? (
                <Checkbox
                  checked={Array.isArray(correctAnswer) && correctAnswer.includes(opt.id)}
                  onCheckedChange={() => handleCorrectToggle(opt.id)}
                />
              ) : (
                <button
                  type="button"
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    correctAnswer === opt.id ? 'border-accent bg-accent' : 'border-muted-foreground'
                  }`}
                  onClick={() => handleCorrectToggle(opt.id)}
                >
                  {correctAnswer === opt.id && <div className="w-2 h-2 rounded-full bg-background" />}
                </button>
              )}
              <Input
                value={opt.text}
                onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                placeholder="Text optiune..."
                disabled={type === 'true_false'}
                className="flex-1"
              />
              {type !== 'true_false' && options.length > 2 && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveOption(opt.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {type !== 'true_false' && (
            <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="gap-1">
              <Plus className="h-3 w-3" />
              Adauga Optiune
            </Button>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Anuleaza</Button>
        <Button type="submit" disabled={!text.trim() || isLoading} className="gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {initialData ? 'Actualizeaza' : 'Adauga'}
        </Button>
      </div>
    </form>
  )
}

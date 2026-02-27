'use client'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface QuizOption { id: string; text: string }

interface QuizQuestionType {
  id: string
  text: string
  type: string
  options: QuizOption[]
  correctAnswer: string | string[]
}

export interface QuizQuestionProps {
  /** The question data */
  question: QuizQuestionType
  /** Current selected answer(s) */
  selectedAnswer: string | string[] | null
  /** Callback when answer changes */
  onAnswerChange: (answer: string | string[]) => void
  /** Question number (1-indexed) for display */
  questionNumber: number
  /** Total number of questions for display */
  totalQuestions: number
  /** Whether input is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Individual quiz question component
 * Supports multiple_choice, true_false, and multi_select question types
 *
 * - Does NOT reveal correct answers
 * - Handles single and multiple selection
 */
export function QuizQuestion({
  question,
  selectedAnswer,
  onAnswerChange,
  questionNumber,
  totalQuestions,
  disabled = false,
  className,
}: QuizQuestionProps) {
  const isMultiSelect = question.type === 'multi_select'

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (disabled) return

    if (isMultiSelect) {
      // For multi_select, toggle the option in the array
      const currentSelection = Array.isArray(selectedAnswer) ? selectedAnswer : []
      const newSelection = currentSelection.includes(optionId)
        ? currentSelection.filter((id) => id !== optionId)
        : [...currentSelection, optionId]
      onAnswerChange(newSelection)
    } else {
      // For single selection (multiple_choice, true_false)
      onAnswerChange(optionId)
    }
  }

  // Check if an option is selected
  const isOptionSelected = (optionId: string): boolean => {
    if (isMultiSelect) {
      return Array.isArray(selectedAnswer) && selectedAnswer.includes(optionId)
    }
    return selectedAnswer === optionId
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Question header */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          Intrebarea {questionNumber} din {totalQuestions}
        </span>
        <h3 className="text-xl font-semibold text-foreground">{question.text}</h3>
        {isMultiSelect && (
          <span className="text-sm text-muted-foreground italic">
            Selecteaza toate raspunsurile corecte
          </span>
        )}
      </div>

      {/* Options */}
      {question.type !== 'open_text' && (
      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={isOptionSelected(option.id)}
            isMultiSelect={isMultiSelect}
            disabled={disabled}
            onSelect={() => handleOptionSelect(option.id)}
          />
        ))}
      </div>
      )}

      {question.type === 'open_text' && (
        <div className="space-y-2">
          <Textarea
            value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Scrieti raspunsul..."
            disabled={disabled}
            rows={4}
          />
        </div>
      )}
    </div>
  )
}

interface OptionItemProps {
  option: QuizOption
  isSelected: boolean
  isMultiSelect: boolean
  disabled: boolean
  onSelect: () => void
}

function OptionItem({ option, isSelected, isMultiSelect, disabled, onSelect }: OptionItemProps) {
  const baseClasses = cn(
    'flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer',
    'hover:border-accent/50 hover:bg-accent/5',
    isSelected && 'border-accent bg-accent/10',
    !isSelected && 'border-border',
    disabled && 'cursor-not-allowed opacity-60'
  )

  if (isMultiSelect) {
    return (
      <div
        className={baseClasses}
        onClick={onSelect}
        role="checkbox"
        aria-checked={isSelected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <Checkbox
          id={option.id}
          checked={isSelected}
          disabled={disabled}
          onCheckedChange={onSelect}
          className="pointer-events-none"
        />
        <Label
          htmlFor={option.id}
          className="flex-1 cursor-pointer font-normal text-base"
        >
          {option.text}
        </Label>
      </div>
    )
  }

  // Single selection (radio-like behavior)
  return (
    <div
      className={baseClasses}
      onClick={onSelect}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          isSelected ? 'border-accent bg-accent' : 'border-muted-foreground'
        )}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-background" />}
      </div>
      <span className="flex-1 text-base">{option.text}</span>
    </div>
  )
}

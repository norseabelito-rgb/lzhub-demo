'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { AlertTriangle, History, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  DISCIPLINE_LEVELS,
  VIOLATION_CATEGORIES,
  VIOLATION_CATEGORY_LABELS,
  DISCIPLINE_LEVEL_LABELS,
  useWarningStore,
  getTemplateForCategory,
  type DisciplineLevel,
  type ViolationCategory,
} from '@/lib/warnings'
import { EmployeeSelector } from './employee-selector'
import { DisciplineStepper } from './discipline-stepper'
import { SignatureCanvas } from './signature-canvas'

// ============================================================================
// Types
// ============================================================================

export interface WarningFormData {
  employeeId: string
  category: ViolationCategory
  incidentDate: Date
  description: string
  witness?: string
  level: DisciplineLevel
  skipLevelJustification?: string
  managerSignature: string
}

export interface WarningFormProps {
  /** Callback when form is submitted */
  onSubmit: (data: WarningFormData) => void
  /** Callback when form is cancelled */
  onCancel: () => void
  /** Current manager's ID */
  managerId: string
  /** Current manager's name (for signature) */
  managerName: string
  /** Pre-selected employee ID (optional) */
  preselectedEmployeeId?: string
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// Schema
// ============================================================================

const warningSchema = z.object({
  employeeId: z.string().min(1, 'Selecteaza un angajat'),
  category: z.enum(['tardiness', 'no_show', 'policy_violation', 'performance', 'insubordination', 'safety_violation', 'customer_complaint', 'cash_handling', 'uniform_appearance', 'other'], {
    message: 'Selecteaza o categorie',
  }),
  incidentDate: z.string()
    .min(1, 'Data incidentului este obligatorie')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data invalida')
    .refine(
      (dateStr) => new Date(dateStr) <= new Date(),
      'Data nu poate fi in viitor'
    ),
  description: z.string()
    .min(20, 'Descrierea trebuie sa aiba minim 20 caractere')
    .max(2000, 'Descrierea nu poate depasi 2000 caractere'),
  witness: z.string().optional(),
  level: z.enum(['verbal', 'written', 'final', 'termination'], {
    message: 'Selecteaza nivelul de disciplina',
  }),
  skipLevelJustification: z.string().optional(),
  managerSignature: z.string().min(1, 'Semnatura manager este obligatorie'),
}).refine(
  () => {
    // Validation for skip level justification is handled in canSubmit
    return true
  },
  {
    message: 'Justificarea este obligatorie cand se sar niveluri',
    path: ['skipLevelJustification'],
  }
)

type FormData = z.infer<typeof warningSchema>

// ============================================================================
// Helper Functions
// ============================================================================

/** Check if selected level skips the recommended progression */
function isSkippingLevel(
  currentLevel: DisciplineLevel | null,
  selectedLevel: DisciplineLevel
): boolean {
  const currentIndex = currentLevel ? DISCIPLINE_LEVELS.indexOf(currentLevel) : -1
  const selectedIndex = DISCIPLINE_LEVELS.indexOf(selectedLevel)
  // Skipping if selecting more than 1 level ahead
  return selectedIndex > currentIndex + 1
}

// ============================================================================
// Component
// ============================================================================

/**
 * Warning creation form with validation
 * Captures incident details, discipline level, and manager signature
 */
export function WarningForm({
  onSubmit,
  onCancel,
  managerId,
  managerName,
  preselectedEmployeeId,
  className,
}: WarningFormProps) {
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('')

  // Store access
  const getCurrentLevel = useWarningStore((state) => state.getCurrentLevel)
  const getNextLevel = useWarningStore((state) => state.getNextLevel)
  const getActiveWarningsForEmployee = useWarningStore((state) => state.getActiveWarningsForEmployee)

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(warningSchema),
    defaultValues: {
      employeeId: preselectedEmployeeId || '',
      category: undefined,
      incidentDate: new Date().toISOString().split('T')[0],
      description: '',
      witness: '',
      level: undefined,
      skipLevelJustification: '',
      managerSignature: '',
    },
  })

  // Watch form values
  const watchedEmployeeId = watch('employeeId')
  const watchedCategory = watch('category')
  const watchedLevel = watch('level')

  // Get employee's current discipline level and history
  const employeeCurrentLevel = useMemo(() => {
    if (!watchedEmployeeId) return null
    return getCurrentLevel(watchedEmployeeId)
  }, [watchedEmployeeId, getCurrentLevel])

  const employeeWarningHistory = useMemo(() => {
    if (!watchedEmployeeId) return []
    return getActiveWarningsForEmployee(watchedEmployeeId)
  }, [watchedEmployeeId, getActiveWarningsForEmployee])

  const recommendedNextLevel = useMemo(() => {
    if (!watchedEmployeeId) return 'verbal' as DisciplineLevel
    return getNextLevel(watchedEmployeeId)
  }, [watchedEmployeeId, getNextLevel])

  // Check if skipping levels
  const isSkipping = useMemo(() => {
    if (!watchedLevel) return false
    return isSkippingLevel(employeeCurrentLevel, watchedLevel as DisciplineLevel)
  }, [watchedLevel, employeeCurrentLevel])

  // Auto-select recommended level when employee changes
  useEffect(() => {
    if (watchedEmployeeId) {
      const nextLevel = getNextLevel(watchedEmployeeId)
      setValue('level', nextLevel)
    }
  }, [watchedEmployeeId, getNextLevel, setValue])

  // Pre-fill description with template when category changes
  useEffect(() => {
    if (watchedCategory) {
      const template = getTemplateForCategory(watchedCategory as ViolationCategory)
      setValue('description', template.defaultText)
    }
  }, [watchedCategory, setValue])

  // Handle signature save
  const handleSignatureSave = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl)
    setValue('managerSignature', dataUrl)
  }

  // Handle signature clear
  const handleSignatureClear = () => {
    setSignatureDataUrl('')
    setValue('managerSignature', '')
  }

  // Handle level selection from stepper
  const handleLevelSelect = (level: DisciplineLevel) => {
    setValue('level', level)
  }

  // Form submission
  const handleFormSubmit = (data: FormData) => {
    // Additional validation for skip level justification
    if (isSkipping && (!data.skipLevelJustification || data.skipLevelJustification.trim().length < 10)) {
      // This should be caught by custom validation, but adding safety check
      return
    }

    onSubmit({
      ...data,
      incidentDate: new Date(data.incidentDate),
      category: data.category as ViolationCategory,
      level: data.level as DisciplineLevel,
    })
  }

  // Check if form can be submitted
  const canSubmit = useMemo(() => {
    if (!signatureDataUrl) return false
    if (isSkipping) {
      const justification = watch('skipLevelJustification')
      if (!justification || justification.trim().length < 10) return false
    }
    return true
  }, [signatureDataUrl, isSkipping, watch])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      {/* Section 1: Employee Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Angajat</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeId">Selecteaza Angajat *</Label>
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <EmployeeSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.employeeId?.message}
              />
            )}
          />
        </div>

        {/* Employee History Summary */}
        {watchedEmployeeId && employeeWarningHistory.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <History className="h-4 w-4" />
              <span>Istoric avertismente ({employeeWarningHistory.length})</span>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {employeeWarningHistory.slice(0, 3).map((warning) => (
                <li key={warning.id} className="flex items-center gap-2">
                  <span className="font-medium">
                    {DISCIPLINE_LEVEL_LABELS[warning.level]}
                  </span>
                  <span>-</span>
                  <span>{VIOLATION_CATEGORY_LABELS[warning.category]}</span>
                  <span className="text-xs">
                    ({format(new Date(warning.incidentDate), 'd MMM yyyy', { locale: ro })})
                  </span>
                </li>
              ))}
              {employeeWarningHistory.length > 3 && (
                <li className="text-xs italic">
                  +{employeeWarningHistory.length - 3} alte avertismente
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Section 2: Incident Details */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">Detalii Incident</h3>

        {/* Category Select */}
        <div className="space-y-2">
          <Label htmlFor="category">Categorie Incalcare *</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Selecteaza categoria" />
                </SelectTrigger>
                <SelectContent>
                  {VIOLATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {VIOLATION_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Incident Date */}
        <div className="space-y-2">
          <Label htmlFor="incidentDate">Data Incidentului *</Label>
          <Input
            type="date"
            {...register('incidentDate')}
            max={new Date().toISOString().split('T')[0]}
            aria-invalid={!!errors.incidentDate}
          />
          {errors.incidentDate && (
            <p className="text-sm text-destructive">{errors.incidentDate.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descriere Incident *</Label>
          {watchedCategory && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Info className="h-4 w-4" />
              <span>Textul implicit a fost completat - poti edita</span>
            </div>
          )}
          <Textarea
            {...register('description')}
            placeholder="Descrierea detaliata a incidentului..."
            rows={5}
            aria-invalid={!!errors.description}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minim 20 caractere</span>
            <span>{watch('description')?.length || 0} / 2000</span>
          </div>
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Witness (optional) */}
        <div className="space-y-2">
          <Label htmlFor="witness">Martor (optional)</Label>
          <Input
            {...register('witness')}
            placeholder="Numele martorului"
          />
          <p className="text-xs text-muted-foreground">
            Daca exista un martor la incident, adaugati numele acestuia
          </p>
        </div>
      </div>

      {/* Section 3: Discipline Level */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nivel Disciplina</h3>
          {watchedEmployeeId && (
            <span className="text-sm text-muted-foreground">
              Recomandat: <strong>{DISCIPLINE_LEVEL_LABELS[recommendedNextLevel]}</strong>
            </span>
          )}
        </div>

        <DisciplineStepper
          currentLevel={employeeCurrentLevel}
          selectedLevel={watchedLevel as DisciplineLevel}
          onSelectLevel={handleLevelSelect}
          showLabels={true}
          size="md"
        />

        {errors.level && (
          <p className="text-sm text-destructive">{errors.level.message}</p>
        )}

        {/* Skip Level Justification */}
        {isSkipping && (
          <div className="space-y-2 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <Label htmlFor="skipLevelJustification" className="font-medium">
                Justificare pentru escaladare accelerata *
              </Label>
            </div>
            <Textarea
              {...register('skipLevelJustification')}
              placeholder="Explicati motivul pentru care se sare peste nivelurile de disciplina..."
              rows={3}
              aria-invalid={!!errors.skipLevelJustification}
            />
            <p className="text-xs text-muted-foreground">
              Minim 10 caractere. Aceasta justificare va fi inregistrata in sistemul de audit.
            </p>
            {errors.skipLevelJustification && (
              <p className="text-sm text-destructive">{errors.skipLevelJustification.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Section 4: Manager Signature */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">Semnatura Manager</h3>
        <p className="text-sm text-muted-foreground">
          Semnatura dumneavoastra confirma ca informatiile de mai sus sunt corecte.
        </p>

        <SignatureCanvas
          label={`Semnatura: ${managerName}`}
          onSave={handleSignatureSave}
          onClear={handleSignatureClear}
          width={400}
          height={150}
        />

        {signatureDataUrl && (
          <p className="text-sm text-green-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Semnatura capturata
          </p>
        )}

        {errors.managerSignature && (
          <p className="text-sm text-destructive">{errors.managerSignature.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuleaza
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? 'Se salveaza...' : 'Salveaza Avertisment'}
        </Button>
      </div>
    </form>
  )
}

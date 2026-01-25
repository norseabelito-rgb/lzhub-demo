'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { mockUsers } from '@/lib/auth'
import { useWarningStore, DISCIPLINE_LEVEL_LABELS, type DisciplineLevel } from '@/lib/warnings'

// ============================================================================
// Types
// ============================================================================

export interface EmployeeSelectorProps {
  /** Currently selected employee ID */
  value?: string
  /** Callback when employee is selected */
  onChange: (employeeId: string) => void
  /** Disable the selector */
  disabled?: boolean
  /** Error message to display */
  error?: string
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Get badge variant based on discipline level */
function getLevelBadgeVariant(level: DisciplineLevel | null): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
  label: string
} {
  if (!level) {
    return {
      variant: 'outline',
      className: 'bg-green-500/10 text-green-500 border-green-500/30',
      label: 'Fara avertismente',
    }
  }

  switch (level) {
    case 'verbal':
      return {
        variant: 'secondary',
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
        label: DISCIPLINE_LEVEL_LABELS.verbal,
      }
    case 'written':
      return {
        variant: 'secondary',
        className: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
        label: DISCIPLINE_LEVEL_LABELS.written,
      }
    case 'final':
      return {
        variant: 'secondary',
        className: 'bg-red-500/10 text-red-500 border-red-500/30',
        label: DISCIPLINE_LEVEL_LABELS.final,
      }
    case 'termination':
      return {
        variant: 'destructive',
        className: '',
        label: DISCIPLINE_LEVEL_LABELS.termination,
      }
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * Employee selector with search and discipline level badges
 * Filters for employees only (role === 'angajat')
 */
export function EmployeeSelector({
  value,
  onChange,
  disabled = false,
  error,
  className,
}: EmployeeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const getCurrentLevel = useWarningStore((state) => state.getCurrentLevel)

  // Filter for employees only (not managers)
  const employees = useMemo(() => {
    return mockUsers.filter((user) => user.role === 'angajat')
  }, [])

  // Filter employees by search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees

    const query = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return employees.filter((employee) => {
      const name = employee.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return name.includes(query)
    })
  }, [employees, searchQuery])

  // Get selected employee name
  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === value)
  }, [employees, value])

  const handleSelect = (employeeId: string) => {
    onChange(employeeId)
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={!!error}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            {selectedEmployee ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{selectedEmployee.name}</span>
                {(() => {
                  const level = getCurrentLevel(selectedEmployee.id)
                  const badge = getLevelBadgeVariant(level)
                  return (
                    <Badge variant={badge.variant} className={cn('shrink-0', badge.className)}>
                      {badge.label}
                    </Badge>
                  )
                })()}
              </div>
            ) : (
              <span>Cauta angajat...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          {/* Search input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Cauta dupa nume..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Employee list */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                {searchQuery
                  ? 'Niciun angajat gasit'
                  : 'Nu exista angajati'}
              </p>
            ) : (
              filteredEmployees.map((employee) => {
                const level = getCurrentLevel(employee.id)
                const badge = getLevelBadgeVariant(level)
                const isSelected = value === employee.id

                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => handleSelect(employee.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-left',
                      'hover:bg-accent/50 transition-colors',
                      isSelected && 'bg-accent/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="font-medium">{employee.name}</span>
                    </div>
                    <Badge variant={badge.variant} className={badge.className}>
                      {badge.label}
                    </Badge>
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

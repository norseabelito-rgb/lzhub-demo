'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DriveSearchProps {
  /** Current search value */
  value: string
  /** Called when search value changes */
  onChange: (query: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Additional className for container */
  className?: string
}

/**
 * DriveSearch - Search input for filtering Drive files
 *
 * Features:
 * - Search icon on the left
 * - Clear button when value is present
 * - Controlled input (no debouncing, caller handles if needed)
 */
export function DriveSearch({
  value,
  onChange,
  placeholder = 'Search files...',
  className,
}: DriveSearchProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
          'placeholder:text-muted-foreground',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'dark:bg-input/30',
          'pl-9', // Left padding for search icon
          value && 'pr-9' // Right padding for clear button when value exists
        )}
      />

      {/* Clear button - only shown when value exists */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

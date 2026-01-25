'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  /** Unique key for the column, used to access data */
  key: keyof T | string
  /** Display label for the column header */
  label: string
  /** Custom render function for cell content */
  render?: (value: unknown, item: T) => React.ReactNode
  /** Whether this column should be the "title" in card view (first/prominent) */
  isTitle?: boolean
  /** Whether to hide this column in mobile card view */
  hideOnMobile?: boolean
  /** Additional className for table header */
  headerClassName?: string
  /** Additional className for table cell */
  cellClassName?: string
  /** Whether this column is sortable (visual indicator only) */
  sortable?: boolean
}

export interface ResponsiveTableProps<T extends { id: string }> {
  /** Array of data items to display */
  data: T[]
  /** Column definitions */
  columns: Column<T>[]
  /** Handler for row/card click */
  onRowClick?: (item: T) => void
  /** Additional className for the container */
  className?: string
  /** Additional className for table rows */
  rowClassName?: string | ((item: T) => string)
  /** Show loading skeleton */
  loading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Render custom empty state */
  renderEmpty?: () => React.ReactNode
  /** Sort state for visual indicator */
  sortField?: string
  /** Sort direction */
  sortDirection?: 'asc' | 'desc'
  /** Sort handler */
  onSort?: (field: string) => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

function getCellValue<T>(item: T, column: Column<T>): unknown {
  const key = column.key as string
  if (key.includes('.')) {
    return getNestedValue(item, key)
  }
  return item[column.key as keyof T]
}

// ============================================================================
// Component
// ============================================================================

export function ResponsiveTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  className,
  rowClassName,
  loading,
  emptyMessage = 'Nu exista date',
  renderEmpty,
  sortField,
  sortDirection,
  onSort,
}: ResponsiveTableProps<T>) {
  // Find title column (first isTitle or first column)
  const titleColumn = columns.find(c => c.isTitle) || columns[0]
  const detailColumns = columns.filter(c => c !== titleColumn && !c.hideOnMobile)

  // Handle empty state
  if (!loading && data.length === 0) {
    if (renderEmpty) {
      return <div className={className}>{renderEmpty()}</div>
    }
    return (
      <div className={cn('flex items-center justify-center py-12 text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    col.sortable && onSort && 'cursor-pointer hover:bg-accent/5',
                    col.headerClassName
                  )}
                  onClick={col.sortable && onSort ? () => onSort(String(col.key)) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortField === col.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(item => {
              const rowClasses = typeof rowClassName === 'function'
                ? rowClassName(item)
                : rowClassName

              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-accent/5',
                    rowClasses
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map(col => {
                    const value = getCellValue(item, col)
                    return (
                      <TableCell key={String(col.key)} className={col.cellClassName}>
                        {col.render ? col.render(value, item) : String(value ?? '')}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map(item => {
          const rowClasses = typeof rowClassName === 'function'
            ? rowClassName(item)
            : rowClassName
          const titleValue = getCellValue(item, titleColumn)

          return (
            <Card
              key={item.id}
              className={cn(
                'p-4',
                onRowClick && 'cursor-pointer hover:border-primary/50 active:scale-[0.99] transition-all',
                rowClasses
              )}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {/* Title row - prominent */}
              <div className="mb-3 pb-2 border-b border-border/50">
                <span className="font-semibold text-foreground">
                  {titleColumn.render
                    ? titleColumn.render(titleValue, item)
                    : String(titleValue ?? '')}
                </span>
              </div>

              {/* Detail rows */}
              <div className="space-y-2">
                {detailColumns.map(col => {
                  const value = getCellValue(item, col)
                  return (
                    <div
                      key={String(col.key)}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-muted-foreground">{col.label}</span>
                      <span className="font-medium text-right">
                        {col.render ? col.render(value, item) : String(value ?? '')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

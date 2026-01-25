'use client'

/**
 * DrivePickerTabs - Tab switcher for Recent/Browse views
 * Uses shadcn Tabs component for accessible tab navigation
 */

import { Clock, FolderOpen } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DriveTab } from '@/lib/drive/types'

// ============================================================================
// Types
// ============================================================================

export interface DrivePickerTabsProps {
  /** Currently active tab */
  activeTab: DriveTab
  /** Called when tab changes */
  onTabChange: (tab: DriveTab) => void
}

// ============================================================================
// Component
// ============================================================================

/**
 * DrivePickerTabs - Tab navigation between Recent and Browse views
 *
 * Features:
 * - Two tabs: "Recent" and "Browse Drive"
 * - Icons for visual clarity
 * - Accessible keyboard navigation via radix-ui
 */
export function DrivePickerTabs({
  activeTab,
  onTabChange,
}: DrivePickerTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as DriveTab)}
      className="w-full"
    >
      <TabsList className="w-full">
        <TabsTrigger value="recent" className="flex-1 gap-2">
          <Clock className="h-4 w-4" />
          <span>Recent</span>
        </TabsTrigger>
        <TabsTrigger value="browse" className="flex-1 gap-2">
          <FolderOpen className="h-4 w-4" />
          <span>Browse Drive</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

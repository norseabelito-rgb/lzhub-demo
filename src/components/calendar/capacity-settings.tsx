'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useReservationStore, type CapacitySettings as CapacitySettingsType } from '@/lib/calendar'
import { CapacityIndicator } from './capacity-indicator'

// ============================================================================
// Types
// ============================================================================

interface CapacitySettingsProps {
  /** Callback after settings are saved */
  onSave?: () => void
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: CapacitySettingsType = {
  defaultCapacity: 20,
  warningThreshold: 0.8,
  criticalThreshold: 1.0,
}

// ============================================================================
// Component
// ============================================================================

export function CapacitySettings({ onSave }: CapacitySettingsProps) {
  const capacitySettings = useReservationStore((state) => state.capacitySettings)
  const updateCapacitySettings = useReservationStore((state) => state.updateCapacitySettings)

  // Local state for form editing
  const [capacity, setCapacity] = useState(capacitySettings.defaultCapacity)
  const [warningThreshold, setWarningThreshold] = useState(capacitySettings.warningThreshold * 100)
  const [criticalThreshold, setCriticalThreshold] = useState(capacitySettings.criticalThreshold * 100)

  // Sync local state when store changes
  useEffect(() => {
    setCapacity(capacitySettings.defaultCapacity)
    setWarningThreshold(capacitySettings.warningThreshold * 100)
    setCriticalThreshold(capacitySettings.criticalThreshold * 100)
  }, [capacitySettings])

  // Handle save
  const handleSave = () => {
    updateCapacitySettings({
      defaultCapacity: capacity,
      warningThreshold: warningThreshold / 100,
      criticalThreshold: criticalThreshold / 100,
    })

    toast.success('Setari salvate', {
      description: 'Configuratia capacitatii a fost actualizata.',
    })

    onSave?.()
  }

  // Handle reset to defaults
  const handleReset = () => {
    setCapacity(DEFAULT_SETTINGS.defaultCapacity)
    setWarningThreshold(DEFAULT_SETTINGS.warningThreshold * 100)
    setCriticalThreshold(DEFAULT_SETTINGS.criticalThreshold * 100)

    toast.info('Setari resetate', {
      description: 'Apasa Salveaza pentru a aplica valorile implicite.',
    })
  }

  // Preview values for capacity indicator
  const previewCapacity = capacity
  const availablePreview = Math.floor(previewCapacity * (warningThreshold / 100) * 0.5)
  const warningPreview = Math.floor(previewCapacity * ((warningThreshold + criticalThreshold) / 2 / 100))
  const fullPreview = previewCapacity

  return (
    <div className="space-y-8">
      {/* Capacity per slot */}
      <div className="space-y-3">
        <Label htmlFor="capacity" className="text-base font-medium">
          Capacitate maxima per slot (persoane)
        </Label>
        <Input
          id="capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={100}
          className="w-32"
        />
        <p className="text-sm text-muted-foreground">
          Numarul maxim de persoane permise per interval de 30 minute.
        </p>
      </div>

      {/* Warning threshold slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">
            Prag avertizare (galben)
          </Label>
          <span className="text-sm font-mono text-warning">{warningThreshold}%</span>
        </div>
        <Slider
          value={[warningThreshold]}
          onValueChange={([value]) => {
            setWarningThreshold(value)
            // Ensure warning is always less than or equal to critical
            if (value > criticalThreshold) {
              setCriticalThreshold(value)
            }
          }}
          min={50}
          max={100}
          step={5}
          className="[&_[role=slider]]:bg-warning"
        />
        <p className="text-sm text-muted-foreground">
          Sloturile vor deveni galbene cand ating acest procent din capacitate.
        </p>
      </div>

      {/* Critical threshold slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">
            Prag critic (rosu)
          </Label>
          <span className="text-sm font-mono text-destructive">{criticalThreshold}%</span>
        </div>
        <Slider
          value={[criticalThreshold]}
          onValueChange={([value]) => {
            setCriticalThreshold(value)
            // Ensure critical is always greater than or equal to warning
            if (value < warningThreshold) {
              setWarningThreshold(value)
            }
          }}
          min={50}
          max={150}
          step={5}
          className="[&_[role=slider]]:bg-destructive"
        />
        <p className="text-sm text-muted-foreground">
          Sloturile vor deveni rosii cand ating acest procent din capacitate.
          Poate fi peste 100% pentru a permite suprarezervare.
        </p>
      </div>

      {/* Preview section */}
      <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
        <Label className="text-base font-medium">Previzualizare</Label>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Available preview */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-500">Disponibil</div>
            <div className="text-xs text-muted-foreground">
              {availablePreview} / {previewCapacity} persoane
            </div>
            <CapacityIndicator
              current={availablePreview}
              max={previewCapacity}
              mode="bar"
            />
          </div>

          {/* Warning preview */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-warning">Avertizare</div>
            <div className="text-xs text-muted-foreground">
              {warningPreview} / {previewCapacity} persoane
            </div>
            <CapacityIndicator
              current={warningPreview}
              max={previewCapacity}
              mode="bar"
            />
          </div>

          {/* Full preview */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-destructive">Complet</div>
            <div className="text-xs text-muted-foreground">
              {fullPreview} / {previewCapacity} persoane
            </div>
            <CapacityIndicator
              current={fullPreview}
              max={previewCapacity}
              mode="bar"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          Reseteaza la default
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="size-4" />
          Salveaza
        </Button>
      </div>
    </div>
  )
}

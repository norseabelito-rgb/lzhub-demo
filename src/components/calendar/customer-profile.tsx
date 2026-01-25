'use client'

import { useState, useMemo } from 'react'
import {
  X,
  Phone,
  Mail,
  FileText,
  CalendarPlus,
  Pencil,
  ChevronDown,
  ChevronUp,
  Check,
  Users,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useCustomerStore,
  useReservationStore,
  formatDateRelative,
  type Customer,
} from '@/lib/calendar'
import { TagManager } from './tag-manager'
import { CustomerHistory } from './customer-history'

// ============================================================================
// Types
// ============================================================================

interface CustomerProfileProps {
  customer: Customer
  onQuickBook: (customer: Customer) => void
  onClose?: () => void
}

// ============================================================================
// Component
// ============================================================================

export function CustomerProfile({
  customer,
  onQuickBook,
  onClose,
}: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editData, setEditData] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    notes: customer.notes || '',
  })

  const updateCustomer = useCustomerStore((state) => state.updateCustomer)
  const reservations = useReservationStore((state) => state.reservations)

  // Calculate customer stats
  const stats = useMemo(() => {
    const customerReservations = reservations.filter(
      (r) => r.customerId === customer.id && r.status !== 'cancelled'
    )

    // Total visits (completed or confirmed)
    const completedReservations = customerReservations.filter(
      (r) => r.status === 'completed' || r.status === 'confirmed'
    )
    const totalVisits = completedReservations.length

    // Last visit date
    const sortedByDate = [...customerReservations].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const lastVisitDate = sortedByDate[0]?.date || null

    // Total guests brought
    const totalGuests = completedReservations.reduce(
      (sum, r) => sum + r.partySize,
      0
    )

    return {
      totalVisits,
      lastVisitDate,
      totalGuests,
    }
  }, [reservations, customer.id])

  // Handle save edit
  const handleSave = () => {
    updateCustomer(customer.id, {
      name: editData.name,
      phone: editData.phone,
      email: editData.email || undefined,
      notes: editData.notes || undefined,
    })
    setIsEditing(false)
  }

  // Handle cancel edit
  const handleCancel = () => {
    setEditData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      notes: customer.notes || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl">Profil Client</CardTitle>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="size-5" />
                <span className="sr-only">Inchide</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Name & Contact */}
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nume
                </label>
                <Input
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Telefon
                </label>
                <Input
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Note
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Note despre client..."
                  className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Customer Name */}
              <h2 className="text-2xl font-bold">{customer.name}</h2>

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Phone className="size-4" />
                  {customer.phone}
                </a>
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="size-4" />
                    {customer.email}
                  </a>
                )}
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="rounded-md bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="size-4" />
                    <span className="font-medium">Note:</span>
                  </div>
                  <p className="mt-1 text-sm">{customer.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Etichete
            </p>
            <TagManager
              customerId={customer.id}
              currentTags={customer.tags}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-xl font-bold text-primary">
                  {stats.totalVisits}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Vizite</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">
                {stats.lastVisitDate
                  ? formatDateRelative(stats.lastVisitDate)
                  : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Ultima vizita</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-xl font-bold">{stats.totalGuests}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total oaspeti</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              className="flex-1 sm:flex-none"
              onClick={() => onQuickBook(customer)}
            >
              <CalendarPlus className="mr-2 size-4" />
              Rezervare Noua
            </Button>

            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Anuleaza
                </Button>
                <Button variant="secondary" onClick={handleSave}>
                  <Check className="mr-2 size-4" />
                  Salveaza
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 size-4" />
                Editeaza
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full sm:w-auto"
            >
              {showHistory ? (
                <>
                  <ChevronUp className="mr-2 size-4" />
                  Ascunde Istoric
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 size-4" />
                  Vezi Istoric
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      {showHistory && (
        <div className="mt-4">
          <CustomerHistory customerId={customer.id} />
        </div>
      )}
    </div>
  )
}

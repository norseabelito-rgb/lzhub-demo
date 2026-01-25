'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  CustomerSearch,
  CustomerProfile,
} from '@/components/calendar'
import type { Customer } from '@/lib/calendar'

// ============================================================================
// Page Component
// ============================================================================

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Handle customer selection from search
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  // Handle quick book - placeholder for now, will open reservation modal
  const handleQuickBook = (customer: Customer) => {
    // TODO: In a future plan, this will open the reservation modal
    // with customer data pre-filled
    toast.info(`Rezervare noua pentru ${customer.name}`, {
      description: 'Functionalitate disponibila in curand',
    })
  }

  // Handle close profile
  const handleCloseProfile = () => {
    setSelectedCustomer(null)
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/calendar">
              <ArrowLeft className="size-5" />
              <span className="sr-only">Inapoi la calendar</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Clienti</h1>
            <p className="text-muted-foreground">
              Cauta si gestioneaza clientii
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left Column - Search */}
        <div className="flex flex-col">
          <CustomerSearch
            onSelectCustomer={handleSelectCustomer}
            className="h-[calc(100vh-200px)] min-h-[400px]"
          />
        </div>

        {/* Right Column - Profile or Empty State */}
        <div className="min-h-[400px]">
          {selectedCustomer ? (
            <CustomerProfile
              customer={selectedCustomer}
              onQuickBook={handleQuickBook}
              onClose={handleCloseProfile}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-card/50 p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <Users className="size-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Selecteaza un client</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Foloseste cautarea din stanga pentru a gasi un client
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

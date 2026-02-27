import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * Parse a time string (HH:mm) into minutes from midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTimeToMinutes(start1)
  const e1 = parseTimeToMinutes(end1)
  const s2 = parseTimeToMinutes(start2)
  const e2 = parseTimeToMinutes(end2)
  return s1 < e2 && s2 < e1
}

/**
 * Calculate end time from start time (default 1 hour)
 */
function calculateEndTime(startTime: string): string {
  const minutes = parseTimeToMinutes(startTime) + 60
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const customerId = searchParams.get('customerId')

  if (!date) {
    return NextResponse.json(
      { error: 'Parametrul date este obligatoriu (format: YYYY-MM-DD)' },
      { status: 400 }
    )
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Format data invalid (asteptat: YYYY-MM-DD)' },
      { status: 400 }
    )
  }

  const where: any = {
    date,
    status: { not: 'cancelled' },
  }

  if (customerId) {
    where.customerId = customerId
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      customer: {
        include: {
          tags: { include: { tag: true } },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  })

  const mapped = reservations.map((r: any) => ({
    ...r,
    customer: {
      ...r.customer,
      tags: r.customer.tags.map((ct: any) => ct.tag),
    },
  }))

  return NextResponse.json(mapped)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const {
    customerId,
    date,
    startTime,
    partySize,
    occasion,
    notes,
    isWalkup,
    endTime: providedEndTime,
    conflictOverridden,
  } = body

  // Validate required fields
  if (!customerId || !date || !startTime || !partySize || !occasion) {
    return NextResponse.json(
      { error: 'Campuri obligatorii: customerId, date, startTime, partySize, occasion' },
      { status: 400 }
    )
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Format data invalid (asteptat: YYYY-MM-DD)' },
      { status: 400 }
    )
  }

  if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
    return NextResponse.json(
      { error: 'Ora de inceput invalida' },
      { status: 400 }
    )
  }

  if (typeof partySize !== 'number' || partySize < 1 || partySize > 50) {
    return NextResponse.json(
      { error: 'Numarul de persoane trebuie sa fie intre 1 si 50' },
      { status: 400 }
    )
  }

  const validOccasions = ['regular', 'birthday', 'corporate', 'group', 'other']
  if (!validOccasions.includes(occasion)) {
    return NextResponse.json(
      { error: 'Tip rezervare invalid' },
      { status: 400 }
    )
  }

  // Verify customer exists
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) {
    return NextResponse.json({ error: 'Client negasit' }, { status: 404 })
  }

  const endTime = providedEndTime || calculateEndTime(startTime)

  // Conflict detection
  const capacitySettings = await prisma.capacitySettings.findUnique({
    where: { id: 'default' },
  })
  const defaultCapacity = capacitySettings?.defaultCapacity ?? 40
  const warningThreshold = capacitySettings?.warningThreshold ?? 0.8
  const criticalThreshold = capacitySettings?.criticalThreshold ?? 1.0

  // Get all active reservations for the date
  const dayReservations = await prisma.reservation.findMany({
    where: {
      date,
      status: { not: 'cancelled' },
    },
  })

  // Find overlapping reservations
  const overlapping = dayReservations.filter((r: any) =>
    timeRangesOverlap(startTime, endTime, r.startTime, r.endTime)
  )

  let hasConflict = false
  let conflictReason: string | undefined
  let conflictSeverity: 'warning' | 'critical' | undefined

  if (overlapping.length > 0) {
    const totalExistingPeople = overlapping.reduce((sum: number, r: any) => sum + r.partySize, 0)
    const totalWithNew = totalExistingPeople + partySize
    const capacityUsed = totalWithNew / defaultCapacity

    if (capacityUsed >= criticalThreshold) {
      hasConflict = true
      conflictReason = `Capacitate depasita: ${totalWithNew}/${defaultCapacity} jucatori (${Math.round(capacityUsed * 100)}%)`
      conflictSeverity = 'critical'
    } else if (capacityUsed >= warningThreshold) {
      hasConflict = true
      conflictReason = `Capacitate aproape plina: ${totalWithNew}/${defaultCapacity} jucatori (${Math.round(capacityUsed * 100)}%)`
      conflictSeverity = 'warning'
    }
  }

  const reservation = await prisma.reservation.create({
    data: {
      customerId,
      date,
      startTime,
      endTime,
      partySize,
      occasion,
      notes: notes || null,
      status: 'confirmed',
      hasConflict,
      conflictOverridden: hasConflict && !!conflictOverridden,
      isWalkup: !!isWalkup,
      createdBy: session.user.id,
    },
    include: {
      customer: {
        include: {
          tags: { include: { tag: true } },
        },
      },
    },
  })

  return NextResponse.json(
    {
      ...reservation,
      customer: {
        ...reservation.customer,
        tags: reservation.customer.tags.map((ct: any) => ct.tag),
      },
      conflict: hasConflict
        ? { hasConflict, reason: conflictReason, severity: conflictSeverity }
        : undefined,
    },
    { status: 201 }
  )
}

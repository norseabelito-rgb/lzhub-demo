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

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

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

  // Generate 30-minute slots from 09:00 to 22:00
  const slots = []
  for (let hour = 9; hour < 22; hour++) {
    for (const min of [0, 30]) {
      const startMinutes = hour * 60 + min
      const endMinutes = startMinutes + 30
      const startTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`

      // Find reservations overlapping this 30-min slot
      const overlapping = dayReservations.filter((r: any) =>
        timeRangesOverlap(startTime, endTime, r.startTime, r.endTime)
      )

      const currentBookings = overlapping.reduce((sum: number, r: any) => sum + r.partySize, 0)
      const percentage = currentBookings / defaultCapacity

      let status: 'available' | 'warning' | 'full' = 'available'
      if (percentage >= criticalThreshold) {
        status = 'full'
      } else if (percentage >= warningThreshold) {
        status = 'warning'
      }

      slots.push({
        date,
        startTime,
        endTime,
        capacity: defaultCapacity,
        currentBookings,
        percentage,
        status,
      })
    }
  }

  return NextResponse.json(slots)
}

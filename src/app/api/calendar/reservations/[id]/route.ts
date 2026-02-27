import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          tags: { include: { tag: true } },
        },
      },
    },
  })

  if (!reservation) {
    return NextResponse.json({ error: 'Rezervare negasita' }, { status: 404 })
  }

  return NextResponse.json({
    ...reservation,
    customer: {
      ...reservation.customer,
      tags: reservation.customer.tags.map((ct: any) => ct.tag),
    },
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.reservation.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Rezervare negasita' }, { status: 404 })
  }

  const {
    date,
    startTime,
    endTime,
    partySize,
    occasion,
    notes,
    status,
    hasConflict,
    conflictOverridden,
    isWalkup,
  } = body

  // Validate fields if provided
  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Format data invalid (asteptat: YYYY-MM-DD)' },
      { status: 400 }
    )
  }

  if (startTime !== undefined && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
    return NextResponse.json(
      { error: 'Ora de inceput invalida' },
      { status: 400 }
    )
  }

  if (partySize !== undefined && (typeof partySize !== 'number' || partySize < 1 || partySize > 50)) {
    return NextResponse.json(
      { error: 'Numarul de persoane trebuie sa fie intre 1 si 50' },
      { status: 400 }
    )
  }

  const validOccasions = ['regular', 'birthday', 'corporate', 'group', 'other']
  if (occasion !== undefined && !validOccasions.includes(occasion)) {
    return NextResponse.json(
      { error: 'Tip rezervare invalid' },
      { status: 400 }
    )
  }

  const validStatuses = ['confirmed', 'cancelled', 'completed', 'no_show']
  if (status !== undefined && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Status invalid' },
      { status: 400 }
    )
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      ...(date !== undefined && { date }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(partySize !== undefined && { partySize }),
      ...(occasion !== undefined && { occasion }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(status !== undefined && { status }),
      ...(hasConflict !== undefined && { hasConflict }),
      ...(conflictOverridden !== undefined && { conflictOverridden }),
      ...(isWalkup !== undefined && { isWalkup }),
    },
    include: {
      customer: {
        include: {
          tags: { include: { tag: true } },
        },
      },
    },
  })

  return NextResponse.json({
    ...reservation,
    customer: {
      ...reservation.customer,
      tags: reservation.customer.tags.map((ct: any) => ct.tag),
    },
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.reservation.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Rezervare negasita' }, { status: 404 })
  }

  // Soft delete by setting status to cancelled
  await prisma.reservation.update({
    where: { id },
    data: { status: 'cancelled' },
  })

  return NextResponse.json({ success: true })
}

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

  const warning = await prisma.warning.findUnique({
    where: { id },
    include: {
      employee: {
        select: { id: true, name: true, email: true, role: true },
      },
      issuedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      clearedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  })

  if (!warning) {
    return NextResponse.json({ error: 'Avertisment negasit' }, { status: 404 })
  }

  return NextResponse.json(warning)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  // Manager only
  if (session.user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Doar managerii pot modifica avertismente' },
      { status: 403 }
    )
  }

  const { id } = await params

  const existing = await prisma.warning.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Avertisment negasit' }, { status: 404 })
  }

  // Only allow updates if still pending
  if (existing.status !== 'pending_acknowledgment') {
    return NextResponse.json(
      { error: 'Avertismentul nu mai poate fi modificat (status: ' + existing.status + ')' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { level, category, description, incidentDate, witness, attachments } = body

  const updateData: Record<string, unknown> = {}
  if (level !== undefined) updateData.level = level
  if (category !== undefined) updateData.category = category
  if (description !== undefined) updateData.description = description
  if (incidentDate !== undefined) updateData.incidentDate = new Date(incidentDate)
  if (witness !== undefined) updateData.witness = witness || null
  if (attachments !== undefined) updateData.attachments = attachments

  const warning = await prisma.warning.update({
    where: { id },
    data: updateData,
    include: {
      employee: {
        select: { id: true, name: true, email: true, role: true },
      },
      issuedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  })

  return NextResponse.json(warning)
}

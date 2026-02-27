import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
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
      { error: 'Doar managerii pot anula avertismente' },
      { status: 403 }
    )
  }

  const { id } = await params

  const warning = await prisma.warning.findUnique({ where: { id } })
  if (!warning) {
    return NextResponse.json({ error: 'Avertisment negasit' }, { status: 404 })
  }

  if (warning.isCleared) {
    return NextResponse.json(
      { error: 'Avertismentul este deja anulat' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { reason } = body

  if (!reason) {
    return NextResponse.json(
      { error: 'Motivul anularii este obligatoriu' },
      { status: 400 }
    )
  }

  const now = new Date()

  const updated = await prisma.warning.update({
    where: { id },
    data: {
      status: 'cleared',
      isCleared: true,
      clearedAt: now,
      clearedById: session.user.id,
      clearedReason: reason,
    },
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

  return NextResponse.json(updated)
}

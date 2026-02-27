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

  const { id } = await params

  const warning = await prisma.warning.findUnique({ where: { id } })
  if (!warning) {
    return NextResponse.json({ error: 'Avertisment negasit' }, { status: 404 })
  }

  // Only the warning's employee can refuse
  if (warning.employeeId !== session.user.id) {
    return NextResponse.json(
      { error: 'Doar angajatul vizat poate refuza semnarea avertismentului' },
      { status: 403 }
    )
  }

  // Must be pending
  if (warning.status !== 'pending_acknowledgment') {
    return NextResponse.json(
      { error: 'Avertismentul nu este in asteptare de confirmare (status: ' + warning.status + ')' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { witnessName } = body

  if (!witnessName) {
    return NextResponse.json(
      { error: 'Numele martorului este obligatoriu la refuzul semnarii' },
      { status: 400 }
    )
  }

  const now = new Date()

  const updated = await prisma.warning.update({
    where: { id },
    data: {
      status: 'refused',
      refusedToSign: true,
      refusedAt: now,
      refusedWitnessedBy: witnessName,
    },
    include: {
      employee: {
        select: { id: true, name: true, email: true, role: true },
      },
      issuedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  })

  return NextResponse.json(updated)
}

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

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      shiftType: true,
      isNew: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Angajat negasit' }, { status: 404 })
  }

  // Get warning count summary
  const [total, active, pending, acknowledged, refused, cleared] = await Promise.all([
    prisma.warning.count({ where: { employeeId: id } }),
    prisma.warning.count({ where: { employeeId: id, isCleared: false } }),
    prisma.warning.count({ where: { employeeId: id, status: 'pending_acknowledgment' } }),
    prisma.warning.count({ where: { employeeId: id, status: 'acknowledged' } }),
    prisma.warning.count({ where: { employeeId: id, status: 'refused' } }),
    prisma.warning.count({ where: { employeeId: id, isCleared: true } }),
  ])

  return NextResponse.json({
    ...user,
    warningsSummary: {
      total,
      active,
      pending,
      acknowledged,
      refused,
      cleared,
    },
  })
}

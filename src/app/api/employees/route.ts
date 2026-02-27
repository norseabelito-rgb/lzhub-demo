import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')
  const shift = searchParams.get('shift')

  const where: Record<string, unknown> = {}

  if (role === 'manager' || role === 'angajat') {
    where.role = role
  }

  if (shift === 'dimineata' || shift === 'seara') {
    where.shiftType = shift
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      shiftType: true,
      isNew: true,
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}

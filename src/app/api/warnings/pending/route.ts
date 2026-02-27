import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const warnings = await prisma.warning.findMany({
    where: {
      status: 'pending_acknowledgment',
      isCleared: false,
    },
    include: {
      employee: {
        select: { id: true, name: true, email: true, role: true },
      },
      issuedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(warnings)
}

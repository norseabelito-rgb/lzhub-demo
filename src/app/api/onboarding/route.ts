import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const incompleteOnly = searchParams.get('incomplete') === 'true'

  const records = await prisma.onboardingProgress.findMany({
    where: incompleteOnly ? { isComplete: false } : undefined,
    include: {
      employee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(records)
}

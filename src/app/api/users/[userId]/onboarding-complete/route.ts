import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { userId } = await params

  // Only the user themselves or a manager can mark onboarding complete
  if (session.user.id !== userId && session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isNew: false },
  })

  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { employeeId } = await params

  // Employees can only see their own, managers can see all
  if (session.user.role !== 'manager' && session.user.id !== employeeId) {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const progress = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
    include: {
      employee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  if (!progress) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  return NextResponse.json(progress)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { employeeId } = await params
  const body = await request.json()
  const { employeeName } = body

  if (!employeeName) {
    return NextResponse.json({ error: 'employeeName este obligatoriu' }, { status: 400 })
  }

  // Check if already exists
  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (existing) {
    return NextResponse.json({ error: 'Onboarding deja initializat pentru acest angajat' }, { status: 400 })
  }

  const now = new Date()
  const progress = await prisma.onboardingProgress.create({
    data: {
      employeeId,
      employeeName,
      currentStep: 'nda',
      startedAt: now,
      documents: [],
      quizAttempts: [],
      auditLog: [
        {
          id: crypto.randomUUID(),
          timestamp: now.toISOString(),
          step: 'nda',
          action: 'Onboarding initializat',
          performedBy: session.user.id,
        },
      ],
    },
    include: {
      employee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  return NextResponse.json(progress, { status: 201 })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { employeeId } = await params

  if (session.user.role !== 'manager' && session.user.id !== employeeId) {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const existing = await prisma.onboardingProgress.findUnique({
    where: { employeeId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Progres onboarding negasit' }, { status: 404 })
  }

  const body = await request.json()
  const { currentStep, managerId } = body

  const progress = await prisma.onboardingProgress.update({
    where: { employeeId },
    data: {
      ...(currentStep !== undefined && { currentStep }),
      ...(managerId !== undefined && { managerId }),
    },
    include: {
      employee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  })

  return NextResponse.json(progress)
}

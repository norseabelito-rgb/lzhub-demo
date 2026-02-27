import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { DISCIPLINE_LEVELS } from '@/lib/warnings/types'
import type { DisciplineLevel } from '@/lib/warnings/types'

/**
 * Get the highest discipline level from active warnings for an employee
 */
async function getCurrentLevel(employeeId: string): Promise<DisciplineLevel | null> {
  const warnings = await prisma.warning.findMany({
    where: { employeeId, isCleared: false },
    select: { level: true },
  })

  if (warnings.length === 0) return null

  let highestIndex = -1
  let highestLevel: DisciplineLevel | null = null

  for (const w of warnings) {
    const index = DISCIPLINE_LEVELS.indexOf(w.level as DisciplineLevel)
    if (index > highestIndex) {
      highestIndex = index
      highestLevel = w.level as DisciplineLevel
    }
  }

  return highestLevel
}

/**
 * Get the next escalation level for an employee
 */
function getNextLevel(currentLevel: DisciplineLevel | null): DisciplineLevel {
  if (!currentLevel) return 'verbal'
  const currentIndex = DISCIPLINE_LEVELS.indexOf(currentLevel)
  const nextIndex = Math.min(currentIndex + 1, DISCIPLINE_LEVELS.length - 1)
  return DISCIPLINE_LEVELS[nextIndex]
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')
  const level = searchParams.get('level')
  const active = searchParams.get('active')

  const where: Record<string, unknown> = {}

  if (employeeId) {
    where.employeeId = employeeId
  }

  if (status) {
    where.status = status
  }

  if (level) {
    where.level = level
  }

  if (active === 'true') {
    where.isCleared = false
  }

  const warnings = await prisma.warning.findMany({
    where,
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

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  // Manager only
  if (session.user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Doar managerii pot crea avertismente' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { employeeId, level, category, description, incidentDate, witness, managerSignature, attachments } = body

  // Validate required fields
  if (!employeeId || !level || !category || !description || !incidentDate || !managerSignature) {
    return NextResponse.json(
      { error: 'Campuri obligatorii lipsa: employeeId, level, category, description, incidentDate, managerSignature' },
      { status: 400 }
    )
  }

  // Validate employee exists
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: { id: true, name: true },
  })

  if (!employee) {
    return NextResponse.json({ error: 'Angajatul nu a fost gasit' }, { status: 404 })
  }

  // Validate discipline level
  if (!DISCIPLINE_LEVELS.includes(level)) {
    return NextResponse.json(
      { error: `Nivel de disciplina invalid. Valori valide: ${DISCIPLINE_LEVELS.join(', ')}` },
      { status: 400 }
    )
  }

  // Escalation check
  const currentLevel = await getCurrentLevel(employeeId)
  const suggestedLevel = getNextLevel(currentLevel)
  const requestedIndex = DISCIPLINE_LEVELS.indexOf(level)
  const suggestedIndex = DISCIPLINE_LEVELS.indexOf(suggestedLevel)
  const isSkipLevel = requestedIndex > suggestedIndex

  // Get manager info from session
  const manager = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true },
  })

  const warning = await prisma.warning.create({
    data: {
      employeeId,
      employeeName: employee.name,
      managerId: session.user.id,
      managerName: manager?.name ?? session.user.name ?? 'Manager',
      level,
      category,
      description,
      incidentDate: new Date(incidentDate),
      witness: witness || null,
      managerSignature,
      attachments: attachments || [],
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

  return NextResponse.json(
    {
      ...warning,
      escalation: {
        currentLevel,
        suggestedLevel,
        isSkipLevel,
        message: isSkipLevel
          ? `Avertismentul a fost creat cu nivel ${level}, dar nivelul sugerat era ${suggestedLevel}. Skip-level inregistrat.`
          : null,
      },
    },
    { status: 201 }
  )
}

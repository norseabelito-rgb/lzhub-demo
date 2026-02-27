import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import type { ChecklistStatus } from '@/generated/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (date) where.date = date
  if (userId) where.assignedToId = userId
  if (status) where.status = status as ChecklistStatus

  const instances = await prisma.checklistInstance.findMany({
    where,
    include: {
      completions: true,
      template: {
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(instances)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { templateId, assignedToId, date } = body

  if (!templateId || !assignedToId || !date) {
    return NextResponse.json(
      { error: 'templateId, assignedToId si date sunt obligatorii' },
      { status: 400 }
    )
  }

  const template = await prisma.checklistTemplate.findUnique({
    where: { id: templateId },
    include: { items: { orderBy: { order: 'asc' } } },
  })

  if (!template || !template.isActive) {
    return NextResponse.json({ error: 'Template negasit sau inactiv' }, { status: 404 })
  }

  const result = await prisma.$transaction(async (tx: any) => {
    const instance = await tx.checklistInstance.create({
      data: {
        templateId,
        templateName: template.name,
        date,
        assignedToId,
        status: 'pending',
      },
      include: {
        completions: true,
        template: {
          include: {
            items: {
              orderBy: { order: 'asc' },
            },
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || '',
        action: 'instance_created',
        entityType: 'instance',
        entityId: instance.id,
        details: {
          templateName: template.name,
          assignedToId,
          date,
        },
        wasWithinTimeWindow: true,
      },
    })

    return instance
  })

  return NextResponse.json(result, { status: 201 })
}

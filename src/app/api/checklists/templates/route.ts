import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const templates = await prisma.checklistTemplate.findMany({
    where: { isActive: true },
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(templates)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const {
    name,
    description,
    type,
    items,
    timeWindowStartHour,
    timeWindowStartMinute,
    timeWindowEndHour,
    timeWindowEndMinute,
    allowLateCompletion,
    lateWindowMinutes,
    assignedTo,
  } = body

  if (!name || !type || !items || items.length === 0) {
    return NextResponse.json(
      { error: 'Nume, tip si cel putin un item sunt obligatorii' },
      { status: 400 }
    )
  }

  const result = await prisma.$transaction(async (tx: any) => {
    const template = await tx.checklistTemplate.create({
      data: {
        name,
        description: description || '',
        type,
        timeWindowStartHour: timeWindowStartHour ?? 0,
        timeWindowStartMinute: timeWindowStartMinute ?? 0,
        timeWindowEndHour: timeWindowEndHour ?? 23,
        timeWindowEndMinute: timeWindowEndMinute ?? 59,
        allowLateCompletion: allowLateCompletion ?? false,
        lateWindowMinutes: lateWindowMinutes ?? null,
        assignedTo: typeof assignedTo === 'object' ? JSON.stringify(assignedTo) : (assignedTo || 'all'),
        createdBy: session.user.id,
        items: {
          create: items.map((item: { label: string; description?: string; isRequired?: boolean; order: number }) => ({
            label: item.label,
            description: item.description || null,
            isRequired: item.isRequired ?? true,
            order: item.order,
          })),
        },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    })

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || '',
        action: 'template_created',
        entityType: 'template',
        entityId: template.id,
        details: {
          templateName: template.name,
          itemCount: items.length,
          type: template.type,
        },
        wasWithinTimeWindow: true,
      },
    })

    return template
  })

  return NextResponse.json(result, { status: 201 })
}

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

  const template = await prisma.checklistTemplate.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!template) {
    return NextResponse.json({ error: 'Template negasit' }, { status: 404 })
  }

  return NextResponse.json(template)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.checklistTemplate.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Template negasit' }, { status: 404 })
  }

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

  const result = await prisma.$transaction(async (tx: any) => {
    // If items are provided, replace them all
    if (items) {
      await tx.checklistItem.deleteMany({ where: { templateId: id } })
      await tx.checklistItem.createMany({
        data: items.map((item: { label: string; description?: string; isRequired?: boolean; order: number }) => ({
          templateId: id,
          label: item.label,
          description: item.description || null,
          isRequired: item.isRequired ?? true,
          order: item.order,
        })),
      })
    }

    const template = await tx.checklistTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(timeWindowStartHour !== undefined && { timeWindowStartHour }),
        ...(timeWindowStartMinute !== undefined && { timeWindowStartMinute }),
        ...(timeWindowEndHour !== undefined && { timeWindowEndHour }),
        ...(timeWindowEndMinute !== undefined && { timeWindowEndMinute }),
        ...(allowLateCompletion !== undefined && { allowLateCompletion }),
        ...(lateWindowMinutes !== undefined && { lateWindowMinutes }),
        ...(assignedTo !== undefined && {
          assignedTo: typeof assignedTo === 'object' ? JSON.stringify(assignedTo) : assignedTo,
        }),
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
        action: 'template_updated',
        entityType: 'template',
        entityId: id,
        details: {
          templateName: template.name,
          updatedFields: Object.keys(body),
        },
        wasWithinTimeWindow: true,
      },
    })

    return template
  })

  return NextResponse.json(result)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.checklistTemplate.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Template negasit' }, { status: 404 })
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.checklistTemplate.update({
      where: { id },
      data: { isActive: false },
    })

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || '',
        action: 'template_deleted',
        entityType: 'template',
        entityId: id,
        details: {
          templateName: existing.name,
        },
        wasWithinTimeWindow: true,
      },
    })
  })

  return NextResponse.json({ success: true })
}

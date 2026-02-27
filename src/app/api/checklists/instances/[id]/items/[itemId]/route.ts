import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id: instanceId, itemId } = await params
  const body = await request.json()
  const { checked, notes } = body as { checked: boolean; notes?: string }

  if (typeof checked !== 'boolean') {
    return NextResponse.json({ error: 'Campul checked este obligatoriu' }, { status: 400 })
  }

  // Load instance with template for time window validation
  const instance = await prisma.checklistInstance.findUnique({
    where: { id: instanceId },
    include: {
      template: {
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      },
      completions: true,
    },
  })

  if (!instance) {
    return NextResponse.json({ error: 'Instanta negasita' }, { status: 404 })
  }

  // Verify item belongs to this template
  const item = instance.template.items.find((i: any) => i.id === itemId)
  if (!item) {
    return NextResponse.json({ error: 'Item negasit in template' }, { status: 404 })
  }

  if (checked) {
    // Check if already completed
    const alreadyCompleted = instance.completions.some((c: any) => c.itemId === itemId)
    if (alreadyCompleted) {
      return NextResponse.json({ error: 'Item deja completat' }, { status: 409 })
    }

    // Time window validation
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute
    const endTimeMinutes =
      instance.template.timeWindowEndHour * 60 + instance.template.timeWindowEndMinute

    let isLate = false

    if (currentTimeMinutes > endTimeMinutes) {
      isLate = true

      if (!instance.template.allowLateCompletion) {
        // Log blocked attempt
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            userName: session.user.name || '',
            action: 'item_checked',
            entityType: 'item',
            entityId: itemId,
            details: {
              instanceId,
              itemLabel: item.label,
              blocked: true,
              reason: 'Fereastra de completare s-a inchis',
            },
            wasWithinTimeWindow: false,
          },
        })

        return NextResponse.json(
          { error: 'Fereastra de completare s-a inchis' },
          { status: 403 }
        )
      }

      // Check late window limit
      if (instance.template.lateWindowMinutes) {
        const lateEndMinutes = endTimeMinutes + instance.template.lateWindowMinutes
        if (currentTimeMinutes > lateEndMinutes) {
          await prisma.auditLog.create({
            data: {
              userId: session.user.id,
              userName: session.user.name || '',
              action: 'item_checked',
              entityType: 'item',
              entityId: itemId,
              details: {
                instanceId,
                itemLabel: item.label,
                blocked: true,
                reason: 'Fereastra de gratie a expirat',
              },
              wasWithinTimeWindow: false,
            },
          })

          return NextResponse.json(
            { error: 'Fereastra de gratie a expirat' },
            { status: 403 }
          )
        }
      }
    }

    // Create completion in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const completion = await tx.checklistCompletion.create({
        data: {
          instanceId,
          itemId,
          checkedById: session.user.id,
          isLate,
          notes: notes || null,
        },
      })

      // Check if all required items are now complete
      const allCompletions = [...instance.completions, completion]
      const requiredItems = instance.template.items.filter((i: any) => i.isRequired)
      const allRequiredDone = requiredItems.every((ri: any) =>
        allCompletions.some((c: any) => c.itemId === ri.id)
      )

      const isFirstItem = instance.completions.length === 0
      const newStatus = allRequiredDone ? 'completed' : 'in_progress'

      const updatedInstance = await tx.checklistInstance.update({
        where: { id: instanceId },
        data: {
          status: newStatus,
          ...(isFirstItem && !instance.startedAt && { startedAt: new Date() }),
          ...(allRequiredDone && { completedAt: new Date() }),
        },
      })

      // Audit log for item check
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || '',
          action: 'item_checked',
          entityType: 'item',
          entityId: itemId,
          details: {
            instanceId,
            itemLabel: item.label,
            wasLate: isLate,
          },
          wasWithinTimeWindow: !isLate,
        },
      })

      // If instance just completed, log that too
      if (allRequiredDone) {
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            userName: session.user.name || '',
            action: 'instance_completed',
            entityType: 'instance',
            entityId: instanceId,
            details: {
              templateName: instance.templateName,
              completedItemsCount: allCompletions.length,
              totalItemsCount: instance.template.items.length,
            },
            wasWithinTimeWindow: !isLate,
          },
        })
      }

      return { completion, instance: updatedInstance, allRequiredDone }
    })

    return NextResponse.json({
      completion: result.completion,
      instanceStatus: result.instance.status,
      allRequiredDone: result.allRequiredDone,
      wasLate: isLate,
    })
  } else {
    // Uncheck: delete the completion
    const existingCompletion = instance.completions.find((c: any) => c.itemId === itemId)
    if (!existingCompletion) {
      return NextResponse.json({ error: 'Item nu este completat' }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      await tx.checklistCompletion.delete({
        where: { id: existingCompletion.id },
      })

      // Recalculate status
      const remainingCompletions = instance.completions.filter((c: any) => c.itemId !== itemId)
      const newStatus = remainingCompletions.length > 0 ? 'in_progress' : 'pending'

      const updatedInstance = await tx.checklistInstance.update({
        where: { id: instanceId },
        data: {
          status: newStatus,
          completedAt: null,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || '',
          action: 'item_unchecked',
          entityType: 'item',
          entityId: itemId,
          details: {
            instanceId,
            itemLabel: item.label,
          },
          wasWithinTimeWindow: true,
        },
      })

      return updatedInstance
    })

    return NextResponse.json({
      instanceStatus: result.status,
      unchecked: true,
    })
  }
}

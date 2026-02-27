import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import type { ChecklistStatus } from '@prisma/client'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params

  const instance = await prisma.checklistInstance.findUnique({
    where: { id },
    include: {
      completions: {
        include: {
          checkedBy: {
            select: { id: true, name: true },
          },
          item: true,
        },
      },
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

  if (!instance) {
    return NextResponse.json({ error: 'Instanta negasita' }, { status: 404 })
  }

  return NextResponse.json(instance)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status } = body as { status: ChecklistStatus }

  if (!status) {
    return NextResponse.json({ error: 'Status obligatoriu' }, { status: 400 })
  }

  const existing = await prisma.checklistInstance.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Instanta negasita' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = { status }
  if (status === 'in_progress' && !existing.startedAt) {
    updateData.startedAt = new Date()
  }
  if (status === 'completed') {
    updateData.completedAt = new Date()
  }

  const instance = await prisma.checklistInstance.update({
    where: { id },
    data: updateData,
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

  return NextResponse.json(instance)
}

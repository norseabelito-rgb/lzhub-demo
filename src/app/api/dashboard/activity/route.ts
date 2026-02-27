import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  // Get recent audit log entries
  const auditEntries = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true },
      },
    },
  })

  const activities = auditEntries.map((entry: any) => {
    // Map action to human-readable and type
    let action = 'a efectuat'
    let target = entry.entityType
    let type: string = 'checklist'

    const details = entry.details as Record<string, unknown> | null

    if (entry.action.includes('template_created')) {
      action = 'a creat'
      target = `Template: ${(details?.templateName as string) || entry.entityId}`
      type = 'checklist'
    } else if (entry.action.includes('template_updated')) {
      action = 'a actualizat'
      target = `Template: ${(details?.templateName as string) || entry.entityId}`
      type = 'checklist'
    } else if (entry.action.includes('checklist_completed')) {
      action = 'a completat'
      target = (details?.templateName as string) || 'Checklist'
      type = 'checklist'
    } else if (entry.action.includes('item_checked')) {
      action = 'a bifat'
      target = (details?.itemLabel as string) || 'Item checklist'
      type = 'checklist'
    } else if (entry.entityType === 'reservation') {
      action = entry.action.includes('create') ? 'a adaugat' : 'a actualizat'
      target = 'Rezervare'
      type = 'reservation'
    } else if (entry.entityType === 'onboarding') {
      action = 'a actualizat'
      target = 'Onboarding'
      type = 'onboarding'
    } else if (entry.entityType === 'warning') {
      action = 'a emis'
      target = 'Avertisment'
      type = 'warning'
    }

    return {
      id: entry.id,
      user: entry.userName,
      action,
      target,
      time: formatDistanceToNow(entry.createdAt, { addSuffix: true, locale: ro }),
      type,
    }
  })

  return NextResponse.json(activities)
}

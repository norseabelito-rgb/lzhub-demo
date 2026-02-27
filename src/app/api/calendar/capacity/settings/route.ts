import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  let settings = await prisma.capacitySettings.findUnique({
    where: { id: 'default' },
  })

  // Return defaults if no record exists yet
  if (!settings) {
    settings = {
      id: 'default',
      defaultCapacity: 40,
      warningThreshold: 0.8,
      criticalThreshold: 1.0,
    }
  }

  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  if (session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await request.json()
  const { defaultCapacity, warningThreshold, criticalThreshold } = body

  if (defaultCapacity !== undefined && (typeof defaultCapacity !== 'number' || defaultCapacity < 1)) {
    return NextResponse.json(
      { error: 'Capacitatea trebuie sa fie un numar pozitiv' },
      { status: 400 }
    )
  }

  if (warningThreshold !== undefined && (typeof warningThreshold !== 'number' || warningThreshold < 0 || warningThreshold > 1)) {
    return NextResponse.json(
      { error: 'Pragul de avertizare trebuie sa fie intre 0 si 1' },
      { status: 400 }
    )
  }

  if (criticalThreshold !== undefined && (typeof criticalThreshold !== 'number' || criticalThreshold < 0 || criticalThreshold > 1)) {
    return NextResponse.json(
      { error: 'Pragul critic trebuie sa fie intre 0 si 1' },
      { status: 400 }
    )
  }

  const settings = await prisma.capacitySettings.upsert({
    where: { id: 'default' },
    update: {
      ...(defaultCapacity !== undefined && { defaultCapacity }),
      ...(warningThreshold !== undefined && { warningThreshold }),
      ...(criticalThreshold !== undefined && { criticalThreshold }),
    },
    create: {
      id: 'default',
      defaultCapacity: defaultCapacity ?? 40,
      warningThreshold: warningThreshold ?? 0.8,
      criticalThreshold: criticalThreshold ?? 1.0,
    },
  })

  return NextResponse.json(settings)
}

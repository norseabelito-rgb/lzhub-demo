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

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      tags: {
        include: { tag: true },
      },
      reservations: {
        orderBy: { date: 'desc' },
        include: { customer: true },
      },
    },
  })

  if (!customer) {
    return NextResponse.json({ error: 'Client negasit' }, { status: 404 })
  }

  return NextResponse.json({
    ...customer,
    tags: customer.tags.map((ct: any) => ct.tag),
  })
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
  const { name, phone, email, notes } = body

  const existing = await prisma.customer.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Client negasit' }, { status: 404 })
  }

  if (name !== undefined && (name.length < 2 || name.length > 100)) {
    return NextResponse.json(
      { error: 'Numele trebuie sa aiba intre 2 si 100 caractere' },
      { status: 400 }
    )
  }

  if (phone !== undefined && !/^0[0-9]{9}$/.test(phone)) {
    return NextResponse.json(
      { error: 'Numar de telefon invalid (format: 07XX XXX XXX)' },
      { status: 400 }
    )
  }

  if (email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Email invalid' },
      { status: 400 }
    )
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email: email || null }),
      ...(notes !== undefined && { notes: notes || null }),
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  })

  return NextResponse.json({
    ...customer,
    tags: customer.tags.map((ct: any) => ct.tag),
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.customer.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Client negasit' }, { status: 404 })
  }

  // Cascade delete will remove tags and reservations
  await prisma.customer.delete({ where: { id } })

  return NextResponse.json({ success: true })
}

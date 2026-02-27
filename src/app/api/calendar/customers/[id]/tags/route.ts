import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { tagId } = body

  if (!tagId) {
    return NextResponse.json(
      { error: 'tagId este obligatoriu' },
      { status: 400 }
    )
  }

  const customer = await prisma.customer.findUnique({ where: { id } })
  if (!customer) {
    return NextResponse.json({ error: 'Client negasit' }, { status: 404 })
  }

  const tag = await prisma.tag.findUnique({ where: { id: tagId } })
  if (!tag) {
    return NextResponse.json({ error: 'Tag negasit' }, { status: 404 })
  }

  // Check if already assigned
  const existing = await prisma.customerTag.findUnique({
    where: { customerId_tagId: { customerId: id, tagId } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Tag-ul este deja asociat clientului' },
      { status: 400 }
    )
  }

  await prisma.customerTag.create({
    data: { customerId: id, tagId },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { tagId } = body

  if (!tagId) {
    return NextResponse.json(
      { error: 'tagId este obligatoriu' },
      { status: 400 }
    )
  }

  const existing = await prisma.customerTag.findUnique({
    where: { customerId_tagId: { customerId: id, tagId } },
  })
  if (!existing) {
    return NextResponse.json(
      { error: 'Asocierea nu exista' },
      { status: 404 }
    )
  }

  await prisma.customerTag.delete({
    where: { customerId_tagId: { customerId: id, tagId } },
  })

  return NextResponse.json({ success: true })
}

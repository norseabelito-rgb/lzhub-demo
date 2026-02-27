import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * Normalize string for searching (lowercase, remove diacritics, remove spaces)
 */
function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  const customers = await prisma.customer.findMany({
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Map to flatten the tag join table
  const mapped = customers.map((c: any) => ({
    ...c,
    tags: c.tags.map((ct: any) => ct.tag),
  }))

  if (!query) {
    return NextResponse.json(mapped)
  }

  // Normalized search matching the client-side logic
  const normalizedQuery = normalizeForSearch(query)
  const filtered = mapped.filter((customer: any) => {
    if (normalizeForSearch(customer.name).includes(normalizedQuery)) return true
    if (normalizeForSearch(customer.phone).includes(normalizedQuery)) return true
    if (customer.email && normalizeForSearch(customer.email).includes(normalizedQuery)) return true
    return false
  })

  return NextResponse.json(filtered)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const body = await request.json()
  const { name, phone, email, notes } = body

  if (!name || !phone) {
    return NextResponse.json(
      { error: 'Numele si telefonul sunt obligatorii' },
      { status: 400 }
    )
  }

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { error: 'Numele trebuie sa aiba intre 2 si 100 caractere' },
      { status: 400 }
    )
  }

  if (!/^0[0-9]{9}$/.test(phone)) {
    return NextResponse.json(
      { error: 'Numar de telefon invalid (format: 07XX XXX XXX)' },
      { status: 400 }
    )
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Email invalid' },
      { status: 400 }
    )
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      email: email || null,
      notes: notes || null,
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  })

  return NextResponse.json(
    { ...customer, tags: customer.tags.map((ct: any) => ct.tag) },
    { status: 201 }
  )
}

/**
 * Prisma seed script - populates database with all mock data
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { addDays, subDays, format, setHours, setMinutes } from 'date-fns'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ============================================================================
// Helpers
// ============================================================================

const now = new Date()
const TODAY = format(now, 'yyyy-MM-dd')

function getDate(daysFromNow: number): string {
  return format(addDays(now, daysFromNow), 'yyyy-MM-dd')
}

function getPastDate(daysAgo: number): string {
  return format(subDays(now, daysAgo), 'yyyy-MM-dd')
}

function futureDate(daysFromNow: number, hour: number, minute: number = 0): Date {
  return setMinutes(setHours(addDays(now, daysFromNow), hour), minute)
}

function pastDate(daysAgo: number, hour: number, minute: number = 0): Date {
  return setMinutes(setHours(subDays(now, daysAgo), hour), minute)
}

const SIGNATURE_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// ============================================================================
// Stable IDs
// ============================================================================

const USER_IDS = {
  alexandru: 'user-1',
  maria: 'user-2',
  ion: 'user-3',
  elena: 'user-4',
  andrei: 'user-5',
  cristina: 'user-6',
} as const

// ============================================================================
// Main seed function
// ============================================================================

async function main() {
  console.log('Seeding database...')

  // Clear all existing data in reverse dependency order
  console.log('Clearing existing data...')
  await prisma.checklistCompletion.deleteMany()
  await prisma.checklistInstance.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.checklistTemplate.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.customerTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.warning.deleteMany()
  await prisma.onboardingProgress.deleteMany()
  await prisma.socialPost.deleteMany()
  await prisma.socialTemplate.deleteMany()
  await prisma.hashtagSet.deleteMany()
  await prisma.contentLibraryItem.deleteMany()
  await prisma.capacitySettings.deleteMany()
  await prisma.user.deleteMany()

  // ==========================================================================
  // 1. USERS
  // ==========================================================================
  console.log('Creating users...')

  const hashedPasswords = {
    manager123: await bcrypt.hash('manager123', 10),
    maria123: await bcrypt.hash('maria123', 10),
    angajat123: await bcrypt.hash('angajat123', 10),
    elena123: await bcrypt.hash('elena123', 10),
    nou123: await bcrypt.hash('nou123', 10),
    cristina123: await bcrypt.hash('cristina123', 10),
  }

  await prisma.user.createMany({
    data: [
      {
        id: USER_IDS.alexandru,
        email: 'manager@laserzone.ro',
        password: hashedPasswords.manager123,
        name: 'Alexandru Popescu',
        role: 'manager',
        shiftType: null,
        isNew: false,
      },
      {
        id: USER_IDS.maria,
        email: 'maria@laserzone.ro',
        password: hashedPasswords.maria123,
        name: 'Maria Ionescu',
        role: 'manager',
        shiftType: null,
        isNew: false,
      },
      {
        id: USER_IDS.ion,
        email: 'angajat@laserzone.ro',
        password: hashedPasswords.angajat123,
        name: 'Ion Vasile',
        role: 'angajat',
        shiftType: 'dimineata',
        isNew: false,
      },
      {
        id: USER_IDS.elena,
        email: 'elena@laserzone.ro',
        password: hashedPasswords.elena123,
        name: 'Elena Dumitrescu',
        role: 'angajat',
        shiftType: 'seara',
        isNew: false,
      },
      {
        id: USER_IDS.andrei,
        email: 'nou@laserzone.ro',
        password: hashedPasswords.nou123,
        name: 'Andrei Marin',
        role: 'angajat',
        shiftType: 'dimineata',
        isNew: true,
        startDate: now,
      },
      {
        id: USER_IDS.cristina,
        email: 'cristina@laserzone.ro',
        password: hashedPasswords.cristina123,
        name: 'Cristina Pavel',
        role: 'angajat',
        shiftType: 'dimineata',
        isNew: true,
        startDate: subDays(now, 7),
      },
    ],
  })
  console.log('  Created 6 users')

  // ==========================================================================
  // 2. TAGS
  // ==========================================================================
  console.log('Creating tags...')

  await prisma.tag.createMany({
    data: [
      { id: 'tag-vip', name: 'VIP', color: '#f535aa' },
      { id: 'tag-birthday', name: 'Birthday Regular', color: '#22d3ee' },
      { id: 'tag-corporate', name: 'Corporate', color: '#a855f7' },
      { id: 'tag-frequent', name: 'Frequent', color: '#22c55e' },
      { id: 'tag-first-timer', name: 'First Timer', color: '#f59e0b' },
      { id: 'tag-problem', name: 'Problem', color: '#ef4444' },
    ],
  })
  console.log('  Created 6 tags')

  // ==========================================================================
  // 3. CUSTOMERS
  // ==========================================================================
  console.log('Creating customers...')

  const customersData = [
    { id: 'cust-001', name: 'Ionescu Alexandru', phone: '0722 123 456', email: 'alex.ionescu@email.ro', notes: 'Prefera sesiunile de dupa-amiaza. Aduce mereu echipa de la firma.', createdAt: subDays(now, 180), tagIds: ['tag-vip', 'tag-frequent'] },
    { id: 'cust-002', name: 'Popescu Maria', phone: '0733 234 567', email: 'maria.popescu@gmail.com', notes: 'Organizeaza petreceri pentru copii in fiecare an.', createdAt: subDays(now, 365), tagIds: ['tag-birthday'] },
    { id: 'cust-003', name: 'Dumitrescu Andrei', phone: '0744 345 678', email: null, notes: 'Contact HR la TechCorp SRL. Team building trimestrial.', createdAt: subDays(now, 120), tagIds: ['tag-corporate'] },
    { id: 'cust-004', name: 'Gheorghiu Elena', phone: '0755 456 789', email: 'elena.g@yahoo.com', notes: null, createdAt: subDays(now, 90), tagIds: ['tag-frequent'] },
    { id: 'cust-005', name: 'Stanescu Mihai', phone: '0766 567 890', email: null, notes: 'Director General la InnovateSoft. Buget mare pentru evenimente.', createdAt: subDays(now, 200), tagIds: ['tag-vip', 'tag-corporate'] },
    { id: 'cust-006', name: 'Radu Cristina', phone: '0777 678 901', email: 'cristina.radu@firma.ro', notes: 'Fiul are petrecerea anual aici. Vine si cu prietenii.', createdAt: subDays(now, 400), tagIds: ['tag-birthday', 'tag-frequent'] },
    { id: 'cust-007', name: 'Marin Bogdan', phone: '0788 789 012', email: null, notes: null, createdAt: subDays(now, 2), tagIds: ['tag-first-timer'] },
    { id: 'cust-008', name: 'Vasilescu Ana', phone: '0799 890 123', email: 'ana.v@outlook.com', notes: 'Prefera weekend-urile dimineata.', createdAt: subDays(now, 150), tagIds: ['tag-frequent'] },
    { id: 'cust-009', name: 'Florescu Dan', phone: '0722 901 234', email: null, notes: 'Atentie: A avut comportament neadecvat ultima data. Supraveghere.', createdAt: subDays(now, 60), tagIds: ['tag-problem'] },
    { id: 'cust-010', name: 'Constantinescu Ioana', phone: '0733 012 345', email: 'ioana.c@gmail.com', notes: 'Departament HR la BankCorp. Evenimente lunare.', createdAt: subDays(now, 80), tagIds: ['tag-corporate'] },
    { id: 'cust-011', name: 'Popa Stefan', phone: '0744 123 567', email: null, notes: null, createdAt: subDays(now, 14), tagIds: [] },
    { id: 'cust-012', name: 'Dobre Laura', phone: '0755 234 678', email: 'laura.dobre@email.ro', notes: 'Influencer local. Posteaza mereu pe social media.', createdAt: subDays(now, 45), tagIds: ['tag-vip'] },
  ]

  for (const c of customersData) {
    await prisma.customer.create({
      data: {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        createdAt: c.createdAt,
        tags: {
          create: c.tagIds.map((tagId) => ({ tagId })),
        },
      },
    })
  }
  console.log('  Created 12 customers with tags')

  // ==========================================================================
  // 4. RESERVATIONS
  // ==========================================================================
  console.log('Creating reservations...')

  await prisma.reservation.createMany({
    data: [
      // TODAY
      { id: 'res-001', customerId: 'cust-001', date: getDate(0), startTime: '10:00', endTime: '11:00', partySize: 8, occasion: 'corporate', notes: 'Team building TechCorp', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 3) },
      { id: 'res-002', customerId: 'cust-004', date: getDate(0), startTime: '14:00', endTime: '15:00', partySize: 6, occasion: 'regular', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 7) },
      { id: 'res-003', customerId: 'cust-006', date: getDate(0), startTime: '16:00', endTime: '18:00', partySize: 15, occasion: 'birthday', notes: 'Petrecere Andrei 10 ani - catering comandat', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 14) },
      // TOMORROW
      { id: 'res-004', customerId: 'cust-002', date: getDate(1), startTime: '11:00', endTime: '12:00', partySize: 10, occasion: 'birthday', notes: 'Petrecere copii', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 10) },
      { id: 'res-005', customerId: 'cust-003', date: getDate(1), startTime: '14:00', endTime: '16:00', partySize: 20, occasion: 'corporate', notes: 'TechCorp trimestrial - rezervare sala mare', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 21) },
      { id: 'res-006', customerId: 'cust-008', date: getDate(1), startTime: '14:30', endTime: '15:30', partySize: 12, occasion: 'group', notes: 'Grup de prieteni', status: 'confirmed', hasConflict: true, conflictOverridden: true, createdBy: USER_IDS.ion, createdAt: subDays(now, 2) },
      // DAY AFTER TOMORROW
      { id: 'res-007', customerId: 'cust-005', date: getDate(2), startTime: '09:00', endTime: '11:00', partySize: 25, occasion: 'corporate', notes: 'InnovateSoft aniversare firma - eveniment VIP', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 30) },
      { id: 'res-008', customerId: 'cust-007', date: getDate(2), startTime: '15:00', endTime: '16:00', partySize: 4, occasion: 'regular', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 1) },
      // 3 DAYS FROM NOW
      { id: 'res-009', customerId: 'cust-010', date: getDate(3), startTime: '10:00', endTime: '12:00', partySize: 18, occasion: 'corporate', notes: 'BankCorp team building', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 15) },
      { id: 'res-010', customerId: 'cust-011', date: getDate(3), startTime: '14:00', endTime: '15:00', partySize: 5, occasion: 'regular', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 5) },
      { id: 'res-011', customerId: 'cust-012', date: getDate(3), startTime: '14:00', endTime: '15:00', partySize: 15, occasion: 'group', notes: 'Sesiune foto cu influenceri', status: 'confirmed', hasConflict: true, conflictOverridden: true, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 3) },
      { id: 'res-012', customerId: 'cust-004', date: getDate(3), startTime: '14:00', endTime: '15:00', partySize: 10, occasion: 'regular', status: 'confirmed', hasConflict: true, conflictOverridden: true, createdBy: USER_IDS.ion, createdAt: subDays(now, 2) },
      // 4-5 DAYS FROM NOW
      { id: 'res-013', customerId: 'cust-001', date: getDate(4), startTime: '10:00', endTime: '12:00', partySize: 12, occasion: 'corporate', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 7) },
      { id: 'res-014', customerId: 'cust-002', date: getDate(4), startTime: '14:00', endTime: '16:00', partySize: 20, occasion: 'birthday', notes: 'Petrecere Ana 8 ani - tort inclus', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 20) },
      { id: 'res-015', customerId: 'cust-006', date: getDate(5), startTime: '11:00', endTime: '13:00', partySize: 14, occasion: 'birthday', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 8) },
      { id: 'res-016', customerId: 'cust-003', date: getDate(5), startTime: '15:00', endTime: '16:00', partySize: 20, occasion: 'corporate', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 12) },
      { id: 'res-017', customerId: 'cust-005', date: getDate(5), startTime: '15:00', endTime: '16:00', partySize: 18, occasion: 'corporate', notes: 'InnovateSoft departament IT', status: 'confirmed', hasConflict: true, conflictOverridden: true, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 6) },
      // NEXT WEEK
      { id: 'res-018', customerId: 'cust-008', date: getDate(7), startTime: '10:00', endTime: '11:00', partySize: 6, occasion: 'regular', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 4) },
      { id: 'res-019', customerId: 'cust-010', date: getDate(8), startTime: '14:00', endTime: '16:00', partySize: 22, occasion: 'corporate', notes: 'BankCorp luna aceasta', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 10) },
      { id: 'res-020', customerId: 'cust-012', date: getDate(9), startTime: '16:00', endTime: '17:00', partySize: 8, occasion: 'other', notes: 'Sesiune foto pentru brand', status: 'confirmed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 14) },
      // PAST RESERVATIONS
      { id: 'res-021', customerId: 'cust-001', date: getPastDate(7), startTime: '14:00', endTime: '15:00', partySize: 10, occasion: 'corporate', status: 'completed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 20) },
      { id: 'res-022', customerId: 'cust-002', date: getPastDate(14), startTime: '11:00', endTime: '13:00', partySize: 12, occasion: 'birthday', notes: 'Petrecere finalizata cu succes', status: 'completed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 30) },
      { id: 'res-023', customerId: 'cust-009', date: getPastDate(21), startTime: '15:00', endTime: '16:00', partySize: 6, occasion: 'regular', notes: 'Comportament neadecvat - avertizat', status: 'completed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 35) },
      { id: 'res-024', customerId: 'cust-011', date: getPastDate(3), startTime: '10:00', endTime: '11:00', partySize: 4, occasion: 'regular', notes: 'Anulat de client - urgenta', status: 'cancelled', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 10) },
      { id: 'res-025', customerId: 'cust-007', date: getPastDate(5), startTime: '14:00', endTime: '15:00', partySize: 5, occasion: 'regular', status: 'no_show', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.ion, createdAt: subDays(now, 12) },
      { id: 'res-026', customerId: 'cust-003', date: getPastDate(30), startTime: '10:00', endTime: '12:00', partySize: 18, occasion: 'corporate', status: 'completed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 45) },
      { id: 'res-027', customerId: 'cust-005', date: getPastDate(45), startTime: '14:00', endTime: '16:00', partySize: 25, occasion: 'corporate', notes: 'Eveniment de lansare produs', status: 'completed', hasConflict: false, conflictOverridden: false, createdBy: USER_IDS.alexandru, createdAt: subDays(now, 60) },
    ],
  })
  console.log('  Created 27 reservations')

  // ==========================================================================
  // 5. CAPACITY SETTINGS
  // ==========================================================================
  console.log('Creating capacity settings...')

  await prisma.capacitySettings.create({
    data: {
      id: 'default',
      defaultCapacity: 40,
      warningThreshold: 0.8,
      criticalThreshold: 1.0,
    },
  })
  console.log('  Created capacity settings')

  // ==========================================================================
  // 6. CHECKLIST TEMPLATES + ITEMS
  // ==========================================================================
  console.log('Creating checklist templates...')

  // Opening template
  await prisma.checklistTemplate.create({
    data: {
      id: 'template-deschidere',
      name: 'Checklist Deschidere',
      description: 'Verificari obligatorii la deschiderea locatiei in fiecare zi',
      type: 'deschidere',
      timeWindowStartHour: 9,
      timeWindowStartMinute: 0,
      timeWindowEndHour: 11,
      timeWindowEndMinute: 0,
      allowLateCompletion: true,
      lateWindowMinutes: 30,
      assignedTo: 'shift',
      createdBy: USER_IDS.alexandru,
      createdAt: new Date('2026-01-15T10:00:00Z'),
      items: {
        create: [
          { id: 'open-1', label: 'Verifica functionarea sistemului de iluminat', isRequired: true, order: 1 },
          { id: 'open-2', label: 'Porneste sistemele audio', isRequired: true, order: 2 },
          { id: 'open-3', label: 'Verifica echipamentele laser (baterii, veste)', isRequired: true, order: 3 },
          { id: 'open-4', label: 'Curata zonele de joc', isRequired: true, order: 4 },
          { id: 'open-5', label: 'Verifica stocul de consumabile', isRequired: false, order: 5 },
          { id: 'open-6', label: 'Pregateste casa de marcat', isRequired: true, order: 6 },
          { id: 'open-7', label: 'Verifica conexiunea internet', isRequired: true, order: 7 },
          { id: 'open-8', label: 'Actualizeaza tabla de rezervari', isRequired: false, order: 8 },
        ],
      },
    },
  })

  // Closing template
  await prisma.checklistTemplate.create({
    data: {
      id: 'template-inchidere',
      name: 'Checklist Inchidere',
      description: 'Proceduri de inchidere pentru securizarea locatiei',
      type: 'inchidere',
      timeWindowStartHour: 21,
      timeWindowStartMinute: 0,
      timeWindowEndHour: 23,
      timeWindowEndMinute: 0,
      allowLateCompletion: false,
      assignedTo: 'shift',
      createdBy: USER_IDS.alexandru,
      createdAt: new Date('2026-01-15T10:30:00Z'),
      items: {
        create: [
          { id: 'close-1', label: 'Opreste sistemele audio', isRequired: true, order: 1 },
          { id: 'close-2', label: 'Incarca echipamentele laser', isRequired: true, order: 2 },
          { id: 'close-3', label: 'Verifica si inchide usile', isRequired: true, order: 3 },
          { id: 'close-4', label: 'Opreste iluminatul din zonele de joc', isRequired: true, order: 4 },
          { id: 'close-5', label: 'Inchide casa de marcat si verifica raportul', isRequired: true, order: 5 },
          { id: 'close-6', label: 'Activeaza sistemul de alarma', isRequired: true, order: 6 },
        ],
      },
    },
  })
  console.log('  Created 2 templates with 14 items')

  // ==========================================================================
  // 7. CHECKLIST INSTANCES + COMPLETIONS
  // ==========================================================================
  console.log('Creating checklist instances...')

  // Instance 1: Opening checklist for Ion Vasile - COMPLETED
  await prisma.checklistInstance.create({
    data: {
      id: 'instance-1',
      templateId: 'template-deschidere',
      templateName: 'Checklist Deschidere',
      date: TODAY,
      assignedToId: USER_IDS.ion,
      status: 'completed',
      startedAt: new Date(`${TODAY}T09:15:00Z`),
      completedAt: new Date(`${TODAY}T09:50:00Z`),
      completions: {
        create: [
          { id: 'comp-1-1', itemId: 'open-1', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:15:00Z`), isLate: false },
          { id: 'comp-1-2', itemId: 'open-2', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:20:00Z`), isLate: false },
          { id: 'comp-1-3', itemId: 'open-3', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:25:00Z`), isLate: false },
          { id: 'comp-1-4', itemId: 'open-4', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:30:00Z`), isLate: false },
          { id: 'comp-1-5', itemId: 'open-5', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:35:00Z`), isLate: false },
          { id: 'comp-1-6', itemId: 'open-6', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:40:00Z`), isLate: false },
          { id: 'comp-1-7', itemId: 'open-7', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:45:00Z`), isLate: false },
          { id: 'comp-1-8', itemId: 'open-8', checkedById: USER_IDS.ion, checkedAt: new Date(`${TODAY}T09:50:00Z`), isLate: false },
        ],
      },
    },
  })

  // Instance 2: Closing checklist for Elena - PENDING
  await prisma.checklistInstance.create({
    data: {
      id: 'instance-2',
      templateId: 'template-inchidere',
      templateName: 'Checklist Inchidere',
      date: TODAY,
      assignedToId: USER_IDS.elena,
      status: 'pending',
    },
  })

  // Instance 3: Opening checklist for Andrei - IN PROGRESS (3 items done, late)
  await prisma.checklistInstance.create({
    data: {
      id: 'instance-3',
      templateId: 'template-deschidere',
      templateName: 'Checklist Deschidere',
      date: TODAY,
      assignedToId: USER_IDS.andrei,
      status: 'in_progress',
      startedAt: new Date(`${TODAY}T10:30:00Z`),
      completions: {
        create: [
          { id: 'comp-3-1', itemId: 'open-1', checkedById: USER_IDS.andrei, checkedAt: new Date(`${TODAY}T10:30:00Z`), isLate: true },
          { id: 'comp-3-2', itemId: 'open-2', checkedById: USER_IDS.andrei, checkedAt: new Date(`${TODAY}T10:35:00Z`), isLate: true },
          { id: 'comp-3-3', itemId: 'open-3', checkedById: USER_IDS.andrei, checkedAt: new Date(`${TODAY}T10:40:00Z`), isLate: true },
        ],
      },
    },
  })
  console.log('  Created 3 instances with 11 completions')

  // ==========================================================================
  // 8. AUDIT LOG
  // ==========================================================================
  console.log('Creating audit log entries...')

  await prisma.auditLog.createMany({
    data: [
      {
        id: 'audit-1',
        userId: USER_IDS.alexandru,
        userName: 'Alexandru Popescu',
        action: 'template_created',
        entityType: 'template',
        entityId: 'template-deschidere',
        details: { templateName: 'Checklist Deschidere', itemCount: 8 },
        wasWithinTimeWindow: true,
        createdAt: new Date('2026-01-15T10:00:00Z'),
      },
      {
        id: 'audit-2',
        userId: USER_IDS.alexandru,
        userName: 'Alexandru Popescu',
        action: 'template_created',
        entityType: 'template',
        entityId: 'template-inchidere',
        details: { templateName: 'Checklist Inchidere', itemCount: 6 },
        wasWithinTimeWindow: true,
        createdAt: new Date('2026-01-15T10:30:00Z'),
      },
      {
        id: 'audit-3',
        userId: USER_IDS.alexandru,
        userName: 'Alexandru Popescu',
        action: 'instance_created',
        entityType: 'instance',
        entityId: 'instance-1',
        details: { templateName: 'Checklist Deschidere', assignedTo: 'Ion Vasile', date: TODAY },
        wasWithinTimeWindow: true,
        createdAt: new Date(`${TODAY}T08:00:00Z`),
      },
      {
        id: 'audit-4',
        userId: USER_IDS.ion,
        userName: 'Ion Vasile',
        action: 'item_checked',
        entityType: 'item',
        entityId: 'open-1',
        details: { instanceId: 'instance-1', itemText: 'Verifica functionarea sistemului de iluminat' },
        wasWithinTimeWindow: true,
        createdAt: new Date(`${TODAY}T09:15:00Z`),
      },
      {
        id: 'audit-5',
        userId: USER_IDS.ion,
        userName: 'Ion Vasile',
        action: 'item_checked',
        entityType: 'item',
        entityId: 'open-2',
        details: { instanceId: 'instance-1', itemText: 'Porneste sistemele audio' },
        wasWithinTimeWindow: true,
        createdAt: new Date(`${TODAY}T09:20:00Z`),
      },
      {
        id: 'audit-6',
        userId: USER_IDS.ion,
        userName: 'Ion Vasile',
        action: 'instance_completed',
        entityType: 'instance',
        entityId: 'instance-1',
        details: { templateName: 'Checklist Deschidere', completedItemsCount: 8, totalItemsCount: 8 },
        wasWithinTimeWindow: true,
        createdAt: new Date(`${TODAY}T09:50:00Z`),
      },
      {
        id: 'audit-7',
        userId: USER_IDS.andrei,
        userName: 'Andrei Marin',
        action: 'item_checked',
        entityType: 'item',
        entityId: 'open-1',
        details: { instanceId: 'instance-3', itemText: 'Verifica functionarea sistemului de iluminat', note: 'Completare tarzie - in fereastra de gratie' },
        wasWithinTimeWindow: false,
        createdAt: new Date(`${TODAY}T10:30:00Z`),
      },
      {
        id: 'audit-8',
        userId: USER_IDS.alexandru,
        userName: 'Alexandru Popescu',
        action: 'instance_created',
        entityType: 'instance',
        entityId: 'instance-2',
        details: { templateName: 'Checklist Inchidere', assignedTo: 'Elena Dumitrescu', date: TODAY },
        wasWithinTimeWindow: true,
        createdAt: new Date(`${TODAY}T08:00:00Z`),
      },
    ],
  })
  console.log('  Created 8 audit log entries')

  // ==========================================================================
  // 9. WARNINGS
  // ==========================================================================
  console.log('Creating warnings...')

  function managerSig(managerId: string, managerName: string, signedAt: Date) {
    return {
      dataUrl: SIGNATURE_PLACEHOLDER,
      signedAt: signedAt.toISOString(),
      signedBy: managerId,
      signerName: managerName,
      signerRole: 'manager',
    }
  }

  function employeeSig(employeeId: string, employeeName: string, acknowledgedAt: Date) {
    return {
      dataUrl: SIGNATURE_PLACEHOLDER,
      signedAt: acknowledgedAt.toISOString(),
      signedBy: employeeId,
      signerName: employeeName,
      signerRole: 'angajat',
    }
  }

  await prisma.warning.createMany({
    data: [
      // 1. Ion Vasile - Verbal tardiness - Acknowledged
      {
        id: 'warn-001',
        employeeId: USER_IDS.ion,
        employeeName: 'Ion Vasile',
        managerId: USER_IDS.alexandru,
        managerName: 'Alexandru Popescu',
        level: 'verbal',
        category: 'tardiness',
        description: 'Angajatul Ion Vasile a intarziat 45 de minute la tura de dimineata din data de referinta. Nu a anuntat intarzierea si nu a oferit o justificare acceptabila. Aceasta este prima incalcare de acest tip.',
        incidentDate: subDays(now, 75),
        managerSignature: managerSig(USER_IDS.alexandru, 'Alexandru Popescu', subDays(now, 74)),
        employeeSignature: employeeSig(USER_IDS.ion, 'Ion Vasile', subDays(now, 74)),
        acknowledgmentComment: 'Am inteles si voi respecta programul in viitor.',
        acknowledgedAt: subDays(now, 74),
        status: 'acknowledged',
        isCleared: false,
        createdAt: subDays(now, 74),
      },
      // 2. Ion Vasile - Written tardiness (escalated) - Acknowledged
      {
        id: 'warn-002',
        employeeId: USER_IDS.ion,
        employeeName: 'Ion Vasile',
        managerId: USER_IDS.alexandru,
        managerName: 'Alexandru Popescu',
        level: 'written',
        category: 'tardiness',
        description: 'Dupa avertismentul verbal din luna anterioara, angajatul Ion Vasile a intarziat din nou la serviciu, de data aceasta cu 30 de minute. Aceasta este a doua incalcare in decurs de 30 de zile, ceea ce justifica escaladarea la avertisment scris.',
        incidentDate: subDays(now, 45),
        witness: 'Elena Dumitrescu',
        managerSignature: managerSig(USER_IDS.alexandru, 'Alexandru Popescu', subDays(now, 44)),
        employeeSignature: employeeSig(USER_IDS.ion, 'Ion Vasile', subDays(now, 44)),
        acknowledgmentComment: 'Accept avertismentul si ma angajez sa nu mai repet aceasta greseala.',
        acknowledgedAt: subDays(now, 44),
        status: 'acknowledged',
        isCleared: false,
        createdAt: subDays(now, 44),
      },
      // 3. Elena Dumitrescu - Verbal uniform - Pending
      {
        id: 'warn-003',
        employeeId: USER_IDS.elena,
        employeeName: 'Elena Dumitrescu',
        managerId: USER_IDS.maria,
        managerName: 'Maria Ionescu',
        level: 'verbal',
        category: 'uniform_appearance',
        description: 'Angajata Elena Dumitrescu s-a prezentat la serviciu fara uniforma completa. Lipsea tricoul cu logo-ul companiei, fiind inlocuit cu un tricou personal. Clientii au observat acest lucru si am primit o observatie.',
        incidentDate: subDays(now, 3),
        managerSignature: managerSig(USER_IDS.maria, 'Maria Ionescu', subDays(now, 2)),
        status: 'pending_acknowledgment',
        isCleared: false,
        createdAt: subDays(now, 2),
      },
      // 4. Andrei Marin - Verbal customer complaint - Refused
      {
        id: 'warn-004',
        employeeId: USER_IDS.andrei,
        employeeName: 'Andrei Marin',
        managerId: USER_IDS.alexandru,
        managerName: 'Alexandru Popescu',
        level: 'verbal',
        category: 'customer_complaint',
        description: 'Am primit o plangere de la un client in legatura cu atitudinea angajatului Andrei Marin. Clientul a raportat ca angajatul a fost nepoliticos si a refuzat sa raspunda la intrebari despre promotiile curente.',
        incidentDate: subDays(now, 20),
        witness: 'Ion Vasile',
        managerSignature: managerSig(USER_IDS.alexandru, 'Alexandru Popescu', subDays(now, 19)),
        refusedToSign: true,
        refusedAt: subDays(now, 19),
        refusedWitnessedBy: 'Maria Ionescu',
        status: 'refused',
        isCleared: false,
        createdAt: subDays(now, 19),
      },
      // 5. Andrei Marin - Verbal no_show - Cleared
      {
        id: 'warn-005',
        employeeId: USER_IDS.andrei,
        employeeName: 'Andrei Marin',
        managerId: USER_IDS.maria,
        managerName: 'Maria Ionescu',
        level: 'verbal',
        category: 'no_show',
        description: 'Angajatul Andrei Marin nu s-a prezentat la tura programata din data de referinta. Nu a anuntat absenta si nu a raspuns la telefon. Absenta a cauzat probleme in organizarea activitatii.',
        incidentDate: subDays(now, 90),
        managerSignature: managerSig(USER_IDS.maria, 'Maria Ionescu', subDays(now, 89)),
        employeeSignature: employeeSig(USER_IDS.andrei, 'Andrei Marin', subDays(now, 88)),
        acknowledgedAt: subDays(now, 88),
        status: 'cleared',
        isCleared: true,
        clearedAt: subDays(now, 30),
        clearedById: USER_IDS.maria,
        clearedReason: 'Comportament exemplar timp de 60 de zile consecutiv.',
        createdAt: subDays(now, 89),
      },
      // 6. Elena Dumitrescu - Final cash_handling - Acknowledged
      {
        id: 'warn-006',
        employeeId: USER_IDS.elena,
        employeeName: 'Elena Dumitrescu',
        managerId: USER_IDS.alexandru,
        managerName: 'Alexandru Popescu',
        level: 'final',
        category: 'cash_handling',
        description: 'La inventarul zilnic s-a constatat o diferenta de 150 RON la casa. Dupa investigatie, s-a descoperit ca angajata Elena Dumitrescu nu a inregistrat corect mai multe tranzactii. Desi nu exista dovezi de intentie frauduloasa, neglijenta este grava si justifica avertisment final.',
        incidentDate: subDays(now, 60),
        witness: 'Alexandru Popescu',
        managerSignature: managerSig(USER_IDS.alexandru, 'Alexandru Popescu', subDays(now, 59)),
        employeeSignature: employeeSig(USER_IDS.elena, 'Elena Dumitrescu', subDays(now, 58)),
        acknowledgmentComment: 'Accept responsabilitatea si voi fi mai atenta la inregistrarea tranzactiilor.',
        acknowledgedAt: subDays(now, 58),
        status: 'acknowledged',
        isCleared: false,
        createdAt: subDays(now, 59),
      },
      // 7. Ion Vasile - Verbal safety - Acknowledged
      {
        id: 'warn-007',
        employeeId: USER_IDS.ion,
        employeeName: 'Ion Vasile',
        managerId: USER_IDS.maria,
        managerName: 'Maria Ionescu',
        level: 'verbal',
        category: 'safety_violation',
        description: 'Angajatul Ion Vasile a fost observat facand curatenie in zona de joc fara a purta echipamentul de protectie (ochelari). Aceasta este o incalcare a normelor de securitate in munca.',
        incidentDate: subDays(now, 15),
        managerSignature: managerSig(USER_IDS.maria, 'Maria Ionescu', subDays(now, 14)),
        employeeSignature: employeeSig(USER_IDS.ion, 'Ion Vasile', subDays(now, 14)),
        acknowledgedAt: subDays(now, 14),
        status: 'acknowledged',
        isCleared: false,
        createdAt: subDays(now, 14),
      },
      // 8. Andrei Marin - Written performance - Pending
      {
        id: 'warn-008',
        employeeId: USER_IDS.andrei,
        employeeName: 'Andrei Marin',
        managerId: USER_IDS.alexandru,
        managerName: 'Alexandru Popescu',
        level: 'written',
        category: 'performance',
        description: 'Evaluarea lunara a performantei a aratat ca angajatul Andrei Marin nu a atins obiectivele stabilite pentru vanzarea pachetelor de petreceri. Desi a primit coaching suplimentar, rezultatele nu s-au imbunatatit semnificativ in ultimele 4 saptamani.',
        incidentDate: subDays(now, 5),
        managerSignature: managerSig(USER_IDS.alexandru, 'Alexandru Popescu', subDays(now, 4)),
        status: 'pending_acknowledgment',
        isCleared: false,
        createdAt: subDays(now, 4),
      },
      // 9. Elena Dumitrescu - Verbal policy - Acknowledged (older)
      {
        id: 'warn-009',
        employeeId: USER_IDS.elena,
        employeeName: 'Elena Dumitrescu',
        managerId: USER_IDS.maria,
        managerName: 'Maria Ionescu',
        level: 'verbal',
        category: 'policy_violation',
        description: 'Angajata Elena Dumitrescu a fost surprinsa folosind telefonul personal in timpul programului de lucru, in zona vizibila de clienti. Conform regulamentului, telefoanele trebuie pastrate in dulap.',
        incidentDate: subDays(now, 85),
        managerSignature: managerSig(USER_IDS.maria, 'Maria Ionescu', subDays(now, 84)),
        employeeSignature: employeeSig(USER_IDS.elena, 'Elena Dumitrescu', subDays(now, 84)),
        acknowledgedAt: subDays(now, 84),
        status: 'acknowledged',
        isCleared: false,
        createdAt: subDays(now, 84),
      },
      // 10. Ion Vasile - Verbal insubordination - Pending
      {
        id: 'warn-010',
        employeeId: USER_IDS.ion,
        employeeName: 'Ion Vasile',
        managerId: USER_IDS.alexandru,
        managerName: 'Alexandru Popescu',
        level: 'verbal',
        category: 'insubordination',
        description: 'Angajatul Ion Vasile a contestat public o decizie a managerului in fata colegilor, creand o situatie tensionata. Desi are dreptul sa exprime nemultumiri, acest lucru trebuie facut in privat, nu in fata echipei.',
        incidentDate: subDays(now, 1),
        managerSignature: managerSig(USER_IDS.alexandru, 'Alexandru Popescu', now),
        status: 'pending_acknowledgment',
        isCleared: false,
        createdAt: now,
      },
    ],
  })
  console.log('  Created 10 warnings')

  // ==========================================================================
  // 10. ONBOARDING PROGRESS
  // ==========================================================================
  console.log('Creating onboarding progress records...')

  // Andrei Marin - at 'video' step
  await prisma.onboardingProgress.create({
    data: {
      id: 'onboard-1',
      employeeId: USER_IDS.andrei,
      employeeName: 'Andrei Marin',
      currentStep: 'video',
      startedAt: subDays(now, 3),
      ndaSigned: true,
      ndaSignature: {
        dataUrl: SIGNATURE_PLACEHOLDER,
        signedAt: subDays(now, 3).toISOString(),
        signedBy: USER_IDS.andrei,
        signedByName: 'Andrei Marin',
      },
      documents: [
        { documentId: 'doc-regulament', startedAt: subDays(now, 2).toISOString(), completedAt: subDays(now, 2).toISOString(), timeSpentSeconds: 120, confirmed: true },
        { documentId: 'doc-siguranta', startedAt: subDays(now, 2).toISOString(), completedAt: subDays(now, 2).toISOString(), timeSpentSeconds: 90, confirmed: true },
        { documentId: 'doc-echipament', startedAt: subDays(now, 2).toISOString(), completedAt: subDays(now, 2).toISOString(), timeSpentSeconds: 60, confirmed: true },
      ],
      videoProgress: {
        startedAt: subDays(now, 1).toISOString(),
        lastPosition: 180,
        totalDuration: 420,
        furthestReached: 180,
        completed: false,
      },
      videoCompleted: false,
      quizAttempts: [],
      quizPassed: false,
      isComplete: false,
      auditLog: [
        { id: 'audit-001', timestamp: subDays(now, 3).toISOString(), step: 'nda', action: 'Onboarding initializat', performedBy: USER_IDS.andrei },
        { id: 'audit-002', timestamp: subDays(now, 3).toISOString(), step: 'nda', action: 'NDA semnat', performedBy: USER_IDS.andrei },
        { id: 'audit-003', timestamp: subDays(now, 2).toISOString(), step: 'documents', action: 'Document confirmat: doc-regulament', performedBy: USER_IDS.andrei, details: { documentId: 'doc-regulament' } },
        { id: 'audit-004', timestamp: subDays(now, 2).toISOString(), step: 'documents', action: 'Document confirmat: doc-siguranta', performedBy: USER_IDS.andrei, details: { documentId: 'doc-siguranta' } },
        { id: 'audit-005', timestamp: subDays(now, 2).toISOString(), step: 'documents', action: 'Document confirmat: doc-echipament', performedBy: USER_IDS.andrei, details: { documentId: 'doc-echipament' } },
      ],
    },
  })

  // Cristina Pavel - at 'handoff' step
  await prisma.onboardingProgress.create({
    data: {
      id: 'onboard-2',
      employeeId: USER_IDS.cristina,
      employeeName: 'Cristina Pavel',
      currentStep: 'handoff',
      startedAt: subDays(now, 7),
      ndaSigned: true,
      ndaSignature: {
        dataUrl: SIGNATURE_PLACEHOLDER,
        signedAt: subDays(now, 7).toISOString(),
        signedBy: USER_IDS.cristina,
        signedByName: 'Cristina Pavel',
      },
      documents: [
        { documentId: 'doc-regulament', startedAt: subDays(now, 6).toISOString(), completedAt: subDays(now, 6).toISOString(), timeSpentSeconds: 150, confirmed: true },
        { documentId: 'doc-siguranta', startedAt: subDays(now, 6).toISOString(), completedAt: subDays(now, 6).toISOString(), timeSpentSeconds: 100, confirmed: true },
        { documentId: 'doc-echipament', startedAt: subDays(now, 6).toISOString(), completedAt: subDays(now, 6).toISOString(), timeSpentSeconds: 70, confirmed: true },
      ],
      videoProgress: {
        startedAt: subDays(now, 5).toISOString(),
        completedAt: subDays(now, 5).toISOString(),
        lastPosition: 420,
        totalDuration: 420,
        furthestReached: 420,
        completed: true,
      },
      videoCompleted: true,
      quizAttempts: [
        {
          attemptNumber: 1,
          startedAt: subDays(now, 4).toISOString(),
          completedAt: subDays(now, 4).toISOString(),
          answers: { q1: 'q1-c', q2: 'q2-c', q3: 'q3-b', q4: 'q4-c', q5: 'q5-b', q6: 'q6-b', q7: 'q7-f', q8: 'q8-t', q9: ['q9-a', 'q9-b', 'q9-d'], q10: ['q10-a', 'q10-b', 'q10-c'] },
          score: 90,
          passed: true,
        },
      ],
      quizPassed: true,
      quizBestScore: 90,
      physicalHandoff: { markedByManager: false, confirmedByEmployee: false },
      handoffCompleted: false,
      isComplete: false,
      auditLog: [
        { id: 'audit-010', timestamp: subDays(now, 7).toISOString(), step: 'nda', action: 'Onboarding initializat', performedBy: USER_IDS.cristina },
        { id: 'audit-011', timestamp: subDays(now, 7).toISOString(), step: 'nda', action: 'NDA semnat', performedBy: USER_IDS.cristina },
        { id: 'audit-012', timestamp: subDays(now, 5).toISOString(), step: 'video', action: 'Video de training completat', performedBy: USER_IDS.cristina },
        { id: 'audit-013', timestamp: subDays(now, 4).toISOString(), step: 'quiz', action: 'Quiz trecut (90% - incercarea 1)', performedBy: USER_IDS.cristina, details: { score: 90, passed: true, attemptNumber: 1 } },
      ],
    },
  })

  // Ion Vasile - Complete
  await prisma.onboardingProgress.create({
    data: {
      id: 'onboard-3',
      employeeId: USER_IDS.ion,
      employeeName: 'Ion Vasile',
      currentStep: 'complete',
      startedAt: subDays(now, 30),
      ndaSigned: true,
      ndaSignature: {
        dataUrl: SIGNATURE_PLACEHOLDER,
        signedAt: subDays(now, 30).toISOString(),
        signedBy: USER_IDS.ion,
        signedByName: 'Ion Vasile',
        pdfDataUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
      },
      ndaPdfUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
      documents: [
        { documentId: 'doc-regulament', startedAt: subDays(now, 29).toISOString(), completedAt: subDays(now, 29).toISOString(), timeSpentSeconds: 180, confirmed: true },
        { documentId: 'doc-siguranta', startedAt: subDays(now, 29).toISOString(), completedAt: subDays(now, 29).toISOString(), timeSpentSeconds: 120, confirmed: true },
        { documentId: 'doc-echipament', startedAt: subDays(now, 29).toISOString(), completedAt: subDays(now, 29).toISOString(), timeSpentSeconds: 90, confirmed: true },
      ],
      videoProgress: {
        startedAt: subDays(now, 28).toISOString(),
        completedAt: subDays(now, 28).toISOString(),
        lastPosition: 420,
        totalDuration: 420,
        furthestReached: 420,
        completed: true,
      },
      videoCompleted: true,
      quizAttempts: [
        {
          attemptNumber: 1,
          startedAt: subDays(now, 27).toISOString(),
          completedAt: subDays(now, 27).toISOString(),
          answers: { q1: 'q1-b', q2: 'q2-c', q3: 'q3-a', q4: 'q4-c', q5: 'q5-b', q6: 'q6-a', q7: 'q7-f', q8: 'q8-t', q9: ['q9-a', 'q9-b'], q10: ['q10-a', 'q10-b', 'q10-c'] },
          score: 60,
          passed: false,
        },
        {
          attemptNumber: 2,
          startedAt: subDays(now, 26).toISOString(),
          completedAt: subDays(now, 26).toISOString(),
          answers: { q1: 'q1-c', q2: 'q2-c', q3: 'q3-b', q4: 'q4-c', q5: 'q5-b', q6: 'q6-b', q7: 'q7-f', q8: 'q8-t', q9: ['q9-a', 'q9-b', 'q9-d'], q10: ['q10-a', 'q10-b', 'q10-c'] },
          score: 100,
          passed: true,
        },
      ],
      quizPassed: true,
      quizBestScore: 100,
      physicalHandoff: {
        markedByManager: true,
        managerSignature: {
          dataUrl: SIGNATURE_PLACEHOLDER,
          signedAt: subDays(now, 25).toISOString(),
          signedBy: USER_IDS.alexandru,
          signerName: 'Alexandru Popescu',
        },
        confirmedByEmployee: true,
        employeeConfirmedAt: subDays(now, 25).toISOString(),
      },
      handoffCompleted: true,
      managerId: USER_IDS.alexandru,
      isComplete: true,
      completedAt: subDays(now, 25),
      auditLog: [
        { id: 'audit-020', timestamp: subDays(now, 30).toISOString(), step: 'nda', action: 'Onboarding initializat', performedBy: USER_IDS.ion },
        { id: 'audit-021', timestamp: subDays(now, 30).toISOString(), step: 'nda', action: 'NDA semnat', performedBy: USER_IDS.ion },
        { id: 'audit-022', timestamp: subDays(now, 28).toISOString(), step: 'video', action: 'Video de training completat', performedBy: USER_IDS.ion },
        { id: 'audit-023', timestamp: subDays(now, 27).toISOString(), step: 'quiz', action: 'Quiz nereusit (60% - incercarea 1)', performedBy: USER_IDS.ion, details: { score: 60, passed: false, attemptNumber: 1 } },
        { id: 'audit-024', timestamp: subDays(now, 26).toISOString(), step: 'quiz', action: 'Quiz trecut (100% - incercarea 2)', performedBy: USER_IDS.ion, details: { score: 100, passed: true, attemptNumber: 2 } },
        { id: 'audit-025', timestamp: subDays(now, 25).toISOString(), step: 'handoff', action: 'Predare echipamente marcata de manager', performedBy: USER_IDS.alexandru, details: { managerName: 'Alexandru Popescu' } },
        { id: 'audit-026', timestamp: subDays(now, 25).toISOString(), step: 'handoff', action: 'Primire echipamente confirmata de angajat', performedBy: USER_IDS.ion },
        { id: 'audit-027', timestamp: subDays(now, 25).toISOString(), step: 'complete', action: 'Onboarding finalizat cu succes', performedBy: USER_IDS.ion },
      ],
    },
  })
  console.log('  Created 3 onboarding progress records')

  // ==========================================================================
  // 11. SOCIAL POSTS
  // ==========================================================================
  console.log('Creating social posts...')

  const emptyMetrics = { likes: 0, comments: 0, shares: 0, views: 0, lastUpdated: now.toISOString() }

  await prisma.socialPost.createMany({
    data: [
      // Draft post
      {
        id: 'post-1',
        caption: 'Pregatiti pentru o noua aventura? \n\nArena LaserZone te asteapta cu provocari noi si adrenalina maxima!\n\nVino cu prietenii si arata-le cine e cel mai bun tanar!',
        mediaIds: ['media-1'],
        hashtags: ['laserzone', 'lasertag', 'bucuresti', 'distractie'],
        platforms: ['facebook', 'instagram'],
        status: 'draft',
        platformStatuses: {
          facebook: { status: 'draft' },
          instagram: { status: 'draft' },
          tiktok: { status: 'draft' },
        },
        metrics: { facebook: emptyMetrics, instagram: emptyMetrics, tiktok: emptyMetrics },
        createdById: USER_IDS.alexandru,
        createdAt: pastDate(2, 14),
      },
      // Scheduled post 1
      {
        id: 'post-2',
        caption: 'Weekend special la LaserZone!\n\nSambata si duminica: 20% reducere la grupuri de 6+ persoane!\n\nRezerva acum si nu rata distractia!\n\n07XX XXX XXX\nBucuresti',
        mediaIds: ['media-3'],
        hashtags: ['laserzone', 'weekend', 'promotie', 'bucuresti', 'distractie'],
        platforms: ['facebook', 'instagram', 'tiktok'],
        scheduledAt: futureDate(2, 10, 0),
        status: 'scheduled',
        platformStatuses: {
          facebook: { status: 'scheduled' },
          instagram: { status: 'scheduled' },
          tiktok: { status: 'scheduled' },
        },
        metrics: { facebook: emptyMetrics, instagram: emptyMetrics, tiktok: emptyMetrics },
        createdById: USER_IDS.alexandru,
        createdAt: pastDate(1, 11),
      },
      // Scheduled post 2
      {
        id: 'post-3',
        caption: 'Petreceri de neuitat pentru cei mici!\n\nOrganizeaza aniversarea copilului tau la LaserZone:\nPachete all-inclusive\nDecoratiuni speciale\nGustari delicioase\nPoze de grup\n\nDe la 499 lei pentru 10 copii!\n\nRezerva: 07XX XXX XXX',
        mediaIds: ['media-4'],
        hashtags: ['laserzone', 'petrecere', 'copii', 'aniversare', 'bucuresti'],
        platforms: ['facebook', 'instagram'],
        scheduledAt: futureDate(5, 12, 30),
        status: 'scheduled',
        platformStatuses: {
          facebook: { status: 'scheduled' },
          instagram: { status: 'scheduled' },
          tiktok: { status: 'draft' },
        },
        metrics: { facebook: emptyMetrics, instagram: emptyMetrics, tiktok: emptyMetrics },
        createdById: USER_IDS.alexandru,
        createdAt: pastDate(3, 9),
      },
      // Published post with metrics
      {
        id: 'post-4',
        caption: 'Am avut o zi incredibila cu echipa de la TechCorp Romania!\n\nTeam building-ul perfect combina strategia, comunicarea si... putin laser tag!\n\nFelicitari echipei castigatoare!\n\nVrei un team building diferit? Scrie-ne!',
        mediaIds: ['media-7'],
        hashtags: ['laserzone', 'teambuilding', 'corporate', 'echipa', 'bucuresti'],
        platforms: ['facebook', 'instagram'],
        scheduledAt: pastDate(7, 15),
        publishedAt: pastDate(7, 15),
        status: 'published',
        platformStatuses: {
          facebook: { status: 'published', postId: 'fb-123456789' },
          instagram: { status: 'published', postId: 'ig-987654321' },
          tiktok: { status: 'draft' },
        },
        metrics: {
          facebook: { likes: 156, comments: 23, shares: 12, views: 2450, lastUpdated: now.toISOString() },
          instagram: { likes: 284, comments: 41, shares: 28, views: 3120, lastUpdated: now.toISOString() },
          tiktok: emptyMetrics,
        },
        createdById: USER_IDS.alexandru,
        createdAt: pastDate(8, 10),
      },
      // Failed post
      {
        id: 'post-5',
        caption: 'Azi testam noul echipament!\n\nStay tuned pentru surprize!',
        mediaIds: ['media-5'],
        hashtags: ['laserzone', 'echipament', 'noutati'],
        platforms: ['tiktok'],
        scheduledAt: pastDate(3, 18),
        status: 'failed',
        platformStatuses: {
          facebook: { status: 'draft' },
          instagram: { status: 'draft' },
          tiktok: { status: 'failed', error: 'Video format not supported. Please use 9:16 aspect ratio.' },
        },
        metrics: { facebook: emptyMetrics, instagram: emptyMetrics, tiktok: emptyMetrics },
        createdById: USER_IDS.alexandru,
        createdAt: pastDate(4, 12),
      },
    ],
  })
  console.log('  Created 5 social posts')

  // ==========================================================================
  // 12. SOCIAL TEMPLATES
  // ==========================================================================
  console.log('Creating social templates...')

  await prisma.socialTemplate.createMany({
    data: [
      { id: 'template-1', name: 'Promotie Weekend', content: 'Weekend special la LaserZone!\n\nVino cu gasca si bucura-te de:\n[OFERTA_DETALII]\nValabil sambata si duminica\n\nRezerva acum: 07XX XXX XXX\n\n#laserzone #weekend #bucuresti', category: 'promotie', createdAt: pastDate(30, 10) },
      { id: 'social-template-2', name: 'Eveniment Special', content: '[NUMELE_EVENIMENTULUI] la LaserZone!\n\nData: [DATA]\nOra: [ORA]\nLaserZone Bucuresti\n\nNu rata! Locurile sunt limitate.\n\nDetalii si rezervari: 07XX XXX XXX', category: 'eveniment', createdAt: pastDate(25, 14) },
      { id: 'social-template-3', name: 'Petrecere Copii', content: 'Cel mai tare party pentru copilul tau!\n\nLa LaserZone organizam petreceri de neuitat:\nLaser tag\nDecoratiuni\nGustari incluse\nPoze de grup\n\nPachet de la [PRET] lei!\n\nRezerva acum pentru copilul tau!', category: 'petrecere', createdAt: pastDate(20, 11) },
      { id: 'social-template-4', name: 'Corporate Team Building', content: 'Team building care chiar functioneaza!\n\nLaser tag pentru echipa ta:\nComunicare mai buna\nColaborare in actiune\nDistractie garantata\nAmintiri de neuitat\n\nPachete corporate personalizate.\nContact: corporate@laserzone.ro', category: 'corporate', createdAt: pastDate(15, 9) },
      { id: 'social-template-5', name: 'Postare Generala', content: 'Pregatit pentru adrenalina?\n\nLa LaserZone fiecare joc e o aventura!\n\n[LOCATIE]\nProgram: [PROGRAM]\n\nTe asteptam!', category: 'general', createdAt: pastDate(10, 16) },
      { id: 'social-template-6', name: 'Concurs Social Media', content: 'CONCURS LASERZONE!\n\nCastiga [PREMIU]!\n\nCum participi:\n1. Da follow @laserzone\n2. Like la aceasta postare\n3. Tag 2 prieteni in comentarii\n\nCastigatorul va fi anuntat pe [DATA]!\n\n#concurs #laserzone #giveaway', category: 'promotie', createdAt: pastDate(5, 13) },
    ],
  })
  console.log('  Created 6 social templates')

  // ==========================================================================
  // 13. HASHTAG SETS
  // ==========================================================================
  console.log('Creating hashtag sets...')

  await prisma.hashtagSet.createMany({
    data: [
      { id: 'hashtag-set-1', name: 'LaserZone General', hashtags: ['laserzone', 'lasertag', 'bucuresti', 'distractie', 'jocuri'], createdAt: pastDate(60, 10) },
      { id: 'hashtag-set-2', name: 'Evenimente', hashtags: ['petrecere', 'eveniment', 'teambuilding', 'fun', 'party'], createdAt: pastDate(55, 14) },
      { id: 'hashtag-set-3', name: 'Weekend', hashtags: ['weekend', 'sambata', 'duminica', 'relaxare', 'timpcuprietenii'], createdAt: pastDate(50, 11) },
      { id: 'hashtag-set-4', name: 'Familie', hashtags: ['familie', 'copii', 'parinti', 'distractieinfamilie', 'qualitytime'], createdAt: pastDate(45, 9) },
      { id: 'hashtag-set-5', name: 'Actiune', hashtags: ['actiune', 'adrenalina', 'competitie', 'strategie', 'echipa'], createdAt: pastDate(40, 15) },
    ],
  })
  console.log('  Created 5 hashtag sets')

  // ==========================================================================
  // 14. CONTENT LIBRARY
  // ==========================================================================
  console.log('Creating content library items...')

  await prisma.contentLibraryItem.createMany({
    data: [
      { id: 'media-1', name: 'Arena principala', type: 'image', url: '/images/social/arena-main.jpg', thumbnailUrl: '/images/social/arena-main-thumb.jpg', mimeType: 'image/jpeg', size: 2500000, width: 1920, height: 1080, tags: ['arena', 'interior', 'neon'], createdAt: pastDate(90, 10) },
      { id: 'media-2', name: 'Echipament laser', type: 'image', url: '/images/social/equipment.jpg', thumbnailUrl: '/images/social/equipment-thumb.jpg', mimeType: 'image/jpeg', size: 1800000, width: 1080, height: 1080, tags: ['echipament', 'arme', 'tech'], createdAt: pastDate(85, 14) },
      { id: 'media-3', name: 'Grupa in actiune', type: 'image', url: '/images/social/action-group.jpg', thumbnailUrl: '/images/social/action-group-thumb.jpg', mimeType: 'image/jpeg', size: 2200000, width: 1200, height: 800, tags: ['actiune', 'grup', 'joc'], createdAt: pastDate(80, 11) },
      { id: 'media-4', name: 'Petrecere copii', type: 'image', url: '/images/social/kids-party.jpg', thumbnailUrl: '/images/social/kids-party-thumb.jpg', mimeType: 'image/jpeg', size: 1950000, width: 1080, height: 1350, tags: ['petrecere', 'copii', 'aniversare'], createdAt: pastDate(75, 9) },
      { id: 'media-5', name: 'Video promo arena', type: 'video', url: '/videos/social/arena-promo.mp4', thumbnailUrl: '/images/social/arena-promo-thumb.jpg', mimeType: 'video/mp4', size: 45000000, width: 1080, height: 1920, duration: 30, tags: ['arena', 'promo', 'reel'], createdAt: pastDate(70, 15) },
      { id: 'media-6', name: 'Video tutorial joc', type: 'video', url: '/videos/social/tutorial.mp4', thumbnailUrl: '/images/social/tutorial-thumb.jpg', mimeType: 'video/mp4', size: 28000000, width: 1920, height: 1080, duration: 45, tags: ['tutorial', 'reguli', 'instructiuni'], createdAt: pastDate(65, 12) },
      { id: 'media-7', name: 'Team building corporate', type: 'image', url: '/images/social/corporate.jpg', thumbnailUrl: '/images/social/corporate-thumb.jpg', mimeType: 'image/jpeg', size: 2100000, width: 1920, height: 1080, tags: ['corporate', 'teambuilding', 'profesional'], createdAt: pastDate(60, 10) },
      { id: 'media-8', name: 'Scoreboard final', type: 'image', url: '/images/social/scoreboard.jpg', thumbnailUrl: '/images/social/scoreboard-thumb.jpg', mimeType: 'image/jpeg', size: 1500000, width: 1080, height: 1080, tags: ['scoreboard', 'rezultate', 'competitie'], createdAt: pastDate(55, 16) },
    ],
  })
  console.log('  Created 8 content library items')

  console.log('\nSeed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

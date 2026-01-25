/**
 * Mock data for calendar/reservation system
 * Includes customers, tags, and reservations for development and testing
 */

import { addDays, subDays, format } from 'date-fns'
import type { Customer, CustomerTag, Reservation, CapacitySettings, Occasion, ReservationStatus } from './types'

// ============================================================================
// Default Tags (staff can create more)
// ============================================================================

export const DEFAULT_TAGS: CustomerTag[] = [
  { id: 'tag-vip', name: 'VIP', color: '#f535aa' }, // neon pink (brand accent)
  { id: 'tag-birthday', name: 'Birthday Regular', color: '#22d3ee' }, // cyan
  { id: 'tag-corporate', name: 'Corporate', color: '#a855f7' }, // purple
  { id: 'tag-frequent', name: 'Frequent', color: '#22c55e' }, // green
  { id: 'tag-first-timer', name: 'First Timer', color: '#f59e0b' }, // amber
  { id: 'tag-problem', name: 'Problem', color: '#ef4444' }, // red
]

// ============================================================================
// Default Capacity Settings
// ============================================================================

export const DEFAULT_CAPACITY_SETTINGS: CapacitySettings = {
  defaultCapacity: 40, // players per 30-min slot
  warningThreshold: 0.8, // yellow at 80%
  criticalThreshold: 1.0, // red at 100%
}

// ============================================================================
// Mock Customers (12+ with Romanian names)
// ============================================================================

const today = new Date()

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Ionescu Alexandru',
    phone: '0722 123 456',
    email: 'alex.ionescu@email.ro',
    tags: [DEFAULT_TAGS[0], DEFAULT_TAGS[3]], // VIP, Frequent
    notes: 'Prefera sesiunile de dupa-amiaza. Aduce mereu echipa de la firma.',
    createdAt: subDays(today, 180),
    updatedAt: subDays(today, 5),
  },
  {
    id: 'cust-002',
    name: 'Popescu Maria',
    phone: '0733 234 567',
    email: 'maria.popescu@gmail.com',
    tags: [DEFAULT_TAGS[1]], // Birthday Regular
    notes: 'Organizeaza petreceri pentru copii in fiecare an.',
    createdAt: subDays(today, 365),
    updatedAt: subDays(today, 30),
  },
  {
    id: 'cust-003',
    name: 'Dumitrescu Andrei',
    phone: '0744 345 678',
    tags: [DEFAULT_TAGS[2]], // Corporate
    notes: 'Contact HR la TechCorp SRL. Team building trimestrial.',
    createdAt: subDays(today, 120),
    updatedAt: subDays(today, 15),
  },
  {
    id: 'cust-004',
    name: 'Gheorghiu Elena',
    phone: '0755 456 789',
    email: 'elena.g@yahoo.com',
    tags: [DEFAULT_TAGS[3]], // Frequent
    createdAt: subDays(today, 90),
    updatedAt: subDays(today, 7),
  },
  {
    id: 'cust-005',
    name: 'Stanescu Mihai',
    phone: '0766 567 890',
    tags: [DEFAULT_TAGS[0], DEFAULT_TAGS[2]], // VIP, Corporate
    notes: 'Director General la InnovateSoft. Buget mare pentru evenimente.',
    createdAt: subDays(today, 200),
    updatedAt: subDays(today, 10),
  },
  {
    id: 'cust-006',
    name: 'Radu Cristina',
    phone: '0777 678 901',
    email: 'cristina.radu@firma.ro',
    tags: [DEFAULT_TAGS[1], DEFAULT_TAGS[3]], // Birthday Regular, Frequent
    notes: 'Fiul are petrecerea anual aici. Vine si cu prietenii.',
    createdAt: subDays(today, 400),
    updatedAt: subDays(today, 20),
  },
  {
    id: 'cust-007',
    name: 'Marin Bogdan',
    phone: '0788 789 012',
    tags: [DEFAULT_TAGS[4]], // First Timer
    createdAt: subDays(today, 2),
    updatedAt: subDays(today, 2),
  },
  {
    id: 'cust-008',
    name: 'Vasilescu Ana',
    phone: '0799 890 123',
    email: 'ana.v@outlook.com',
    tags: [DEFAULT_TAGS[3]], // Frequent
    notes: 'Prefera weekend-urile dimineata.',
    createdAt: subDays(today, 150),
    updatedAt: subDays(today, 3),
  },
  {
    id: 'cust-009',
    name: 'Florescu Dan',
    phone: '0722 901 234',
    tags: [DEFAULT_TAGS[5]], // Problem
    notes: 'Atentie: A avut comportament neadecvat ultima data. Supraveghere.',
    createdAt: subDays(today, 60),
    updatedAt: subDays(today, 60),
  },
  {
    id: 'cust-010',
    name: 'Constantinescu Ioana',
    phone: '0733 012 345',
    email: 'ioana.c@gmail.com',
    tags: [DEFAULT_TAGS[2]], // Corporate
    notes: 'Departament HR la BankCorp. Evenimente lunare.',
    createdAt: subDays(today, 80),
    updatedAt: subDays(today, 8),
  },
  {
    id: 'cust-011',
    name: 'Popa Stefan',
    phone: '0744 123 567',
    tags: [], // No tags yet
    createdAt: subDays(today, 14),
    updatedAt: subDays(today, 14),
  },
  {
    id: 'cust-012',
    name: 'Dobre Laura',
    phone: '0755 234 678',
    email: 'laura.dobre@email.ro',
    tags: [DEFAULT_TAGS[0]], // VIP
    notes: 'Influencer local. Posteaza mereu pe social media.',
    createdAt: subDays(today, 45),
    updatedAt: subDays(today, 1),
  },
]

// ============================================================================
// Mock Reservations (25+ with variety)
// ============================================================================

// Helper to create dates relative to today
const getDate = (daysFromNow: number): string => format(addDays(today, daysFromNow), 'yyyy-MM-dd')
const getPastDate = (daysAgo: number): string => format(subDays(today, daysAgo), 'yyyy-MM-dd')

// Helper for createdAt dates
const getCreatedAt = (daysAgo: number): Date => subDays(today, daysAgo)

export const MOCK_RESERVATIONS: Reservation[] = [
  // === TODAY ===
  {
    id: 'res-001',
    customerId: 'cust-001',
    date: getDate(0),
    startTime: '10:00',
    endTime: '11:00',
    partySize: 8,
    occasion: 'corporate' as Occasion,
    notes: 'Team building TechCorp',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(3),
    updatedAt: getCreatedAt(1),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-002',
    customerId: 'cust-004',
    date: getDate(0),
    startTime: '14:00',
    endTime: '15:00',
    partySize: 6,
    occasion: 'regular' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(7),
    updatedAt: getCreatedAt(7),
    createdBy: 'user-employee-1',
  },
  {
    id: 'res-003',
    customerId: 'cust-006',
    date: getDate(0),
    startTime: '16:00',
    endTime: '18:00',
    partySize: 15,
    occasion: 'birthday' as Occasion,
    notes: 'Petrecere Andrei 10 ani - catering comandat',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(14),
    updatedAt: getCreatedAt(2),
    createdBy: 'user-manager-1',
  },

  // === TOMORROW ===
  {
    id: 'res-004',
    customerId: 'cust-002',
    date: getDate(1),
    startTime: '11:00',
    endTime: '12:00',
    partySize: 10,
    occasion: 'birthday' as Occasion,
    notes: 'Petrecere copii',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(10),
    updatedAt: getCreatedAt(10),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-005',
    customerId: 'cust-003',
    date: getDate(1),
    startTime: '14:00',
    endTime: '16:00',
    partySize: 20,
    occasion: 'corporate' as Occasion,
    notes: 'TechCorp trimestrial - rezervare sala mare',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(21),
    updatedAt: getCreatedAt(5),
    createdBy: 'user-manager-1',
  },
  // CONFLICT SCENARIO: Same time slot as res-005
  {
    id: 'res-006',
    customerId: 'cust-008',
    date: getDate(1),
    startTime: '14:30',
    endTime: '15:30',
    partySize: 12,
    occasion: 'group' as Occasion,
    notes: 'Grup de prieteni',
    status: 'confirmed' as ReservationStatus,
    hasConflict: true, // Overlaps with res-005
    conflictOverridden: true, // Staff approved anyway
    createdAt: getCreatedAt(2),
    updatedAt: getCreatedAt(2),
    createdBy: 'user-employee-1',
  },

  // === DAY AFTER TOMORROW ===
  {
    id: 'res-007',
    customerId: 'cust-005',
    date: getDate(2),
    startTime: '09:00',
    endTime: '11:00',
    partySize: 25,
    occasion: 'corporate' as Occasion,
    notes: 'InnovateSoft aniversare firma - eveniment VIP',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(30),
    updatedAt: getCreatedAt(3),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-008',
    customerId: 'cust-007',
    date: getDate(2),
    startTime: '15:00',
    endTime: '16:00',
    partySize: 4,
    occasion: 'regular' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(1),
    updatedAt: getCreatedAt(1),
    createdBy: 'user-employee-1',
  },

  // === 3 DAYS FROM NOW ===
  {
    id: 'res-009',
    customerId: 'cust-010',
    date: getDate(3),
    startTime: '10:00',
    endTime: '12:00',
    partySize: 18,
    occasion: 'corporate' as Occasion,
    notes: 'BankCorp team building',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(15),
    updatedAt: getCreatedAt(15),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-010',
    customerId: 'cust-011',
    date: getDate(3),
    startTime: '14:00',
    endTime: '15:00',
    partySize: 5,
    occasion: 'regular' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(5),
    updatedAt: getCreatedAt(5),
    createdBy: 'user-employee-1',
  },
  // HIGH CAPACITY SCENARIO: Multiple bookings same slot
  {
    id: 'res-011',
    customerId: 'cust-012',
    date: getDate(3),
    startTime: '14:00',
    endTime: '15:00',
    partySize: 15,
    occasion: 'group' as Occasion,
    notes: 'Sesiune foto cu influenceri',
    status: 'confirmed' as ReservationStatus,
    hasConflict: true, // Same slot as res-010, high combined capacity
    conflictOverridden: true,
    createdAt: getCreatedAt(3),
    updatedAt: getCreatedAt(3),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-012',
    customerId: 'cust-004',
    date: getDate(3),
    startTime: '14:00',
    endTime: '15:00',
    partySize: 10,
    occasion: 'regular' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: true, // Same slot - this pushes to ~75% capacity (5+15+10=30/40)
    conflictOverridden: true,
    createdAt: getCreatedAt(2),
    updatedAt: getCreatedAt(2),
    createdBy: 'user-employee-1',
  },

  // === 4-5 DAYS FROM NOW (WEEKEND) ===
  {
    id: 'res-013',
    customerId: 'cust-001',
    date: getDate(4),
    startTime: '10:00',
    endTime: '12:00',
    partySize: 12,
    occasion: 'corporate' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(7),
    updatedAt: getCreatedAt(7),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-014',
    customerId: 'cust-002',
    date: getDate(4),
    startTime: '14:00',
    endTime: '16:00',
    partySize: 20,
    occasion: 'birthday' as Occasion,
    notes: 'Petrecere Ana 8 ani - tort inclus',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(20),
    updatedAt: getCreatedAt(10),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-015',
    customerId: 'cust-006',
    date: getDate(5),
    startTime: '11:00',
    endTime: '13:00',
    partySize: 14,
    occasion: 'birthday' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(8),
    updatedAt: getCreatedAt(8),
    createdBy: 'user-employee-1',
  },
  // NEAR FULL CAPACITY SCENARIO
  {
    id: 'res-016',
    customerId: 'cust-003',
    date: getDate(5),
    startTime: '15:00',
    endTime: '16:00',
    partySize: 20,
    occasion: 'corporate' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(12),
    updatedAt: getCreatedAt(12),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-017',
    customerId: 'cust-005',
    date: getDate(5),
    startTime: '15:00',
    endTime: '16:00',
    partySize: 18,
    occasion: 'corporate' as Occasion,
    notes: 'InnovateSoft departament IT',
    status: 'confirmed' as ReservationStatus,
    hasConflict: true, // Combined 38/40 = 95% capacity
    conflictOverridden: true,
    createdAt: getCreatedAt(6),
    updatedAt: getCreatedAt(6),
    createdBy: 'user-manager-1',
  },

  // === NEXT WEEK ===
  {
    id: 'res-018',
    customerId: 'cust-008',
    date: getDate(7),
    startTime: '10:00',
    endTime: '11:00',
    partySize: 6,
    occasion: 'regular' as Occasion,
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(4),
    updatedAt: getCreatedAt(4),
    createdBy: 'user-employee-1',
  },
  {
    id: 'res-019',
    customerId: 'cust-010',
    date: getDate(8),
    startTime: '14:00',
    endTime: '16:00',
    partySize: 22,
    occasion: 'corporate' as Occasion,
    notes: 'BankCorp luna aceasta',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(10),
    updatedAt: getCreatedAt(10),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-020',
    customerId: 'cust-012',
    date: getDate(9),
    startTime: '16:00',
    endTime: '17:00',
    partySize: 8,
    occasion: 'other' as Occasion,
    notes: 'Sesiune foto pentru brand',
    status: 'confirmed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(14),
    updatedAt: getCreatedAt(14),
    createdBy: 'user-manager-1',
  },

  // === PAST RESERVATIONS (for history) ===
  {
    id: 'res-021',
    customerId: 'cust-001',
    date: getPastDate(7),
    startTime: '14:00',
    endTime: '15:00',
    partySize: 10,
    occasion: 'corporate' as Occasion,
    status: 'completed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(20),
    updatedAt: getCreatedAt(7),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-022',
    customerId: 'cust-002',
    date: getPastDate(14),
    startTime: '11:00',
    endTime: '13:00',
    partySize: 12,
    occasion: 'birthday' as Occasion,
    notes: 'Petrecere finalizata cu succes',
    status: 'completed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(30),
    updatedAt: getCreatedAt(14),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-023',
    customerId: 'cust-009',
    date: getPastDate(21),
    startTime: '15:00',
    endTime: '16:00',
    partySize: 6,
    occasion: 'regular' as Occasion,
    notes: 'Comportament neadecvat - avertizat',
    status: 'completed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(35),
    updatedAt: getCreatedAt(21),
    createdBy: 'user-employee-1',
  },
  // CANCELLED RESERVATION
  {
    id: 'res-024',
    customerId: 'cust-011',
    date: getPastDate(3),
    startTime: '10:00',
    endTime: '11:00',
    partySize: 4,
    occasion: 'regular' as Occasion,
    notes: 'Anulat de client - urgenta',
    status: 'cancelled' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(10),
    updatedAt: getCreatedAt(4),
    createdBy: 'user-employee-1',
  },
  // NO SHOW
  {
    id: 'res-025',
    customerId: 'cust-007',
    date: getPastDate(5),
    startTime: '14:00',
    endTime: '15:00',
    partySize: 5,
    occasion: 'regular' as Occasion,
    status: 'no_show' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(12),
    updatedAt: getCreatedAt(5),
    createdBy: 'user-employee-1',
  },
  // More completed for history depth
  {
    id: 'res-026',
    customerId: 'cust-003',
    date: getPastDate(30),
    startTime: '10:00',
    endTime: '12:00',
    partySize: 18,
    occasion: 'corporate' as Occasion,
    status: 'completed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(45),
    updatedAt: getCreatedAt(30),
    createdBy: 'user-manager-1',
  },
  {
    id: 'res-027',
    customerId: 'cust-005',
    date: getPastDate(45),
    startTime: '14:00',
    endTime: '16:00',
    partySize: 25,
    occasion: 'corporate' as Occasion,
    notes: 'Eveniment de lansare produs',
    status: 'completed' as ReservationStatus,
    hasConflict: false,
    conflictOverridden: false,
    createdAt: getCreatedAt(60),
    updatedAt: getCreatedAt(45),
    createdBy: 'user-manager-1',
  },
]

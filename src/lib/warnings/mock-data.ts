/**
 * Mock data for warnings system
 * Demonstrates various warning scenarios for development and testing
 */

import { subDays } from 'date-fns'
import type { Warning, Signature, Acknowledgment } from './types'

// Reference mock users from auth module
// Manager users (IDs 1, 2): Alexandru Popescu, Maria Ionescu
// Employee users (IDs 3, 4, 5): Ion Vasile, Elena Dumitrescu, Andrei Marin

/**
 * Helper to create manager signatures
 */
function createManagerSignature(
  managerId: string,
  managerName: string,
  signedAt: Date
): Signature {
  return {
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    signedAt,
    signedBy: managerId,
    signerName: managerName,
    signerRole: 'manager',
  }
}

/**
 * Helper to create employee acknowledgment with signature
 */
function createAcknowledgment(
  employeeId: string,
  employeeName: string,
  acknowledgedAt: Date,
  comments?: string
): Acknowledgment {
  return {
    signature: {
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      signedAt: acknowledgedAt,
      signedBy: employeeId,
      signerName: employeeName,
      signerRole: 'angajat',
    },
    refusedToSign: false,
    employeeComments: comments,
    acknowledgedAt,
  }
}

/**
 * Helper to create refused acknowledgment
 */
function createRefusedAcknowledgment(
  refusedAt: Date,
  witnessName: string
): Acknowledgment {
  return {
    refusedToSign: true,
    refusedAt,
    refusedWitnessedBy: witnessName,
  }
}

const now = new Date()

/**
 * Mock warnings demonstrating various scenarios
 */
export const MOCK_WARNINGS: Warning[] = [
  // ==========================================================================
  // 1. Ion Vasile (ID: 3) - Verbal warning for tardiness - Acknowledged
  // ==========================================================================
  {
    id: 'warn-001',
    employeeId: '3',
    employeeName: 'Ion Vasile',
    managerId: '1',
    managerName: 'Alexandru Popescu',
    level: 'verbal',
    category: 'tardiness',
    description:
      'Angajatul Ion Vasile a intarziat 45 de minute la tura de dimineata din data de ' +
      'referinta. Nu a anuntat intarzierea si nu a oferit o justificare acceptabila. ' +
      'Aceasta este prima incalcare de acest tip.',
    incidentDate: subDays(now, 75),
    managerSignature: createManagerSignature('1', 'Alexandru Popescu', subDays(now, 74)),
    acknowledgment: createAcknowledgment(
      '3',
      'Ion Vasile',
      subDays(now, 74),
      'Am inteles si voi respecta programul in viitor.'
    ),
    status: 'acknowledged',
    isCleared: false,
    createdAt: subDays(now, 74),
    updatedAt: subDays(now, 74),
  },

  // ==========================================================================
  // 2. Ion Vasile (ID: 3) - Written warning for tardiness (escalated) - Acknowledged
  // ==========================================================================
  {
    id: 'warn-002',
    employeeId: '3',
    employeeName: 'Ion Vasile',
    managerId: '1',
    managerName: 'Alexandru Popescu',
    level: 'written',
    category: 'tardiness',
    description:
      'Dupa avertismentul verbal din luna anterioara, angajatul Ion Vasile a intarziat ' +
      'din nou la serviciu, de data aceasta cu 30 de minute. Aceasta este a doua ' +
      'incalcare in decurs de 30 de zile, ceea ce justifica escaladarea la avertisment scris.',
    incidentDate: subDays(now, 45),
    witness: 'Elena Dumitrescu',
    managerSignature: createManagerSignature('1', 'Alexandru Popescu', subDays(now, 44)),
    acknowledgment: createAcknowledgment(
      '3',
      'Ion Vasile',
      subDays(now, 44),
      'Accept avertismentul si ma angajez sa nu mai repet aceasta greseala.'
    ),
    status: 'acknowledged',
    isCleared: false,
    createdAt: subDays(now, 44),
    updatedAt: subDays(now, 44),
  },

  // ==========================================================================
  // 3. Elena Dumitrescu (ID: 4) - Verbal warning - Pending acknowledgment
  // ==========================================================================
  {
    id: 'warn-003',
    employeeId: '4',
    employeeName: 'Elena Dumitrescu',
    managerId: '2',
    managerName: 'Maria Ionescu',
    level: 'verbal',
    category: 'uniform_appearance',
    description:
      'Angajata Elena Dumitrescu s-a prezentat la serviciu fara uniforma completa. ' +
      'Lipsea tricoul cu logo-ul companiei, fiind inlocuit cu un tricou personal. ' +
      'Clientii au observat acest lucru si am primit o observatie.',
    incidentDate: subDays(now, 3),
    managerSignature: createManagerSignature('2', 'Maria Ionescu', subDays(now, 2)),
    acknowledgment: undefined,
    status: 'pending_acknowledgment',
    isCleared: false,
    createdAt: subDays(now, 2),
    updatedAt: subDays(now, 2),
  },

  // ==========================================================================
  // 4. Andrei Marin (ID: 5) - Verbal warning - Refused to sign
  // ==========================================================================
  {
    id: 'warn-004',
    employeeId: '5',
    employeeName: 'Andrei Marin',
    managerId: '1',
    managerName: 'Alexandru Popescu',
    level: 'verbal',
    category: 'customer_complaint',
    description:
      'Am primit o plangere de la un client in legatura cu atitudinea angajatului ' +
      'Andrei Marin. Clientul a raportat ca angajatul a fost nepoliticos si ' +
      'a refuzat sa raspunda la intrebari despre promotiile curente.',
    incidentDate: subDays(now, 20),
    witness: 'Ion Vasile',
    managerSignature: createManagerSignature('1', 'Alexandru Popescu', subDays(now, 19)),
    acknowledgment: createRefusedAcknowledgment(subDays(now, 19), 'Maria Ionescu'),
    status: 'refused',
    isCleared: false,
    createdAt: subDays(now, 19),
    updatedAt: subDays(now, 19),
  },

  // ==========================================================================
  // 5. Andrei Marin (ID: 5) - Verbal warning - Cleared
  // ==========================================================================
  {
    id: 'warn-005',
    employeeId: '5',
    employeeName: 'Andrei Marin',
    managerId: '2',
    managerName: 'Maria Ionescu',
    level: 'verbal',
    category: 'no_show',
    description:
      'Angajatul Andrei Marin nu s-a prezentat la tura programata din data de ' +
      'referinta. Nu a anuntat absenta si nu a raspuns la telefon. ' +
      'Absenta a cauzat probleme in organizarea activitatii.',
    incidentDate: subDays(now, 90),
    managerSignature: createManagerSignature('2', 'Maria Ionescu', subDays(now, 89)),
    acknowledgment: createAcknowledgment(
      '5',
      'Andrei Marin',
      subDays(now, 88)
    ),
    status: 'cleared',
    isCleared: true,
    clearedAt: subDays(now, 30),
    clearedBy: '2',
    clearedReason: 'Comportament exemplar timp de 60 de zile consecutiv.',
    createdAt: subDays(now, 89),
    updatedAt: subDays(now, 30),
  },

  // ==========================================================================
  // 6. Elena Dumitrescu (ID: 4) - Final warning - Acknowledged (serious case)
  // ==========================================================================
  {
    id: 'warn-006',
    employeeId: '4',
    employeeName: 'Elena Dumitrescu',
    managerId: '1',
    managerName: 'Alexandru Popescu',
    level: 'final',
    category: 'cash_handling',
    description:
      'La inventarul zilnic s-a constatat o diferenta de 150 RON la casa. ' +
      'Dupa investigatie, s-a descoperit ca angajata Elena Dumitrescu nu a ' +
      'inregistrat corect mai multe tranzactii. Desi nu exista dovezi de ' +
      'intentie frauduloasa, neglijenta este grava si justifica avertisment final.',
    incidentDate: subDays(now, 60),
    witness: 'Alexandru Popescu',
    managerSignature: createManagerSignature('1', 'Alexandru Popescu', subDays(now, 59)),
    acknowledgment: createAcknowledgment(
      '4',
      'Elena Dumitrescu',
      subDays(now, 58),
      'Accept responsabilitatea si voi fi mai atenta la inregistrarea tranzactiilor.'
    ),
    status: 'acknowledged',
    isCleared: false,
    createdAt: subDays(now, 59),
    updatedAt: subDays(now, 58),
  },

  // ==========================================================================
  // 7. Ion Vasile (ID: 3) - Verbal warning for safety - Acknowledged
  // Different category to show variety
  // ==========================================================================
  {
    id: 'warn-007',
    employeeId: '3',
    employeeName: 'Ion Vasile',
    managerId: '2',
    managerName: 'Maria Ionescu',
    level: 'verbal',
    category: 'safety_violation',
    description:
      'Angajatul Ion Vasile a fost observat facand curatenie in zona de joc ' +
      'fara a purta echipamentul de protectie (ochelari). Aceasta este o ' +
      'incalcare a normelor de securitate in munca.',
    incidentDate: subDays(now, 15),
    managerSignature: createManagerSignature('2', 'Maria Ionescu', subDays(now, 14)),
    acknowledgment: createAcknowledgment(
      '3',
      'Ion Vasile',
      subDays(now, 14)
    ),
    status: 'acknowledged',
    isCleared: false,
    createdAt: subDays(now, 14),
    updatedAt: subDays(now, 14),
  },

  // ==========================================================================
  // 8. Andrei Marin (ID: 5) - Written warning for performance - Pending
  // Recent warning, pending acknowledgment
  // ==========================================================================
  {
    id: 'warn-008',
    employeeId: '5',
    employeeName: 'Andrei Marin',
    managerId: '1',
    managerName: 'Alexandru Popescu',
    level: 'written',
    category: 'performance',
    description:
      'Evaluarea lunara a performantei a aratat ca angajatul Andrei Marin nu ' +
      'a atins obiectivele stabilite pentru vanzarea pachetelor de petreceri. ' +
      'Desi a primit coaching suplimentar, rezultatele nu s-au imbunatatit ' +
      'semnificativ in ultimele 4 saptamani.',
    incidentDate: subDays(now, 5),
    managerSignature: createManagerSignature('1', 'Alexandru Popescu', subDays(now, 4)),
    acknowledgment: undefined,
    status: 'pending_acknowledgment',
    isCleared: false,
    createdAt: subDays(now, 4),
    updatedAt: subDays(now, 4),
  },

  // ==========================================================================
  // 9. Elena Dumitrescu (ID: 4) - Verbal warning - Acknowledged (older)
  // Shows history before final warning
  // ==========================================================================
  {
    id: 'warn-009',
    employeeId: '4',
    employeeName: 'Elena Dumitrescu',
    managerId: '2',
    managerName: 'Maria Ionescu',
    level: 'verbal',
    category: 'policy_violation',
    description:
      'Angajata Elena Dumitrescu a fost surprinsa folosind telefonul personal ' +
      'in timpul programului de lucru, in zona vizibila de clienti. ' +
      'Conform regulamentului, telefoanele trebuie pastrate in dulap.',
    incidentDate: subDays(now, 85),
    managerSignature: createManagerSignature('2', 'Maria Ionescu', subDays(now, 84)),
    acknowledgment: createAcknowledgment(
      '4',
      'Elena Dumitrescu',
      subDays(now, 84)
    ),
    status: 'acknowledged',
    isCleared: false,
    createdAt: subDays(now, 84),
    updatedAt: subDays(now, 84),
  },

  // ==========================================================================
  // 10. Ion Vasile (ID: 3) - Verbal warning for insubordination - Pending
  // Most recent warning for this employee
  // ==========================================================================
  {
    id: 'warn-010',
    employeeId: '3',
    employeeName: 'Ion Vasile',
    managerId: '1',
    managerName: 'Alexandru Popescu',
    level: 'verbal',
    category: 'insubordination',
    description:
      'Angajatul Ion Vasile a contestat public o decizie a managerului in fata ' +
      'colegilor, creand o situatie tensionata. Desi are dreptul sa exprime ' +
      'nemultumiri, acest lucru trebuie facut in privat, nu in fata echipei.',
    incidentDate: subDays(now, 1),
    managerSignature: createManagerSignature('1', 'Alexandru Popescu', now),
    acknowledgment: undefined,
    status: 'pending_acknowledgment',
    isCleared: false,
    createdAt: now,
    updatedAt: now,
  },
]

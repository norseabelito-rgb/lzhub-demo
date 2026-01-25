/**
 * Tipuri pentru sistemul de avertismente (disciplina progresiva)
 * Fundatia pentru gestionarea avertismentelor cu escaladare si confirmare
 */

// ============================================================================
// Discipline Level Types (Niveluri de disciplina)
// ============================================================================

/**
 * Nivelurile de disciplina in ordine crescatoare de severitate
 * verbal -> written -> final -> termination
 */
export const DISCIPLINE_LEVELS = ['verbal', 'written', 'final', 'termination'] as const

export type DisciplineLevel = (typeof DISCIPLINE_LEVELS)[number]

/** Etichete pentru afisare in romana */
export const DISCIPLINE_LEVEL_LABELS: Record<DisciplineLevel, string> = {
  verbal: 'Verbal',
  written: 'Scris',
  final: 'Final',
  termination: 'Terminare',
}

// ============================================================================
// Violation Category Types (Categorii de incalcari)
// ============================================================================

/**
 * Categoriile de incalcari pentru avertismente
 */
export const VIOLATION_CATEGORIES = [
  'tardiness',
  'no_show',
  'policy_violation',
  'performance',
  'insubordination',
  'safety_violation',
  'customer_complaint',
  'cash_handling',
  'uniform_appearance',
  'other',
] as const

export type ViolationCategory = (typeof VIOLATION_CATEGORIES)[number]

/** Etichete pentru afisare in romana */
export const VIOLATION_CATEGORY_LABELS: Record<ViolationCategory, string> = {
  tardiness: 'Intarziere',
  no_show: 'Absenta nemotivata',
  policy_violation: 'Incalcare politica',
  performance: 'Performanta slaba',
  insubordination: 'Insubordonare',
  safety_violation: 'Incalcare siguranta',
  customer_complaint: 'Plangere client',
  cash_handling: 'Gestionare numerar',
  uniform_appearance: 'Tinuta necorespunzatoare',
  other: 'Altele',
}

// ============================================================================
// Warning Status Types (Status avertisment)
// ============================================================================

/**
 * Statusul curent al unui avertisment
 */
export type WarningStatus = 'pending_acknowledgment' | 'acknowledged' | 'refused' | 'cleared'

/** Etichete pentru afisare in romana */
export const WARNING_STATUS_LABELS: Record<WarningStatus, string> = {
  pending_acknowledgment: 'In asteptare',
  acknowledged: 'Confirmat',
  refused: 'Refuzat',
  cleared: 'Anulat',
}

// ============================================================================
// Signature Types (Semnatura)
// ============================================================================

/**
 * Semnatura capturata de pe canvas
 * @property dataUrl - Imagine base64 a semnaturii
 * @property signedAt - Data si ora semnarii
 * @property signedBy - ID-ul utilizatorului care a semnat
 * @property signerName - Numele afisat la momentul semnarii
 * @property signerRole - Rolul semnatarului
 */
export interface Signature {
  /** Imagine base64 a semnaturii (data URL din canvas) */
  dataUrl: string
  /** Data si ora semnarii */
  signedAt: Date
  /** ID-ul utilizatorului care a semnat */
  signedBy: string
  /** Numele afisat la momentul semnarii */
  signerName: string
  /** Rolul semnatarului */
  signerRole: 'manager' | 'angajat'
}

// ============================================================================
// Acknowledgment Types (Confirmare)
// ============================================================================

/**
 * Confirmarea avertismentului de catre angajat
 * Include optiunea de refuz cu martor
 * @property signature - Semnatura angajatului (optional daca refuza)
 * @property refusedToSign - Indica daca angajatul a refuzat sa semneze
 * @property refusedAt - Data si ora refuzului
 * @property refusedWitnessedBy - Numele martorului in caz de refuz
 * @property employeeComments - Comentarii optionale ale angajatului
 * @property acknowledgedAt - Data si ora confirmarii
 */
export interface Acknowledgment {
  /** Semnatura angajatului (optional - poate refuza) */
  signature?: Signature
  /** Indica daca angajatul a refuzat sa semneze */
  refusedToSign: boolean
  /** Data si ora refuzului */
  refusedAt?: Date
  /** Numele martorului in caz de refuz */
  refusedWitnessedBy?: string
  /** Comentarii optionale ale angajatului la confirmare */
  employeeComments?: string
  /** Data si ora confirmarii */
  acknowledgedAt?: Date
}

// ============================================================================
// Warning Types (Avertisment)
// ============================================================================

/**
 * Inregistrare completa de avertisment
 * Entitate principala pentru sistemul de disciplina progresiva
 * @property id - Identificator unic (UUID)
 * @property employeeId - ID-ul angajatului avertizat
 * @property employeeName - Numele angajatului (denormalizat pentru afisare)
 * @property managerId - ID-ul managerului care emite avertismentul
 * @property managerName - Numele managerului (denormalizat pentru afisare)
 * @property level - Nivelul de disciplina
 * @property category - Categoria incalcarii
 * @property description - Descrierea detaliata a incidentului
 * @property incidentDate - Data cand s-a produs incidentul
 * @property witness - Numele martorului (optional)
 * @property managerSignature - Semnatura managerului (obligatorie)
 * @property acknowledgment - Confirmarea angajatului (completata cand raspunde)
 * @property status - Statusul curent al avertismentului
 * @property isCleared - Poate fi anulat dupa comportament bun
 * @property clearedAt - Data anularii
 * @property clearedBy - Cine a anulat
 * @property clearedReason - Motivul anularii
 * @property attachments - Referinte la fisiere (pentru WARN-08 - viitor)
 * @property createdAt - Data crearii
 * @property updatedAt - Data ultimei actualizari
 */
export interface Warning {
  /** Identificator unic (UUID) */
  id: string
  /** ID-ul angajatului avertizat */
  employeeId: string
  /** Numele angajatului (denormalizat pentru afisare) */
  employeeName: string
  /** ID-ul managerului care emite avertismentul */
  managerId: string
  /** Numele managerului (denormalizat pentru afisare) */
  managerName: string
  /** Nivelul de disciplina (verbal, scris, final, terminare) */
  level: DisciplineLevel
  /** Categoria incalcarii */
  category: ViolationCategory
  /** Descrierea detaliata a incidentului */
  description: string
  /** Data cand s-a produs incidentul */
  incidentDate: Date
  /** Numele martorului (optional) */
  witness?: string
  /** Semnatura managerului (obligatorie) */
  managerSignature: Signature
  /** Confirmarea angajatului (completata cand raspunde) */
  acknowledgment?: Acknowledgment
  /** Statusul curent al avertismentului */
  status: WarningStatus
  /** Indica daca avertismentul a fost anulat */
  isCleared: boolean
  /** Data anularii */
  clearedAt?: Date
  /** ID-ul celui care a anulat */
  clearedBy?: string
  /** Motivul anularii */
  clearedReason?: string
  /** Referinte la fisiere atasate (pentru WARN-08 - viitor) */
  attachments?: string[]
  /** Data crearii */
  createdAt: Date
  /** Data ultimei actualizari */
  updatedAt: Date
}

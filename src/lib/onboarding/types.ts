/**
 * Tipuri pentru sistemul de onboarding
 * Fundatia pentru wizard-ul de integrare a angajatilor noi
 */

// ============================================================================
// Step Types (Pasii wizard-ului)
// ============================================================================

/**
 * Pasii wizard-ului de onboarding in ordine secventiala
 * nda -> documents -> video -> quiz -> notification -> handoff -> confirmation -> complete
 */
export const ONBOARDING_STEPS = [
  'nda',
  'documents',
  'video',
  'quiz',
  'notification',
  'handoff',
  'confirmation',
  'complete',
] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

/** Etichete pentru afisare in romana */
export const ONBOARDING_STEP_LABELS: Record<OnboardingStep, string> = {
  nda: 'NDA',
  documents: 'Documente',
  video: 'Video',
  quiz: 'Quiz',
  notification: 'Notificare',
  handoff: 'Predare',
  confirmation: 'Confirmare',
  complete: 'Complet',
}

// ============================================================================
// Step Status Types (Status pas)
// ============================================================================

/**
 * Statusul curent al unui pas in wizard
 * locked - pasul nu este inca disponibil (dependinte nesatisfacute)
 * available - pasul poate fi accesat dar nu a fost inceput
 * in_progress - pasul a fost inceput dar nu finalizat
 * completed - pasul a fost finalizat cu succes
 */
export type StepStatus = 'locked' | 'available' | 'in_progress' | 'completed'

// ============================================================================
// NDA Signature Types (Semnatura NDA)
// ============================================================================

/**
 * Semnatura digitala pentru acordul NDA
 * @property signatureDataUrl - Imagine base64 a semnaturii din canvas
 * @property signedAt - Data si ora semnarii
 * @property signedBy - ID-ul utilizatorului care a semnat
 * @property signedByName - Numele complet afisat la momentul semnarii
 * @property pdfDataUrl - PDF generat pentru descarcare (optional)
 */
export interface NdaSignature {
  /** Imagine base64 a semnaturii (data URL din canvas) */
  signatureDataUrl: string
  /** Data si ora semnarii */
  signedAt: Date
  /** ID-ul utilizatorului care a semnat */
  signedBy: string
  /** Numele complet afisat la momentul semnarii */
  signedByName: string
  /** PDF generat pentru descarcare (optional) */
  pdfDataUrl?: string
}

// ============================================================================
// Document Progress Types (Progres documente)
// ============================================================================

/**
 * Progresul citirii unui document de instruire
 * @property documentId - Identificator unic al documentului
 * @property startedAt - Cand a inceput citirea
 * @property completedAt - Cand a finalizat citirea
 * @property timeSpentSeconds - Timp total petrecut citind
 * @property confirmed - Daca angajatul a confirmat ca a citit si inteles
 */
export interface DocumentProgress {
  /** Identificator unic al documentului */
  documentId: string
  /** Data si ora cand a inceput citirea */
  startedAt?: Date
  /** Data si ora cand a finalizat citirea */
  completedAt?: Date
  /** Timp total petrecut citind (secunde) */
  timeSpentSeconds: number
  /** Daca angajatul a confirmat ca a citit si inteles documentul */
  confirmed: boolean
}

// ============================================================================
// Video Progress Types (Progres video)
// ============================================================================

/**
 * Progresul vizualizarii video-ului de training
 * @property startedAt - Cand a inceput vizualizarea
 * @property completedAt - Cand a finalizat vizualizarea
 * @property lastPosition - Pozitia curenta in video (secunde)
 * @property totalDuration - Durata totala a video-ului (secunde)
 * @property furthestReached - Cel mai avansat punct atins (nu poate sari)
 * @property completed - Daca video-ul a fost vizualizat complet
 */
export interface VideoProgress {
  /** Data si ora cand a inceput vizualizarea */
  startedAt?: Date
  /** Data si ora cand a finalizat vizualizarea */
  completedAt?: Date
  /** Pozitia curenta in video (secunde) */
  lastPosition: number
  /** Durata totala a video-ului (secunde) */
  totalDuration: number
  /** Cel mai avansat punct atins - nu poate sari peste acest punct */
  furthestReached: number
  /** Daca video-ul a fost vizualizat complet */
  completed: boolean
}

// ============================================================================
// Quiz Types (Quiz)
// ============================================================================

/**
 * Incercare la quiz-ul de verificare a cunostintelor
 * @property attemptNumber - Numarul incercarii (1, 2, sau 3)
 * @property startedAt - Cand a inceput quiz-ul
 * @property completedAt - Cand a terminat quiz-ul
 * @property answers - Raspunsurile date (questionId -> answer)
 * @property score - Scorul obtinut (procent 0-100)
 * @property passed - Daca a trecut quiz-ul
 */
export interface QuizAttempt {
  /** Numarul incercarii (maxim 3) */
  attemptNumber: number
  /** Data si ora cand a inceput quiz-ul */
  startedAt: Date
  /** Data si ora cand a terminat quiz-ul */
  completedAt?: Date
  /** Raspunsurile date (questionId -> answer sau array pentru multi_select) */
  answers: Record<string, string | string[]>
  /** Scorul obtinut (procent 0-100) */
  score: number
  /** Daca a trecut quiz-ul (scor >= 80%) */
  passed: boolean
}

// ============================================================================
// Physical Handoff Types (Predare fizica)
// ============================================================================

/**
 * Predarea fizica a echipamentelor si cheilor
 * @property markedByManager - Daca managerul a marcat predarea ca efectuata
 * @property managerSignature - Semnatura managerului confirmand predarea
 * @property confirmedByEmployee - Daca angajatul a confirmat primirea
 * @property employeeConfirmedAt - Data si ora confirmarii de catre angajat
 */
export interface PhysicalHandoff {
  /** Daca managerul a marcat predarea echipamentelor ca efectuata */
  markedByManager: boolean
  /** Semnatura managerului confirmand predarea */
  managerSignature?: {
    /** Imagine base64 a semnaturii */
    dataUrl: string
    /** Data si ora semnarii */
    signedAt: Date
    /** ID-ul managerului */
    signedBy: string
    /** Numele managerului */
    signerName: string
  }
  /** Daca angajatul a confirmat primirea echipamentelor */
  confirmedByEmployee: boolean
  /** Data si ora confirmarii de catre angajat */
  employeeConfirmedAt?: Date
}

// ============================================================================
// Onboarding Progress Types (Progres onboarding)
// ============================================================================

/**
 * Progresul complet al unui angajat prin wizard-ul de onboarding
 * @property employeeId - ID-ul angajatului
 * @property employeeName - Numele angajatului pentru afisare
 * @property startedAt - Data cand a inceput procesul
 * @property currentStep - Pasul curent in wizard
 * @property nda - Informatii despre semnarea NDA
 * @property documents - Progresul pentru fiecare document
 * @property video - Progresul vizualizarii video
 * @property quizAttempts - Toate incercarile la quiz
 * @property physicalHandoff - Starea predarii fizice
 * @property completedAt - Data finalizarii complete
 * @property isComplete - Daca tot procesul e complet
 * @property auditLog - Jurnal de activitati pentru conformitate
 */
export interface OnboardingProgress {
  /** ID-ul angajatului in sistem */
  employeeId: string
  /** Numele angajatului pentru afisare */
  employeeName: string
  /** Data si ora cand a inceput procesul de onboarding */
  startedAt: Date
  /** Pasul curent in wizard */
  currentStep: OnboardingStep
  /** Informatii despre semnarea NDA (null daca nu a semnat) */
  nda?: NdaSignature
  /** Progresul pentru fiecare document de citit */
  documents: DocumentProgress[]
  /** Progresul vizualizarii video-ului de training */
  video?: VideoProgress
  /** Toate incercarile la quiz (maxim 3) */
  quizAttempts: QuizAttempt[]
  /** Starea predarii fizice a echipamentelor */
  physicalHandoff?: PhysicalHandoff
  /** Data si ora finalizarii complete a onboarding-ului */
  completedAt?: Date
  /** Daca intregul proces de onboarding este complet */
  isComplete: boolean
  /** Jurnal de activitati pentru conformitate si audit */
  auditLog: OnboardingAuditEntry[]
}

// ============================================================================
// Audit Entry Types (Intrare jurnal audit)
// ============================================================================

/**
 * Intrare in jurnalul de audit pentru activitati onboarding
 * @property id - Identificator unic al intrarii (UUID)
 * @property timestamp - Data si ora actiunii
 * @property step - Pasul la care s-a produs actiunea
 * @property action - Descrierea actiunii efectuate
 * @property performedBy - ID-ul utilizatorului care a efectuat actiunea
 * @property details - Detalii suplimentare despre actiune
 */
export interface OnboardingAuditEntry {
  /** Identificator unic al intrarii (UUID) */
  id: string
  /** Data si ora actiunii */
  timestamp: Date
  /** Pasul la care s-a produs actiunea */
  step: OnboardingStep
  /** Descrierea actiunii efectuate (ex: "NDA semnat", "Document confirmat") */
  action: string
  /** ID-ul utilizatorului care a efectuat actiunea */
  performedBy: string
  /** Detalii suplimentare despre actiune (optional) */
  details?: Record<string, unknown>
}

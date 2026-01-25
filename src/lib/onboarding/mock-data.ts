/**
 * Mock data for onboarding system
 * Provides realistic content for NDA, documents, video, and quiz
 */

import { subDays } from 'date-fns'
import type { OnboardingProgress, DocumentProgress, QuizAttempt, OnboardingAuditEntry } from './types'

// ============================================================================
// NDA Text (Acordul de Confidentialitate)
// ============================================================================

/**
 * Text complet NDA in romana (~500 cuvinte)
 */
export const MOCK_NDA_TEXT = `
ACORD DE CONFIDENTIALITATE SI NEDIVULGARE

Prezentul acord este incheiat intre LaserZone Arena S.R.L. (denumita in continuare "Compania") si angajatul care semneaza acest document (denumit in continuare "Angajatul").

1. OBLIGATII DE CONFIDENTIALITATE

1.1 Angajatul se obliga sa pastreze confidentialitatea tuturor informatiilor la care are acces in cadrul activitatii sale, inclusiv dar fara a se limita la:
- Informatii despre clienti, inclusiv date personale, preferinte si istoricul rezervarilor
- Date financiare ale companiei, inclusiv preturi, costuri si marje de profit
- Strategii de marketing si planuri de afaceri
- Proceduri interne si know-how operational
- Informatii despre echipamente si sisteme tehnice
- Date despre angajati si structura organizationala

1.2 Confidentialitatea se aplica atat informatiilor primite direct, cat si celor observate sau deduse in timpul activitatii.

2. PROTECTIA DATELOR CLIENTILOR

2.1 Angajatul intelege ca datele clientilor sunt protejate de legislatia GDPR si se obliga sa:
- Nu divulge informatii despre clienti tertilor
- Nu fotografieze sau inregistreze clientii fara consimtamant
- Nu acceseze date la care nu are nevoie pentru indeplinirea sarcinilor
- Raporteze imediat orice incident de securitate a datelor

2.2 Incalcarea protectiei datelor poate atrage raspundere civila si penala.

3. UTILIZAREA ECHIPAMENTELOR SI PROPRIETATII

3.1 Echipamentele laser, vestele, computerele si toate bunurile companiei vor fi utilizate exclusiv in scopuri profesionale.

3.2 Angajatul este responsabil pentru echipamentele incredintate si va raporta imediat orice defectiune sau deteriorare.

3.3 Nu este permisa scoaterea echipamentelor din incinta fara aprobare scrisa.

4. DURATA ACORDULUI

4.1 Acest acord intra in vigoare la data semnarii si ramane valabil:
- Pe toata durata contractului de munca
- Timp de 2 (doi) ani dupa incetarea contractului pentru informatiile comerciale
- Nelimitat pentru datele personale ale clientilor

5. CONSECINTELE INCALCARII

5.1 Incalcarea prezentului acord poate duce la:
- Sanctiuni disciplinare, inclusiv desfacerea contractului de munca
- Actiuni in instanta pentru recuperarea prejudiciului
- Raspundere penala in cazurile prevazute de lege

5.2 Compania isi rezerva dreptul de a solicita daune-interese pentru orice prejudiciu cauzat de divulgarea informatiilor confidentiale.

6. DISPOZITII FINALE

6.1 Angajatul declara ca a citit, a inteles si accepta termenii prezentului acord.

6.2 Prezentul acord face parte integranta din contractul individual de munca.

6.3 Orice modificare a prezentului acord va fi facuta in scris si semnata de ambele parti.

Prin semnarea acestui document, confirm ca am citit si inteles toate prevederile de mai sus si ma angajez sa le respect intocmai.
`.trim()

// ============================================================================
// Training Documents (Documente de instruire)
// ============================================================================

export interface TrainingDocument {
  id: string
  title: string
  content: string
  minimumReadingSeconds: number
}

/**
 * Documente de instruire pentru angajati noi
 */
export const MOCK_DOCUMENTS: TrainingDocument[] = [
  {
    id: 'doc-regulament',
    title: 'Regulament Intern',
    minimumReadingSeconds: 60,
    content: `
REGULAMENT INTERN LASERZONE ARENA

1. PROGRAMUL DE LUCRU

1.1 Angajatii vor respecta programul stabilit si vor fi prezenti cu cel putin 15 minute inainte de inceperea turei.

1.2 Orice intarziere sau absenta trebuie comunicata managerului cu cel putin 2 ore inainte.

1.3 Schimbarea turelor intre angajati este permisa doar cu aprobarea prealabila a managerului.

2. TINUTA SI ASPECTUL

2.1 Uniforma completa este obligatorie: tricou cu logo, pantaloni negri, incaltaminte inchisa sport.

2.2 Parul lung va fi prins in timpul serviciului.

2.3 Bijuteriile voluminoase nu sunt permise din motive de siguranta.

3. COMPORTAMENT PROFESIONAL

3.1 Tratati fiecare client cu respect si profesionalism.

3.2 Telefonul personal va fi pastrat in dulap pe durata turei.

3.3 Consumul de alimente este permis doar in pauze, in zona dedicata.

3.4 Fumatul si consumul de alcool sunt strict interzise in incinta.

4. COMUNICAREA INTERNA

4.1 Verificati zilnic grupul de WhatsApp pentru anunturi importante.

4.2 Problemele trebuie raportate imediat managerului de tura.

4.3 Conflictele intre colegi se rezolva prin discutii private, nu in fata clientilor.

5. SECURITATEA LOCULUI DE MUNCA

5.1 Iesirile de urgenta trebuie sa ramana libere in permanenta.

5.2 Orice incident, accident sau situatie periculoasa trebuie raportata imediat.

5.3 Participarea la instructajele periodice de securitate este obligatorie.
`.trim(),
  },
  {
    id: 'doc-siguranta',
    title: 'Proceduri de Siguranta',
    minimumReadingSeconds: 45,
    content: `
PROCEDURI DE SIGURANTA LASERZONE ARENA

1. SIGURANTA GENERALA

1.1 Cunoasterea amplasarii extinctorilor si iesirilor de urgenta este obligatorie.

1.2 In caz de incendiu: alarma, evacuare clienti, apel 112, nu folositi liftul.

1.3 Trusa de prim ajutor se afla la receptie - verificati-o zilnic.

2. SIGURANTA IN ARENA

2.1 Inainte de fiecare sesiune verificati: iluminatul, obstacolele, starea vestelor.

2.2 Limita de participanti: 20 persoane simultan in arena.

2.3 Varsta minima fara insotitor adult: 12 ani.

2.4 Clientii cu probleme de sanatate (epilepsie, probleme cardiace) trebuie sa completeze declaratia.

3. ECHIPAMENTUL LASER

3.1 Armele laser sunt sigure dar nu le indreptati niciodata spre ochi de la distanta mica.

3.2 Vestele trebuie ajustate corect - nu prea stranse, nu prea largi.

3.3 Verificati bateriile inainte de fiecare sesiune.

4. PROCEDURI DE URGENTA

4.1 Buton de panica - opreste toate sistemele instant.

4.2 In caz de accident: opriti jocul, asigurati perimetrul, acordati primul ajutor, anuntati managerul.

4.3 Numere de urgenta afisate la receptie: 112 (urgente), numar manager, numar proprietar.

5. IGIENA SI CURATENIE

5.1 Vestele se dezinfecteaza dupa fiecare utilizare.

5.2 Arena se curata zilnic, dezinfectie completa saptamanal.

5.3 Spalati mainile frecvent, mai ales dupa manipularea echipamentelor.
`.trim(),
  },
  {
    id: 'doc-echipament',
    title: 'Ghid Utilizare Echipament',
    minimumReadingSeconds: 30,
    content: `
GHID UTILIZARE ECHIPAMENT LASERZONE

1. SISTEMUL DE JOCURI

1.1 Pornire sistem: Calculator principal -> Software arena -> Verificare conexiuni.

1.2 Moduri de joc disponibile: Team Deathmatch, Free For All, Capture Point, Zombie Mode.

1.3 Durata standard: 15 minute. Poate fi ajustata 10-20 minute.

2. VESTELE LASER

2.1 Incarcare: Toate vestele in statie dupa fiecare sesiune. LED verde = incarcat complet.

2.2 Pornire: Buton lateral - tine apasat 3 secunde pana clipeste.

2.3 Sincronizare: Automatic la inceputul jocului cand sistemul le detecteaza.

2.4 Probleme frecvente:
   - Nu porneste: Verifica bateria, reseteaza cu butonul mic
   - Nu sincronizeaza: Reporneste vesta, verifica distanta fata de baza

3. ARMELE LASER

3.1 Reincarcarea in joc: Indreapta spre tavan, apasa trigger de 5 ori.

3.2 Curatare: Servetel umed pentru exterior, aer comprimat pentru senzori.

3.3 NU loviti armele de obstacole - sunt sensibile!

4. SISTEMUL AUDIO/VIDEO

4.1 Sonorizare controlata de la pupitru. Nivel recomandat: 60-70%.

4.2 Proiectoare: Se pornesc automat cu sistemul. Curatati lentilele lunar.

5. PROCEDURA INCHIDERE

5.1 Toate vestele pe incarcare.
5.2 Armele in suporturi.
5.3 Oprire software -> Oprire calculatoare.
5.4 Verificare vizuala arena.
5.5 Stingere lumini, incuiere.
`.trim(),
  },
]

// ============================================================================
// Training Video
// ============================================================================

/**
 * URL video de training (placeholder - se va inlocui cu video real)
 */
export const MOCK_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

export interface VideoChapter {
  timestamp: number // secunde
  title: string
}

/**
 * Capitole video de training
 */
export const MOCK_VIDEO_CHAPTERS: VideoChapter[] = [
  { timestamp: 0, title: 'Introducere si prezentare generala' },
  { timestamp: 45, title: 'Proceduri de siguranta obligatorii' },
  { timestamp: 120, title: 'Operarea echipamentului laser' },
  { timestamp: 200, title: 'Interactiunea cu clientii' },
  { timestamp: 280, title: 'Proceduri de urgenta' },
  { timestamp: 350, title: 'Curatenie si inchidere' },
]

// ============================================================================
// Quiz Questions
// ============================================================================

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'multi_select'
  text: string
  options: QuizOption[]
  correctAnswer: string | string[]
}

/**
 * Intrebari quiz pentru verificarea cunostintelor
 */
export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  // Multiple choice (6 intrebari)
  {
    id: 'q1',
    type: 'multiple_choice',
    text: 'Cu cat timp inainte de tura trebuie sa fiti prezent?',
    options: [
      { id: 'q1-a', text: '5 minute' },
      { id: 'q1-b', text: '10 minute' },
      { id: 'q1-c', text: '15 minute' },
      { id: 'q1-d', text: '30 minute' },
    ],
    correctAnswer: 'q1-c',
  },
  {
    id: 'q2',
    type: 'multiple_choice',
    text: 'Care este numarul maxim de participanti permisi simultan in arena?',
    options: [
      { id: 'q2-a', text: '10 persoane' },
      { id: 'q2-b', text: '15 persoane' },
      { id: 'q2-c', text: '20 persoane' },
      { id: 'q2-d', text: '25 persoane' },
    ],
    correctAnswer: 'q2-c',
  },
  {
    id: 'q3',
    type: 'multiple_choice',
    text: 'Cum se reincarca arma laser in timpul jocului?',
    options: [
      { id: 'q3-a', text: 'Apasand butonul de pe vesta' },
      { id: 'q3-b', text: 'Indreptand spre tavan si apasand trigger de 5 ori' },
      { id: 'q3-c', text: 'Asteptand 10 secunde' },
      { id: 'q3-d', text: 'Mergand la punctul de respawn' },
    ],
    correctAnswer: 'q3-b',
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    text: 'Care este varsta minima pentru a participa fara insotitor adult?',
    options: [
      { id: 'q4-a', text: '8 ani' },
      { id: 'q4-b', text: '10 ani' },
      { id: 'q4-c', text: '12 ani' },
      { id: 'q4-d', text: '14 ani' },
    ],
    correctAnswer: 'q4-c',
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    text: 'Ce faceti daca un client raporteaza ca are epilepsie?',
    options: [
      { id: 'q5-a', text: 'Ii permiteti sa joace normal' },
      { id: 'q5-b', text: 'Ii cereti sa completeze declaratia de sanatate' },
      { id: 'q5-c', text: 'Ii refuzati intrarea' },
      { id: 'q5-d', text: 'Chemati ambulanta' },
    ],
    correctAnswer: 'q5-b',
  },
  {
    id: 'q6',
    type: 'multiple_choice',
    text: 'Care este nivelul recomandat pentru sonorizare?',
    options: [
      { id: 'q6-a', text: '40-50%' },
      { id: 'q6-b', text: '60-70%' },
      { id: 'q6-c', text: '80-90%' },
      { id: 'q6-d', text: '100%' },
    ],
    correctAnswer: 'q6-b',
  },

  // True/False (2 intrebari)
  {
    id: 'q7',
    type: 'true_false',
    text: 'Telefonul personal poate fi folosit in timpul programului de lucru atata timp cat nu sunt clienti.',
    options: [
      { id: 'q7-t', text: 'Adevarat' },
      { id: 'q7-f', text: 'Fals' },
    ],
    correctAnswer: 'q7-f',
  },
  {
    id: 'q8',
    type: 'true_false',
    text: 'Acordul de confidentialitate ramane valabil si dupa terminarea contractului de munca.',
    options: [
      { id: 'q8-t', text: 'Adevarat' },
      { id: 'q8-f', text: 'Fals' },
    ],
    correctAnswer: 'q8-t',
  },

  // Multi-select (2 intrebari)
  {
    id: 'q9',
    type: 'multi_select',
    text: 'Care sunt elementele obligatorii ale uniformei? (selectati toate)',
    options: [
      { id: 'q9-a', text: 'Tricou cu logo' },
      { id: 'q9-b', text: 'Pantaloni negri' },
      { id: 'q9-c', text: 'Sapca' },
      { id: 'q9-d', text: 'Incaltaminte inchisa sport' },
    ],
    correctAnswer: ['q9-a', 'q9-b', 'q9-d'],
  },
  {
    id: 'q10',
    type: 'multi_select',
    text: 'Ce verificati inainte de fiecare sesiune de joc? (selectati toate)',
    options: [
      { id: 'q10-a', text: 'Iluminatul' },
      { id: 'q10-b', text: 'Obstacolele' },
      { id: 'q10-c', text: 'Starea vestelor' },
      { id: 'q10-d', text: 'Vremea de afara' },
    ],
    correctAnswer: ['q10-a', 'q10-b', 'q10-c'],
  },
]

// ============================================================================
// Sample Progress Records (for manager dashboard testing)
// ============================================================================

const now = new Date()

/**
 * Progres mock pentru testarea dashboard-ului managerului
 * Referinta user IDs din mock-users.ts:
 * - ID 5: Andrei Marin (isNew: true)
 * - ID 3: Ion Vasile
 * - ID 4: Elena Dumitrescu
 */
export const MOCK_ONBOARDING_PROGRESS: OnboardingProgress[] = [
  // Employee at 'video' step (partially complete)
  {
    employeeId: '5',
    employeeName: 'Andrei Marin',
    startedAt: subDays(now, 3),
    currentStep: 'video',
    nda: {
      signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      signedAt: subDays(now, 3),
      signedBy: '5',
      signedByName: 'Andrei Marin',
    },
    documents: [
      {
        documentId: 'doc-regulament',
        startedAt: subDays(now, 2),
        completedAt: subDays(now, 2),
        timeSpentSeconds: 120,
        confirmed: true,
      },
      {
        documentId: 'doc-siguranta',
        startedAt: subDays(now, 2),
        completedAt: subDays(now, 2),
        timeSpentSeconds: 90,
        confirmed: true,
      },
      {
        documentId: 'doc-echipament',
        startedAt: subDays(now, 2),
        completedAt: subDays(now, 2),
        timeSpentSeconds: 60,
        confirmed: true,
      },
    ],
    video: {
      startedAt: subDays(now, 1),
      lastPosition: 180,
      totalDuration: 420,
      furthestReached: 180,
      completed: false,
    },
    quizAttempts: [],
    isComplete: false,
    auditLog: [
      {
        id: 'audit-001',
        timestamp: subDays(now, 3),
        step: 'nda',
        action: 'Onboarding initializat',
        performedBy: '5',
      },
      {
        id: 'audit-002',
        timestamp: subDays(now, 3),
        step: 'nda',
        action: 'NDA semnat',
        performedBy: '5',
      },
      {
        id: 'audit-003',
        timestamp: subDays(now, 2),
        step: 'documents',
        action: 'Document confirmat: doc-regulament',
        performedBy: '5',
        details: { documentId: 'doc-regulament' },
      },
      {
        id: 'audit-004',
        timestamp: subDays(now, 2),
        step: 'documents',
        action: 'Document confirmat: doc-siguranta',
        performedBy: '5',
        details: { documentId: 'doc-siguranta' },
      },
      {
        id: 'audit-005',
        timestamp: subDays(now, 2),
        step: 'documents',
        action: 'Document confirmat: doc-echipament',
        performedBy: '5',
        details: { documentId: 'doc-echipament' },
      },
    ],
  },

  // Employee at 'handoff' step (waiting for manager)
  {
    employeeId: '6',
    employeeName: 'Cristina Pavel',
    startedAt: subDays(now, 7),
    currentStep: 'handoff',
    nda: {
      signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      signedAt: subDays(now, 7),
      signedBy: '6',
      signedByName: 'Cristina Pavel',
    },
    documents: [
      {
        documentId: 'doc-regulament',
        startedAt: subDays(now, 6),
        completedAt: subDays(now, 6),
        timeSpentSeconds: 150,
        confirmed: true,
      },
      {
        documentId: 'doc-siguranta',
        startedAt: subDays(now, 6),
        completedAt: subDays(now, 6),
        timeSpentSeconds: 100,
        confirmed: true,
      },
      {
        documentId: 'doc-echipament',
        startedAt: subDays(now, 6),
        completedAt: subDays(now, 6),
        timeSpentSeconds: 70,
        confirmed: true,
      },
    ],
    video: {
      startedAt: subDays(now, 5),
      completedAt: subDays(now, 5),
      lastPosition: 420,
      totalDuration: 420,
      furthestReached: 420,
      completed: true,
    },
    quizAttempts: [
      {
        attemptNumber: 1,
        startedAt: subDays(now, 4),
        completedAt: subDays(now, 4),
        answers: {
          q1: 'q1-c',
          q2: 'q2-c',
          q3: 'q3-b',
          q4: 'q4-c',
          q5: 'q5-b',
          q6: 'q6-b',
          q7: 'q7-f',
          q8: 'q8-t',
          q9: ['q9-a', 'q9-b', 'q9-d'],
          q10: ['q10-a', 'q10-b', 'q10-c'],
        },
        score: 90,
        passed: true,
      },
    ],
    physicalHandoff: {
      markedByManager: false,
      confirmedByEmployee: false,
    },
    isComplete: false,
    auditLog: [
      {
        id: 'audit-010',
        timestamp: subDays(now, 7),
        step: 'nda',
        action: 'Onboarding initializat',
        performedBy: '6',
      },
      {
        id: 'audit-011',
        timestamp: subDays(now, 7),
        step: 'nda',
        action: 'NDA semnat',
        performedBy: '6',
      },
      {
        id: 'audit-012',
        timestamp: subDays(now, 5),
        step: 'video',
        action: 'Video de training completat',
        performedBy: '6',
      },
      {
        id: 'audit-013',
        timestamp: subDays(now, 4),
        step: 'quiz',
        action: 'Quiz trecut (90% - incercarea 1)',
        performedBy: '6',
        details: { score: 90, passed: true, attemptNumber: 1 },
      },
    ],
  },

  // Employee fully complete (for comparison)
  {
    employeeId: '3',
    employeeName: 'Ion Vasile',
    startedAt: subDays(now, 30),
    currentStep: 'complete',
    nda: {
      signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      signedAt: subDays(now, 30),
      signedBy: '3',
      signedByName: 'Ion Vasile',
      pdfDataUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
    },
    documents: [
      {
        documentId: 'doc-regulament',
        startedAt: subDays(now, 29),
        completedAt: subDays(now, 29),
        timeSpentSeconds: 180,
        confirmed: true,
      },
      {
        documentId: 'doc-siguranta',
        startedAt: subDays(now, 29),
        completedAt: subDays(now, 29),
        timeSpentSeconds: 120,
        confirmed: true,
      },
      {
        documentId: 'doc-echipament',
        startedAt: subDays(now, 29),
        completedAt: subDays(now, 29),
        timeSpentSeconds: 90,
        confirmed: true,
      },
    ],
    video: {
      startedAt: subDays(now, 28),
      completedAt: subDays(now, 28),
      lastPosition: 420,
      totalDuration: 420,
      furthestReached: 420,
      completed: true,
    },
    quizAttempts: [
      {
        attemptNumber: 1,
        startedAt: subDays(now, 27),
        completedAt: subDays(now, 27),
        answers: {
          q1: 'q1-b', // wrong
          q2: 'q2-c',
          q3: 'q3-a', // wrong
          q4: 'q4-c',
          q5: 'q5-b',
          q6: 'q6-a', // wrong
          q7: 'q7-f',
          q8: 'q8-t',
          q9: ['q9-a', 'q9-b'], // incomplete
          q10: ['q10-a', 'q10-b', 'q10-c'],
        },
        score: 60,
        passed: false,
      },
      {
        attemptNumber: 2,
        startedAt: subDays(now, 26),
        completedAt: subDays(now, 26),
        answers: {
          q1: 'q1-c',
          q2: 'q2-c',
          q3: 'q3-b',
          q4: 'q4-c',
          q5: 'q5-b',
          q6: 'q6-b',
          q7: 'q7-f',
          q8: 'q8-t',
          q9: ['q9-a', 'q9-b', 'q9-d'],
          q10: ['q10-a', 'q10-b', 'q10-c'],
        },
        score: 100,
        passed: true,
      },
    ],
    physicalHandoff: {
      markedByManager: true,
      managerSignature: {
        dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: subDays(now, 25),
        signedBy: '1',
        signerName: 'Alexandru Popescu',
      },
      confirmedByEmployee: true,
      employeeConfirmedAt: subDays(now, 25),
    },
    completedAt: subDays(now, 25),
    isComplete: true,
    auditLog: [
      {
        id: 'audit-020',
        timestamp: subDays(now, 30),
        step: 'nda',
        action: 'Onboarding initializat',
        performedBy: '3',
      },
      {
        id: 'audit-021',
        timestamp: subDays(now, 30),
        step: 'nda',
        action: 'NDA semnat',
        performedBy: '3',
      },
      {
        id: 'audit-022',
        timestamp: subDays(now, 28),
        step: 'video',
        action: 'Video de training completat',
        performedBy: '3',
      },
      {
        id: 'audit-023',
        timestamp: subDays(now, 27),
        step: 'quiz',
        action: 'Quiz nereusit (60% - incercarea 1)',
        performedBy: '3',
        details: { score: 60, passed: false, attemptNumber: 1 },
      },
      {
        id: 'audit-024',
        timestamp: subDays(now, 26),
        step: 'quiz',
        action: 'Quiz trecut (100% - incercarea 2)',
        performedBy: '3',
        details: { score: 100, passed: true, attemptNumber: 2 },
      },
      {
        id: 'audit-025',
        timestamp: subDays(now, 25),
        step: 'handoff',
        action: 'Predare echipamente marcata de manager',
        performedBy: '1',
        details: { managerName: 'Alexandru Popescu' },
      },
      {
        id: 'audit-026',
        timestamp: subDays(now, 25),
        step: 'handoff',
        action: 'Primire echipamente confirmata de angajat',
        performedBy: '3',
      },
      {
        id: 'audit-027',
        timestamp: subDays(now, 25),
        step: 'complete',
        action: 'Onboarding finalizat cu succes',
        performedBy: '3',
      },
    ],
  },
]

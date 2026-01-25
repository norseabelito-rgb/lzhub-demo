/**
 * Sabloane de text pentru avertismente
 * Texte predefinite pentru fiecare categorie de incalcare (WARN-10)
 */

import type { ViolationCategory } from './types'

/**
 * Structura unui sablon de avertisment
 */
export interface WarningTemplate {
  /** Titlul avertismentului */
  title: string
  /** Textul implicit pentru descriere */
  defaultText: string
}

/**
 * Sabloane de avertisment pentru fiecare categorie de incalcare
 * Textele sunt in limba romana si pot fi personalizate de manager
 */
export const WARNING_TEMPLATES: Record<ViolationCategory, WarningTemplate> = {
  tardiness: {
    title: 'Intarziere la serviciu',
    defaultText:
      'Angajatul a intarziat la serviciu fara o justificare acceptabila. ' +
      'Conform regulamentului intern, prezenta la timp este obligatorie pentru ' +
      'buna functionare a echipei si serviciilor oferite clientilor. ' +
      'Se solicita respectarea stricta a programului de lucru stabilit.',
  },
  no_show: {
    title: 'Absenta nemotivata',
    defaultText:
      'Angajatul nu s-a prezentat la serviciu fara a anunta in prealabil si ' +
      'fara a prezenta un motiv justificat. Aceasta absenta a afectat ' +
      'programul de lucru si a creat dificultati in organizarea activitatii. ' +
      'Absenta nemotivata constituie o incalcare grava a obligatiilor de serviciu.',
  },
  policy_violation: {
    title: 'Incalcare politica companiei',
    defaultText:
      'Angajatul a incalcat regulamentul intern sau politicile companiei. ' +
      'Respectarea regulilor stabilite este esentiala pentru mentinerea unui ' +
      'mediu de lucru sigur si profesional. Se solicita familiarizarea cu ' +
      'regulamentul intern si respectarea acestuia in continuare.',
  },
  performance: {
    title: 'Performanta sub asteptari',
    defaultText:
      'Performanta profesionala a angajatului nu corespunde standardelor stabilite. ' +
      'Au fost identificate deficiente in indeplinirea sarcinilor de serviciu. ' +
      'Se solicita imbunatatirea imediata a performantei si atingerea ' +
      'obiectivelor stabilite pentru functia ocupata.',
  },
  insubordination: {
    title: 'Insubordonare',
    defaultText:
      'Angajatul a refuzat sa execute dispozitiile superiorul ierarhic sau ' +
      'a manifestat un comportament necorespunzator fata de conducere. ' +
      'Respectul fata de ierarhia organizationala si executarea sarcinilor ' +
      'primite sunt obligatii fundamentale ale oricarui angajat.',
  },
  safety_violation: {
    title: 'Incalcare norme de siguranta',
    defaultText:
      'Angajatul a incalcat normele de securitate si sanatate in munca. ' +
      'Siguranta la locul de munca este prioritatea numarul unu, iar ' +
      'nerespectarea acestor norme pune in pericol atat angajatul cat si colegii. ' +
      'Se solicita respectarea stricta a tuturor procedurilor de siguranta.',
  },
  customer_complaint: {
    title: 'Plangere client',
    defaultText:
      'A fost inregistrata o plangere din partea unui client cu privire la ' +
      'comportamentul sau serviciile oferite de angajat. Satisfactia clientilor ' +
      'este esentiala pentru succesul afacerii. Se solicita imbunatatirea ' +
      'atitudinii si calitatii serviciilor oferite.',
  },
  cash_handling: {
    title: 'Gestionare incorecta numerar',
    defaultText:
      'Au fost identificate nereguli in gestionarea numerarului sau a tranzactiilor. ' +
      'Integritatea financiara si corectitudinea in operatiunile de casa ' +
      'sunt obligatii fundamentale. Se solicita respectarea stricta a ' +
      'procedurilor de gestionare a numerarului.',
  },
  uniform_appearance: {
    title: 'Tinuta necorespunzatoare',
    defaultText:
      'Angajatul nu a respectat standardele de tinuta si prezentare profesionala ' +
      'stabilite de companie. Uniforma si aspectul fizic sunt importante pentru ' +
      'imaginea companiei si experienta clientilor. Se solicita respectarea ' +
      'codului vestimentar in vigoare.',
  },
  other: {
    title: 'Alt motiv',
    defaultText:
      'Angajatul a savarsit o abatere disciplinara care nu se incadreaza ' +
      'in categoriile standard. Detaliile incidentului sunt descrise mai jos. ' +
      'Se solicita remedierea situatiei si prevenirea repetarii acestor incidente.',
  },
}

/**
 * Obtine sablonul pentru o categorie de incalcare
 * @param category - Categoria incalcarii
 * @returns Sablonul cu titlu si text implicit
 */
export function getTemplateForCategory(category: ViolationCategory): WarningTemplate {
  return WARNING_TEMPLATES[category]
}

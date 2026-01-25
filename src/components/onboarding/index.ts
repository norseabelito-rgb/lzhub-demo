/**
 * Onboarding components barrel exports
 * Central export point for wizard UI components
 */

// Wizard shell and navigation
export { WizardShell, WizardShellWithSteps, useCurrentStep } from './wizard-shell'
export type { WizardShellProps, WizardShellWithStepsProps, StepComponents } from './wizard-shell'

// Progress indicator
export { WizardProgress } from './wizard-progress'
export type { WizardProgressProps } from './wizard-progress'

// Step components
export { StepNda } from './step-nda'
export type { StepNdaProps } from './step-nda'

export { StepDocuments } from './step-documents'
export type { StepDocumentsProps } from './step-documents'

export { StepVideo } from './step-video'
export type { StepVideoProps } from './step-video'

export { StepQuiz } from './step-quiz'
export type { StepQuizProps } from './step-quiz'

export { StepNotification } from './step-notification'
export type { StepNotificationProps } from './step-notification'

export { StepComplete } from './step-complete'
export type { StepCompleteProps } from './step-complete'

// Quiz sub-components
export { QuizQuestion } from './quiz-question'
export type { QuizQuestionProps } from './quiz-question'

export { QuizResults } from './quiz-results'
export type { QuizResultsProps } from './quiz-results'

// Utility components
export { DocumentViewer } from './document-viewer'
export type { DocumentViewerProps } from './document-viewer'

export { OnboardingVideoPlayer } from './video-player'
export type { OnboardingVideoPlayerProps } from './video-player'

// Manager components
export { ManagerDashboard } from './manager-dashboard'
export type { ManagerDashboardProps } from './manager-dashboard'

export { EmployeeStatusCard } from './employee-status-card'

export { PhysicalHandoffForm } from './physical-handoff-form'
export type { PhysicalHandoffFormProps } from './physical-handoff-form'

export { HandoffConfirmation } from './handoff-confirmation'
export type { HandoffConfirmationProps } from './handoff-confirmation'

export type { EmployeeStatusCardProps } from './employee-status-card'

// Access gating
export { OnboardingGuard } from './onboarding-guard'
export type { OnboardingGuardProps } from './onboarding-guard'

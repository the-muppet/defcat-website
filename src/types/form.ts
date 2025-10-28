// types/form.ts

export type SubmissionType = 'deck' | 'roast'

export interface DeckSubmissionFormData {
  submissionType: 'deck'
  patreonUsername: string
  email: string
  discordUsername: string
  mysteryDeck: boolean
  commander?: string
  colorPreference: string
  theme?: string
  bracket: string
  budget: string
  coffee: string
  idealDate?: string
}

export interface RoastSubmissionFormData {
  submissionType: 'roast'
  patreonUsername: string
  email: string
  discordUsername: string
  decklistUrl: string
  roastIntensity: 'mild' | 'medium' | 'spicy'
  focusAreas?: string
}

export type SubmissionFormData = DeckSubmissionFormData | RoastSubmissionFormData

export interface DeckSubmission extends DeckSubmissionFormData {
  id: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  deckListUrl?: string
  notes?: string
}

export interface RoastSubmission extends RoastSubmissionFormData {
  id: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  roastVideoUrl?: string
  notes?: string
}

export interface SubmissionResponse {
  success: boolean
  data?: {
    id: string
    submissionNumber: number
  }
  error?: {
    message: string
    code?: string
  }
}

export interface EmailData {
  to: string
  patreonUsername: string
  submissionNumber: number
  colorPreference: string
  commander?: string
  bracket: string
  mysteryDeck: boolean
}

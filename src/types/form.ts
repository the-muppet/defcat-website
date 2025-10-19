// types/form.ts

export interface DeckSubmissionFormData {
  patreonUsername: string;
  email: string;
  discordUsername: string;
  mysteryDeck: boolean;
  commander?: string;
  colorPreference: string;
  theme?: string;
  bracket: string;
  budget: string;
  coffee: string;
  idealDate?: string;
}

export interface DeckSubmission extends DeckSubmissionFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  deckListUrl?: string;
  notes?: string;
}

export interface SubmissionResponse {
  success: boolean;
  data?: {
    id: string;
    submissionNumber: number;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface EmailData {
  to: string;
  patreonUsername: string;
  submissionNumber: number;
  colorPreference: string;
  commander?: string;
  bracket: string;
  mysteryDeck: boolean;
}


export interface ImageSuggestion {
  label: string;
  prompt: string;
}

export interface C2CResponse {
  isTriggered: boolean;
  reason: string; // Changed from optional to required
  suggestions?: ImageSuggestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: ImageSuggestion[];
  generatedImageUrl?: string;
  isGenerating?: boolean;
}

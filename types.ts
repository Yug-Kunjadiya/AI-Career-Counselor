
export interface ResumeData {
  profileSummary: string;
  skills: string[];
  experienceSummary: string;
  educationLevel: string;
}

export interface CareerSuggestion {
  careerName: string;
  reason: string;
  skillsToDevelop: string[];
  roadmapSteps: string[];
  estimatedDemand?: string; // e.g., "High", "Medium", "Low"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
    
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

export interface ATSScoreResult {
  score: number; // 0-100
  grade: string; // e.g., "A", "B", "C", "D", "F"
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  keywordMatches: number;
  totalKeywords: number;
}

export interface ResumeImprovementTip {
  section: string; // e.g., "Summary", "Experience", "Skills"
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  rewrittenExample?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "2 weeks", "1 month"
  skills: string[];
  resources: string[];
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface CareerRoadmap {
  careerPath: string;
  sixMonthRoadmap: RoadmapMilestone[];
  oneYearRoadmap: RoadmapMilestone[];
  skillGaps: string[];
  estimatedTimeToJob: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string; // e.g., "Technical", "Behavioral", "Situational"
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  timestamp: Date;
  isRecorded: boolean;
  audioUrl?: string;
}

export interface InterviewFeedback {
  questionId: string;
  score: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallFeedback: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currentRole: string;
  targetRole: string;
  resumeFile?: File;
  resumeText: string;
  careerGoals: string[];
  preferredIndustries: string[];
  skillLevel: { [skill: string]: 'beginner' | 'intermediate' | 'advanced' };
}

export interface CareerReport {
  userProfile: UserProfile;
  resumeData: ResumeData;
  atsScore: ATSScoreResult;
  careerSuggestions: CareerSuggestion[];
  roadmap: CareerRoadmap;
  interviewPerformance?: InterviewFeedback[];
  generatedAt: Date;
}

export type PageType = 'resume-analysis' | 'career-roadmap' | 'skill-gap' | 'chat';

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

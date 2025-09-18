import { GoogleGenAI, Chat, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ResumeData, CareerSuggestion, ChatMessage, ATSScoreResult, ResumeImprovementTip, CareerRoadmap, InterviewQuestion, InterviewFeedback, LinkedInProfileAnalysis } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} else {
  console.error("API_KEY for Gemini is not set. AI features will be severely limited or non-functional.");
}

const TEXT_MODEL_NAME = "gemini-2.0-flash-exp"; // or "gemini-1.5-flash-latest" or "gemini-pro"

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192, // Increased for potentially longer outputs for resume/career details
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const parseGeminiJsonResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", e, "Raw response:", responseText, "Attempted to parse:", jsonStr);
    // Fallback: Try to parse even if not fenced, if it looks like JSON
    if ((jsonStr.startsWith('{') && jsonStr.endsWith('}')) || (jsonStr.startsWith('[') && jsonStr.endsWith(']'))) {
        try {
            return JSON.parse(jsonStr) as T;
        } catch (e2) {
             console.error("Fallback JSON parsing also failed:", e2);
        }
    }
    return null;
  }
};

export const extractResumeDetails = async (resumeText: string): Promise<ResumeData | null> => {
  if (!ai) throw new Error("Gemini AI client not initialized. API Key might be missing.");

  const prompt = `
    Analyze the following resume text and extract key information.
    Return ONLY a valid JSON object with the exact following structure:
    {
      "profileSummary": "A brief (2-3 sentences) professional summary of the candidate.",
      "skills": ["skill1", "skill2", "another skill"],
      "experienceSummary": "A concise summary of key roles and responsibilities, highlighting achievements. Focus on the last 10-15 years or most relevant experience.",
      "educationLevel": "The highest level of education achieved (e.g., 'Bachelor of Science in Computer Science', 'MBA', 'High School Diploma')."
    }

    Resume Text:
    ---
    ${resumeText}
    ---

    IMPORTANT RULES FOR THE 'skills' FIELD:
    1. The "skills" field MUST be a JSON array.
    2. Each item in the "skills" array MUST be a string, enclosed in double quotes (e.g., "JavaScript", "Project Management").
    3. Do NOT include any words, phrases, or characters within the skills array that are not part of a valid, double-quoted string.
    4. Ensure all strings in the array are properly separated by commas.
    Example of a CORRECT 'skills' array: ["C++", "Java", "Python", "HTML", "Communication"]
    Example of an INCORRECT 'skills' array (forgot quotes): ["C++", Java, "Python", "HTML", "Communication"]
    Example of an INCORRECT 'skills' array (forgot comma): ["C++", "Java", "Python" "HTML", "Communication"]
    Example of an INCORRECT 'skills' array (extraneous characters): ["C++", "Java", "Python", skill: "HTML", "Communication"]

    Ensure the entire output is a single, valid JSON object. Do not add any text or explanations before or after the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
      // safetySettings, // Safety settings might conflict with responseMimeType: "application/json" in some SDK versions. Test this.
    });
    const parsed = parseGeminiJsonResponse<ResumeData>(response.text);
    if (!parsed) throw new Error("AI returned malformed data for resume details.");
    // Basic validation
    if (typeof parsed.profileSummary !== 'string' ||
        !Array.isArray(parsed.skills) ||
        !parsed.skills.every(s => typeof s === 'string') ||
        typeof parsed.experienceSummary !== 'string' ||
        typeof parsed.educationLevel !== 'string') {
        console.error("Parsed resume data has incorrect types:", parsed);
        throw new Error("AI returned data with incorrect structure for resume details.");
    }
    return parsed;
  } catch (error) {
    console.error("Error extracting resume details from Gemini:", error);
    throw error; // Re-throw the original or a new error to be caught by the caller
  }
};

export const suggestCareers = async (resumeData: ResumeData): Promise<CareerSuggestion[] | null> => {
  if (!ai) throw new Error("Gemini AI client not initialized. API Key might be missing.");

  const prompt = `
    Based on the following candidate profile, suggest 3-4 diverse and suitable career paths.
    For each career path, provide:
    1.  careerName: The name of the career (string).
    2.  reason: A brief explanation (2-3 sentences, string) why this career is a good fit for the candidate's profile.
    3.  skillsToDevelop: An array of 3-5 key skill strings the candidate should focus on developing or strengthening for this career (e.g., ["Skill A", "Skill B"]). Ensure each skill is a double-quoted string.
    4.  roadmapSteps: An array of 3-4 general, actionable step strings to pursue this career path (e.g., ["Acquire certification in X", "Build a portfolio of Y projects"]). Ensure each step is a double-quoted string.
    5.  estimatedDemand: A qualitative assessment of current job market demand (string, e.g., "High", "Medium", "Growing", "Niche").

    Return the suggestions as a JSON array of objects. Each object in the array must strictly follow this structure.
    All string values within the JSON must be enclosed in double quotes. All array elements (skills, steps) must be double-quoted strings.

    Candidate Profile:
    ---
    Profile Summary: ${resumeData.profileSummary}
    Skills: ${resumeData.skills.join(', ')}
    Experience Summary: ${resumeData.experienceSummary}
    Education Level: ${resumeData.educationLevel}
    ---

    Ensure the output is only the JSON array. Do not add any text before or after the JSON.
    Example of one object in the array:
    {
      "careerName": "Data Scientist",
      "reason": "The candidate's analytical skills and experience with Python make them a good fit for data science.",
      "skillsToDevelop": ["Machine Learning", "Statistical Analysis", "Data Visualization", "Big Data Technologies"],
      "roadmapSteps": ["Complete online courses in machine learning.", "Work on projects involving data analysis.", "Network with professionals in the field.", "Prepare a portfolio of data science projects."],
      "estimatedDemand": "High"
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
      // safetySettings,
    });
    const parsed = parseGeminiJsonResponse<CareerSuggestion[]>(response.text);
     if (!parsed) throw new Error("AI returned malformed data for career suggestions.");
     // Basic validation for career suggestions
     if (!Array.isArray(parsed) || !parsed.every(suggestion =>
         typeof suggestion.careerName === 'string' &&
         typeof suggestion.reason === 'string' &&
         Array.isArray(suggestion.skillsToDevelop) && suggestion.skillsToDevelop.every(s => typeof s === 'string') &&
         Array.isArray(suggestion.roadmapSteps) && suggestion.roadmapSteps.every(s => typeof s === 'string') &&
         (suggestion.estimatedDemand === undefined || typeof suggestion.estimatedDemand === 'string')
     )) {
        console.error("Parsed career suggestions have incorrect types or structure:", parsed);
        throw new Error("AI returned data with incorrect structure for career suggestions.");
     }
    return parsed;
  } catch (error) {
    console.error("Error suggesting careers from Gemini:", error);
    throw error;
  }
};

let chatInstance: Chat | null = null;

export const initializeChat = async (userName?: string): Promise<void> => {
  if (!ai) {
    console.warn("Cannot initialize chat: Gemini AI client not available.");
    return;
  }
  if (chatInstance) return; // Already initialized

  const systemInstructionParts = [
    "You are 'CareerBot', a friendly, empathetic, and highly knowledgeable AI Career Counselor.",
    "Your goal is to provide personalized career guidance, advice on skill development, job searching strategies, and insights into various industries.",
    "Be encouraging and professional. Offer actionable advice.",
    "You can use markdown for formatting lists, bolding, etc., to improve readability.",
    "IMPORTANT: When user-specific information (like from a resume: skills, experience, education) is explicitly provided as context within their message/prompt, you MUST prioritize using this information to tailor your response accurately. Acknowledge and refer to this provided data when answering related questions. This contextual information is key to providing personalized advice.",
    "Do not make up information if you don't know the answer; suggest ways the user might find it instead.",
    "Keep responses generally concise but informative."
  ];
  if (userName) {
    systemInstructionParts.push(`The user's name is ${userName}. Address them by it occasionally if natural.`);
  }

  const systemInstruction = systemInstructionParts.join('\n');

  try {
    chatInstance = ai.chats.create({
      model: TEXT_MODEL_NAME,
      config: {
        systemInstruction,
        temperature: 0.75, // Slightly more creative for chat
        topP: 0.95,
        topK: 40,
      },
      // safetySettings, // Commented out as it may not be supported in current SDK version
      // History will be managed by the chatInstance internally
    });
    console.log("AI Chat initialized.");
  } catch (error) {
    console.error("Failed to initialize AI chat instance:", error);
    chatInstance = null; // Ensure it's null if initialization fails
  }
};


export const sendMessageToAIChatUpdated = async (message: string): Promise<string | null> => {
  if (!GEMINI_API_KEY || !ai) { // Check API_KEY again as 'ai' could be null if key was missing initially
    console.error("sendMessageToAIChatUpdated: API Key missing or AI client not initialized.");
    return "I'm sorry, but I'm unable to connect to my knowledge base right now due to a configuration issue (API Key missing). Please try again later or inform the site administrator.";
  }

  if (!chatInstance) {
    await initializeChat(); // Attempt to initialize if not already
    if (!chatInstance) { // Check again
        console.error("Chat not initialized and failed to initialize on demand.");
        return "Error: The AI chat service is currently unavailable. Please try again shortly.";
    }
  }

  try {
    // The chatInstance internally manages history.
    const response: GenerateContentResponse = await chatInstance.sendMessage({ message });
    return response.text || null;
  } catch (error) {
    console.error("Error sending message to AI chat:", error);
    // Check for specific error types if possible, e.g., API key errors.
    if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('PERMISSION_DENIED')) {
             return "There seems to be an issue with the AI service configuration (e.g. API key). Please contact support.";
        }
         return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
    return "Sorry, I encountered an unexpected error. Please try again.";
  }
};

// New AI functions for additional features

export const analyzeATSScore = async (resumeText: string, targetJob?: string): Promise<ATSScoreResult | null> => {
  if (!ai) throw new Error("Gemini AI client not initialized. API Key might be missing.");

  const prompt = `
    Analyze the following resume text for Applicant Tracking System (ATS) compatibility.
    ${targetJob ? `Target job/role: ${targetJob}` : 'General ATS analysis'}

    Return ONLY a valid JSON object with the exact following structure:
    {
      "score": 85,
      "grade": "B",
      "strengths": ["Clear contact information", "Quantified achievements"],
      "weaknesses": ["Missing keywords", "Generic descriptions"],
      "improvementSuggestions": ["Add industry-specific keywords", "Use standard section headings"],
      "keywordMatches": 12,
      "totalKeywords": 15
    }

    Resume Text:
    ---
    ${resumeText}
    ---

    Scoring criteria:
    - Score: 0-100 based on ATS compatibility
    - Grade: A (90-100), B (80-89), C (70-79), D (60-69), F (0-59)
    - Strengths: 3-5 specific strengths
    - Weaknesses: 3-5 specific weaknesses
    - Improvement suggestions: 4-6 actionable suggestions
    - Keyword matches: Number of relevant keywords found
    - Total keywords: Total relevant keywords expected for the field

    Ensure the entire output is a single, valid JSON object. Do not add any text or explanations before or after the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
    });
    const parsed = parseGeminiJsonResponse<ATSScoreResult>(response.text);
    if (!parsed) throw new Error("AI returned malformed data for ATS score.");
    // Basic validation
    if (typeof parsed.score !== 'number' ||
        typeof parsed.grade !== 'string' ||
        !Array.isArray(parsed.strengths) ||
        !Array.isArray(parsed.weaknesses) ||
        !Array.isArray(parsed.improvementSuggestions) ||
        typeof parsed.keywordMatches !== 'number' ||
        typeof parsed.totalKeywords !== 'number') {
        console.error("Parsed ATS score data has incorrect types:", parsed);
        throw new Error("AI returned data with incorrect structure for ATS score.");
    }
    return parsed;
  } catch (error) {
    console.error("Error analyzing ATS score from Gemini:", error);
    throw error;
  }
};

export const getResumeImprovementTips = async (resumeText: string): Promise<ResumeImprovementTip[] | null> => {
  if (!ai) throw new Error("Gemini AI client not initialized. API Key might be missing.");

  const prompt = `
    Analyze the following resume text and provide specific improvement tips.
    Focus on common resume issues and provide actionable suggestions.

    Return ONLY a valid JSON array of objects with the exact following structure:
    [
      {
        "section": "Summary",
        "issue": "Too generic and lacks specific achievements",
        "severity": "high",
        "suggestion": "Replace generic statements with specific accomplishments and metrics",
        "rewrittenExample": "Results-driven software engineer with 5+ years of experience developing scalable web applications, increasing user engagement by 40% through optimized performance."
      }
    ]

    Resume Text:
    ---
    ${resumeText}
    ---

    For each tip:
    - section: The resume section (Summary, Experience, Skills, Education, etc.)
    - issue: Specific problem identified
    - severity: "low", "medium", or "high"
    - suggestion: Actionable advice
    - rewrittenExample: Optional rewritten version of the problematic section

    Provide 5-8 improvement tips covering different sections.
    Ensure the output is only the JSON array. Do not add any text before or after the JSON.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
    });
    const parsed = parseGeminiJsonResponse<ResumeImprovementTip[]>(response.text);
    if (!parsed) throw new Error("AI returned malformed data for resume improvement tips.");
    // Basic validation
    if (!Array.isArray(parsed) || !parsed.every(tip =>
        typeof tip.section === 'string' &&
        typeof tip.issue === 'string' &&
        ['low', 'medium', 'high'].includes(tip.severity) &&
        typeof tip.suggestion === 'string' &&
        (tip.rewrittenExample === undefined || typeof tip.rewrittenExample === 'string')
    )) {
        console.error("Parsed resume improvement tips have incorrect types:", parsed);
        throw new Error("AI returned data with incorrect structure for resume improvement tips.");
    }
    return parsed;
  } catch (error) {
    console.error("Error getting resume improvement tips from Gemini:", error);
    throw error;
  }
};

export const generateCareerRoadmap = async (resumeData: ResumeData, targetCareer: string): Promise<CareerRoadmap | null> => {
  if (!ai) throw new Error("Gemini AI client not initialized. API Key might be missing.");

  const prompt = `
    Create a detailed career roadmap for transitioning to or advancing in: ${targetCareer}

    Based on the candidate's profile, generate a comprehensive roadmap with milestones.

    Return ONLY a valid JSON object with the exact following structure:
    {
      "careerPath": "Software Engineering",
      "sixMonthRoadmap": [
        {
          "id": "skill-building-1",
          "title": "Master JavaScript Fundamentals",
          "description": "Deepen understanding of ES6+, async programming, and modern frameworks",
          "duration": "8 weeks",
          "skills": ["JavaScript", "ES6+", "Async/Await"],
          "resources": ["MDN Web Docs", "JavaScript.info", "freeCodeCamp"],
          "completed": false,
          "priority": "high"
        }
      ],
      "oneYearRoadmap": [
        {
          "id": "project-1",
          "title": "Build Portfolio Projects",
          "description": "Create 3-5 substantial projects demonstrating key skills",
          "duration": "6 months",
          "skills": ["React", "Node.js", "Database Design"],
          "resources": ["GitHub", "Personal website", "Open source contributions"],
          "completed": false,
          "priority": "high"
        }
      ],
      "skillGaps": ["System Design", "Cloud Architecture", "Leadership"],
      "estimatedTimeToJob": "6-9 months"
    }

    Candidate Profile:
    ---
    Profile Summary: ${resumeData.profileSummary}
    Skills: ${resumeData.skills.join(', ')}
    Experience Summary: ${resumeData.experienceSummary}
    Education Level: ${resumeData.educationLevel}
    ---

    Guidelines:
    - sixMonthRoadmap: 4-6 milestones for the first 6 months
    - oneYearRoadmap: 6-8 milestones for the full year
    - Each milestone should have unique id, realistic duration, relevant skills and resources
    - skillGaps: 3-5 key skills the candidate needs to develop
    - estimatedTimeToJob: Realistic timeline based on their background

    Ensure the entire output is a single, valid JSON object. Do not add any text or explanations before or after the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
    });
    const parsed = parseGeminiJsonResponse<CareerRoadmap>(response.text);
    if (!parsed) throw new Error("AI returned malformed data for career roadmap.");
    // Basic validation
    if (typeof parsed.careerPath !== 'string' ||
        !Array.isArray(parsed.sixMonthRoadmap) ||
        !Array.isArray(parsed.oneYearRoadmap) ||
        !Array.isArray(parsed.skillGaps) ||
        typeof parsed.estimatedTimeToJob !== 'string') {
        console.error("Parsed career roadmap has incorrect types:", parsed);
        throw new Error("AI returned data with incorrect structure for career roadmap.");
    }
    return parsed;
  } catch (error) {
    console.error("Error generating career roadmap from Gemini:", error);
    throw error;
  }
};

export const generateInterviewQuestions = async (resumeData: ResumeData, targetCareer: string): Promise<InterviewQuestion[] | null> => {
  if (!ai) throw new Error("Gemini AI client not initialized. API Key might be missing.");

  const prompt = `
    Generate personalized interview questions for: ${targetCareer}

    Based on the candidate's resume, create relevant interview questions they might encounter.

    Return ONLY a valid JSON array of objects with the exact following structure:
    [
      {
        "id": "tech-1",
        "question": "Can you explain the difference between var, let, and const in JavaScript?",
        "category": "Technical",
        "difficulty": "easy",
        "expectedAnswer": "var is function-scoped, let and const are block-scoped. const cannot be reassigned."
      }
    ]

    Candidate Profile:
    ---
    Profile Summary: ${resumeData.profileSummary}
    Skills: ${resumeData.skills.join(', ')}
    Experience Summary: ${resumeData.experienceSummary}
    Education Level: ${resumeData.educationLevel}
    ---

    Guidelines:
    - Generate 10-15 questions total
    - Mix of categories: Technical, Behavioral, Situational
    - Difficulty levels: easy, medium, hard
    - Questions should be relevant to their experience and target career
    - Include expectedAnswer for some questions (optional)

    Ensure the output is only the JSON array. Do not add any text before or after the JSON.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
    });
    const parsed = parseGeminiJsonResponse<InterviewQuestion[]>(response.text);
    if (!parsed) throw new Error("AI returned malformed data for interview questions.");
    // Basic validation
    if (!Array.isArray(parsed) || !parsed.every(question =>
        typeof question.id === 'string' &&
        typeof question.question === 'string' &&
        typeof question.category === 'string' &&
        ['easy', 'medium', 'hard'].includes(question.difficulty) &&
        (question.expectedAnswer === undefined || typeof question.expectedAnswer === 'string')
    )) {
        console.error("Parsed interview questions have incorrect types:", parsed);
        throw new Error("AI returned data with incorrect structure for interview questions.");
    }
    return parsed;
  } catch (error) {
    console.error("Error generating interview questions from Gemini:", error);
    throw error;
  }
};

export const analyzeInterviewAnswer = async (question: string, answer: string, category: string): Promise<InterviewFeedback | null> => {
  if (!ai) throw new Error("Gemini AI client not initialized. API Key might be missing.");

  const prompt = `
    Analyze the following interview answer and provide detailed feedback.

    Question: ${question}
    Category: ${category}
    Answer: ${answer}

    Return ONLY a valid JSON object with the exact following structure:
    {
      "questionId": "tech-1",
      "score": 8,
      "strengths": ["Clear explanation", "Used specific examples"],
      "weaknesses": ["Could be more concise", "Missed key technical detail"],
      "suggestions": ["Practice explaining concepts more succinctly", "Include code examples when relevant"],
      "overallFeedback": "Good answer overall. Shows solid understanding but could benefit from more structure."
    }

    Scoring criteria:
    - score: 1-10 (10 being excellent)
    - strengths: 2-4 specific positive aspects
    - weaknesses: 1-3 areas for improvement
    - suggestions: 2-4 actionable improvement tips
    - overallFeedback: 2-3 sentence summary

    Ensure the entire output is a single, valid JSON object. Do not add any text or explanations before or after the JSON object.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
    });
    const parsed = parseGeminiJsonResponse<InterviewFeedback>(response.text);
    if (!parsed) throw new Error("AI returned malformed data for interview feedback.");
    // Basic validation
    if (typeof parsed.questionId !== 'string' ||
        typeof parsed.score !== 'number' ||
        !Array.isArray(parsed.strengths) ||
        !Array.isArray(parsed.weaknesses) ||
        !Array.isArray(parsed.suggestions) ||
        typeof parsed.overallFeedback !== 'string') {
        console.error("Parsed interview feedback has incorrect types:", parsed);
        throw new Error("AI returned data with incorrect structure for interview feedback.");
    }
    return parsed;
  } catch (error) {
    console.error("Error analyzing interview answer from Gemini:", error);
    throw error;
  }
};

export const analyzeLinkedInProfile = async (profileText: string): Promise<LinkedInProfileAnalysis | null> => {
  if (!ai) {
    console.error("Gemini AI is not initialized. Cannot analyze LinkedIn profile.");
    return null;
  }

  const prompt = `
    Analyze the following LinkedIn profile text and provide a comprehensive analysis with improvement suggestions.
    
    LinkedIn Profile Text:
    ${profileText}
    
    Please analyze and provide a JSON response with the following structure:
    {
      "overallScore": number (0-100),
      "grade": string (A, B, C, D, or F),
      "sections": {
        "headline": {
          "score": number (0-100),
          "current": string,
          "suggestions": [string array of 3-5 suggestions]
        },
        "summary": {
          "score": number (0-100),
          "current": string,
          "suggestions": [string array of 3-5 suggestions]
        },
        "experience": {
          "score": number (0-100),
          "issues": [string array of identified issues],
          "suggestions": [string array of 3-5 suggestions]
        },
        "skills": {
          "score": number (0-100),
          "missing": [string array of missing important skills],
          "suggestions": [string array of 3-5 suggestions]
        },
        "education": {
          "score": number (0-100),
          "suggestions": [string array of 3-5 suggestions]
        }
      },
      "keywordOptimization": {
        "industryKeywords": [string array of relevant industry keywords found],
        "missingKeywords": [string array of important missing keywords],
        "keywordDensity": number (percentage)
      },
      "improvementSteps": [
        {
          "priority": "high" | "medium" | "low",
          "section": string,
          "action": string (detailed action to take),
          "impact": string (expected impact),
          "timeToComplete": string (estimated time)
        }
      ]
    }
    
    Focus on:
    1. Professional headline optimization
    2. Summary/about section effectiveness
    3. Work experience descriptions and achievements
    4. Skills section completeness and relevance
    5. Education section optimization
    6. Industry keyword usage and SEO
    7. Overall profile completeness and professional appeal
    
    Provide actionable, specific suggestions that will improve profile visibility and professional appeal.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: { ...generationConfig, responseMimeType: "application/json" },
    });
    const text = response.text;

    if (!text) {
      console.error("Empty response from Gemini for LinkedIn profile analysis");
      return null;
    }

    const analysis = parseGeminiJsonResponse<LinkedInProfileAnalysis>(text);
    
    if (!analysis) {
      console.error("Failed to parse LinkedIn profile analysis from Gemini response:", text);
      return null;
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing LinkedIn profile from Gemini:", error);
    throw error;
  }
};

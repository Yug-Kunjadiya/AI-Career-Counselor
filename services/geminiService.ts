
import { GoogleGenAI, Chat, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ResumeData, CareerSuggestion } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey:'AIzaSyBpPqF-iWRREqoQAnx1QRLzg210JanCB7s' });
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
      safetySettings,
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
    return response.text;
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

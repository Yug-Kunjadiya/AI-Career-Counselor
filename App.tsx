
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResumeData, CareerSuggestion, ChatMessage } from './types';
import ResumeInput from './components/ResumeInput';
import CareerSuggestionsDisplay from './components/CareerSuggestionsDisplay';
import AIChat from './components/AIChat';
import { extractResumeDetails, suggestCareers, initializeChat, sendMessageToAIChatUpdated } from './services/geminiService';
import { BriefcaseIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, LightBulbIcon, WarningTriangleIcon } from './components/icons';

const App: React.FC = () => {
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [resumeText, setResumeText] = useState<string>('');
  const [parsedResumeData, setParsedResumeData] = useState<ResumeData | null>(null);
  const [careerSuggestions, setCareerSuggestions] = useState<CareerSuggestion[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  const [errorResume, setErrorResume] = useState<string | null>(null);
  const [errorSuggestions, setErrorSuggestions] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      console.warn("Gemini API Key (process.env.API_KEY) is not set. AI features will not work.");
    } else {
      initializeChat(); 
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleAnalyzeResume = useCallback(async () => {
    if (!resumeText.trim()) {
      setErrorResume("Please paste your resume text first.");
      return;
    }
    if (apiKeyMissing) {
        setErrorResume("API Key is missing. Cannot analyze resume.");
        return;
    }

    setIsLoadingResume(true);
    setErrorResume(null);
    setParsedResumeData(null);
    setCareerSuggestions([]); // Clear previous suggestions

    try {
      const data = await extractResumeDetails(resumeText);
      if (data) {
        setParsedResumeData(data);
        // Automatically fetch suggestions after parsing
        await handleGetCareerSuggestions(data);
      } else {
        setErrorResume("Could not extract details from resume. The AI might have had trouble understanding the format or content.");
      }
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setErrorResume(`Failed to analyze resume. ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingResume(false);
    }
  }, [resumeText, apiKeyMissing]);

  const handleGetCareerSuggestions = useCallback(async (currentResumeData: ResumeData) => {
    if (apiKeyMissing) {
        setErrorSuggestions("API Key is missing. Cannot fetch suggestions.");
        return;
    }
    setIsLoadingSuggestions(true);
    setErrorSuggestions(null);
    try {
      const suggestions = await suggestCareers(currentResumeData);
      if (suggestions) {
        setCareerSuggestions(suggestions);
      } else {
        setErrorSuggestions("Could not get career suggestions. The AI might have had trouble generating them based on your profile.");
      }
    } catch (err) {
      console.error("Error getting career suggestions:", err);
      setErrorSuggestions(`Failed to get career suggestions. ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [apiKeyMissing]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;
     if (apiKeyMissing) {
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: "I apologize, but I can't respond. The API Key for the AI service is missing.",
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, aiMessage]);
        return;
    }

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsLoadingChat(true);

    try {
      let promptForAI = messageText;
      if (parsedResumeData) {
        const resumeContext = `
Context: The following information is from my (the user's) resume. Please use it to answer my question accurately.
--- My Resume Information ---
Profile Summary: ${parsedResumeData.profileSummary || "Not specified."}
Skills: ${parsedResumeData.skills.length > 0 ? parsedResumeData.skills.join(', ') : "Not specified."}
Experience Summary: ${parsedResumeData.experienceSummary || "Not specified."}
Education Level: ${parsedResumeData.educationLevel || "Not specified."}
--- End of Resume Information ---

My Question: ${messageText}`;
        promptForAI = resumeContext;
      }
      
      const aiResponseText = await sendMessageToAIChatUpdated(promptForAI);
      
      if (aiResponseText) {
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Received an empty response from AI.");
      }
    } catch (err) {
      console.error("Error sending message to AI chat:", err);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: `Sorry, I encountered an error. ${err instanceof Error ? err.message : 'Please try again.'}`,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  }, [apiKeyMissing, parsedResumeData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-secondary-dark text-neutral-light flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          AI Career Counselor
        </h1>
        <p className="text-lg text-primary-light mt-2">
          Your intelligent guide to a brighter professional future.
        </p>
      </header>

      {apiKeyMissing && (
        <div className="w-full max-w-3xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-lg" role="alert">
          <div className="flex">
            <div className="py-1"><WarningTriangleIcon className="h-6 w-6 text-red-500 mr-3" /></div>
            <div>
              <p className="font-bold">API Key Missing</p>
              <p className="text-sm">The Gemini API Key (<code>API_KEY</code>) is not configured. AI-powered features will not be available. Please ensure it is set in your environment.</p>
            </div>
          </div>
        </div>
      )}

      <main className="w-full max-w-5xl space-y-8">
        {/* Resume Input Section */}
        <section id="resume-input" className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-neutral-dark">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-2xl font-semibold text-primary-dark">1. Analyze Your Resume</h2>
          </div>
          <ResumeInput
            resumeText={resumeText}
            setResumeText={setResumeText}
            onAnalyze={handleAnalyzeResume}
            isLoading={isLoadingResume}
            error={errorResume}
          />
          {isLoadingResume && <p className="text-primary mt-2">Analyzing your resume with AI...</p>}
          {parsedResumeData && !isLoadingResume && (
            <div className="mt-6 p-4 bg-primary-light/10 rounded-lg border border-primary-light">
              <h3 className="text-xl font-semibold text-primary-dark mb-2">Resume Snapshot:</h3>
              <p><strong>Summary:</strong> {parsedResumeData.profileSummary}</p>
              <p><strong>Skills:</strong> {parsedResumeData.skills.join(', ')}</p>
              <p><strong>Experience:</strong> {parsedResumeData.experienceSummary}</p>
              <p><strong>Education:</strong> {parsedResumeData.educationLevel}</p>
            </div>
          )}
        </section>

        {/* Career Suggestions Section - Conditionally render after resume analysis */}
        {(parsedResumeData || isLoadingSuggestions || errorSuggestions) && (
        <section id="career-suggestions" className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-neutral-dark">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-8 w-8 text-secondary mr-3" />
            <h2 className="text-2xl font-semibold text-secondary-dark">2. Explore Career Paths</h2>
          </div>
          {isLoadingSuggestions && <p className="text-secondary mt-2">Generating career suggestions based on your profile...</p>}
          <CareerSuggestionsDisplay
            suggestions={careerSuggestions}
            isLoading={isLoadingSuggestions}
            error={errorSuggestions}
          />
        </section>
        )}

        {/* AI Chat Section */}
        <section id="ai-chat" className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-neutral-dark">
           <div className="flex items-center mb-4">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-accent mr-3" />
            <h2 className="text-2xl font-semibold text-accent-dark">3. Chat with Your AI Counselor</h2>
          </div>
          <AIChat
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isLoadingChat}
            chatContainerRef={chatContainerRef}
          />
        </section>
      </main>

      <footer className="w-full max-w-5xl mt-12 text-center text-neutral-light/70">
        <p>&copy; {new Date().getFullYear()} AI Career Counselor. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;

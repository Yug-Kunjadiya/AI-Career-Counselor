import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResumeData, CareerSuggestion, ChatMessage } from './types';
import LandingPage from './components/LandingPage';
import ResumeInput from './components/ResumeInput';
import CareerSuggestionsDisplay from './components/CareerSuggestionsDisplay';
import ProfileBooster from './components/ProfileBooster';
import AIChat from './components/AIChat';
import Sidebar from './components/Sidebar';
import CareerRoadmap from './components/CareerRoadmap';
import ATSScore from './components/ATSScore';
import ResumeImprovementTips from './components/ResumeImprovementTips';
import InterviewResponseBuilder from './components/InterviewResponseBuilder';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { extractResumeDetails, suggestCareers, initializeChat, sendMessageToAIChatUpdated } from './services/geminiService';
import { ChatBubbleLeftRightIcon, DocumentTextIcon, LightBulbIcon, WarningTriangleIcon, PlayIcon } from './components/icons';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('resume-analysis');
  const [resumeText, setResumeText] = useState<string>('');
  const [parsedResumeData, setParsedResumeData] = useState<ResumeData | null>(null);
  const [careerSuggestions, setCareerSuggestions] = useState<CareerSuggestion[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  const [errorResume, setErrorResume] = useState<string | null>(null);
  const [errorSuggestions, setErrorSuggestions] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState<number>(0);

  const chatContainerRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      console.warn("Gemini API Key (process.env.API_KEY) is not set. AI features will not work.");
    } else {
      initializeChat();
    }

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    setCareerSuggestions([]);

    try {
      const data = await extractResumeDetails(resumeText);
      if (data) {
        setParsedResumeData(data);
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
      } else {
  promptForAI = `You are a career counselor AI. Please only answer questions related to career advice, job searching, resume building, interview preparation, and professional development. If asked about anything else, politely redirect the conversation back to career-related topics.

My Question: ${messageText}`;
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'resume-analysis':
        return (
          <div className="space-y-8">
            <section className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-neutral-dark">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-2xl font-semibold text-primary-dark">Resume Analysis</h2>
              </div>
              <ResumeInput
                resumeText={resumeText}
                setResumeText={setResumeText}
                onAnalyze={handleAnalyzeResume}
                isLoading={isLoadingResume}
                error={errorResume}
                onBackToDashboard={() => setShowLanding(true)}
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

            {(parsedResumeData || isLoadingSuggestions || errorSuggestions) && (
            <section className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-neutral-dark">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-8 w-8 text-secondary mr-3" />
                <h2 className="text-2xl font-semibold text-secondary-dark">Career Suggestions</h2>
              </div>
              {isLoadingSuggestions && <p className="text-secondary mt-2">Generating career suggestions based on your profile...</p>}
              <CareerSuggestionsDisplay
                suggestions={careerSuggestions}
                isLoading={isLoadingSuggestions}
                error={errorSuggestions}
              />
            </section>
            )}
          </div>
        );

      case 'career-roadmap':
        return <CareerRoadmap resumeData={parsedResumeData} />;

      case 'skill-gap':
        return (
          <div className="space-y-6">
            <ATSScore resumeText={resumeText} />
            <ResumeImprovementTips resumeText={resumeText} />
          </div>
        );

      case 'profile-booster':
        return <ProfileBooster />;

      case 'interview-game':
        return (
          <section>
            <div className="flex items-center mb-6">
              <PlayIcon className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-semibold text-primary-dark">Interview Response Builder</h2>
            </div>
            <InterviewResponseBuilder />
          </section>
        );

      case 'chat':
        return (
          <section className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-neutral-dark">
             <div className="flex items-center mb-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-accent mr-3" />
              <h2 className="text-2xl font-semibold text-accent-dark">Chat with Your AI Counselor</h2>
            </div>
            <AIChat
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingChat}
              chatContainerRef={chatContainerRef}
            />
          </section>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  // Show landing page first
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen theme-bg-primary flex transition-all duration-300">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col">
        <header 
          className="fixed top-0 left-64 right-0 z-30 theme-bg-surface theme-shadow-lg transition-all duration-300"
          style={{
            backdropFilter: scrollY > 50 ? 'blur(20px)' : 'blur(10px)',
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: scrollY > 50 ? theme.colors.surface + 'E6' : theme.colors.surface,
          }}
        >
          <div className="flex flex-col items-center relative">
            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold theme-text-primary drop-shadow-lg leading-tight">
              AI Career Counselor
            </h1>
            <p className="text-base md:text-lg theme-text-secondary mt-3 max-w-xl">
              Your intelligent guide to a brighter professional future.
            </p>
          </div>
        </header>

        {apiKeyMissing && (
          <div className="mx-6 mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-lg" role="alert">
            <div className="flex">
              <div className="py-1"><WarningTriangleIcon className="h-6 w-6 text-red-500 mr-3" /></div>
              <div>
                <p className="font-bold">API Key Missing</p>
                <p className="text-sm">The Gemini API Key (<code>API_KEY</code>) is not configured. AI-powered features will not be available. Please ensure it is set in your environment.</p>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 pt-40">
          <div className="transition-all duration-500 ease-in-out transform animate-fade-in">
            {renderCurrentPage()}
          </div>
        </main>

        <footer className="w-full p-6 text-center theme-bg-secondary theme-text-secondary transition-all duration-300">
          <p>&copy; {new Date().getFullYear()} AI Career Counselor. Powered by YUG KUNJADIYA.</p>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

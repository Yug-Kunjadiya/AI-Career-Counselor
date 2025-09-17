import React, { useState, useRef, ReactFormEvent } from 'react';
import { BotIcon, UserCircleIcon, LoadingSpinner, PaperAirplaneIcon } from './icons'; // Adjust import paths as needed

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface AIChatProps {
  chatHistory: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const AIChat: React.FC<AIChatProps> = ({ chatHistory, isLoading, onSendMessage, chatContainerRef }) => {
  // Helper to render bot answers with bullet points and short paragraphs, no markdown
  function renderBotPlainText(text: string) {
    // Remove markdown formatting
    const cleanText = text.replace(/[*_`#>\-]/g, '');
    // Split into lines
    const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== '');
    // Bullet list detection
    const bulletRegex = /^\s*(\d+\.)|^\s*[\-\*\•]/;
    const isBulletList = lines.length > 1 && lines.every(line => bulletRegex.test(line) || line.trim().length < 60);
    if (isBulletList) {
      return (
        <ul className="list-disc pl-5 text-sm">
          {lines.map((line, idx) => <li key={idx}>{line.trim()}</li>)}
        </ul>
      );
    }
    // Otherwise, render as short paragraphs
    return lines.map((line, idx) => (
      <p key={idx} className="text-sm whitespace-pre-wrap mb-2">{line.trim()}</p>
    ));
  }

  const [newMessage, setNewMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-neutral-light/50 rounded-lg shadow-inner">
      <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto scroll-smooth">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-xl shadow ${
              msg.sender === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white text-neutral-dark rounded-bl-none border border-neutral/30'
            }`}>
              <div className="flex items-center mb-1">
                {msg.sender === 'ai' && <BotIcon className="w-5 h-5 text-accent mr-2 flex-shrink-0" />}
                <span className="text-xs opacity-75">
                  {msg.sender === 'user' ? 'You' : 'CareerBot'} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'user' && <UserCircleIcon className="w-5 h-5 text-white/80 ml-2 flex-shrink-0" />}
              </div>
              {/* Render bot answers as plain text with bullet points and short paragraphs, no markdown */}
              {msg.sender === 'ai'
                ? renderBotPlainText(msg.text)
                : msg.text.split('\n').map((line, index) => (
                    <p key={index} className="text-sm whitespace-pre-wrap">{line}</p>
                  ))}
            </div>
          </div>
        ))}
        {isLoading && chatHistory[chatHistory.length -1]?.sender === 'user' && (
           <div className="flex justify-start">
             <div className="max-w-[70%] p-3 rounded-xl shadow bg-neutral-dark text-neutral-light rounded-bl-none border border-neutral-dark/50">
                <div className="flex items-center">
                    <BotIcon className="w-5 h-5 text-accent mr-2 flex-shrink-0" />
                    <span className="text-xs opacity-75">CareerBot is typing...</span>
                </div>
                <LoadingSpinner className="w-5 h-5 mt-2 text-accent" />
             </div>
           </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral/30 bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask your AI career counselor..."
            className="flex-grow p-3 border border-neutral-light/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors duration-200 bg-neutral-dark text-neutral-light placeholder:text-neutral-light/70"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="p-3 bg-accent hover:bg-accent/90 text-white rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-offset-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Send chat message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;

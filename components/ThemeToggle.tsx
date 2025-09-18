import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-18 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid var(--color-border)`,
        boxShadow: 'var(--shadow-md)',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative flex h-8 w-16 items-center rounded-full p-1 transition-all duration-300"
           style={{ backgroundColor: isDark ? 'var(--color-accent)' : 'var(--color-buttonSecondary)' }}>
        
        {/* Toggle Circle */}
        <div
          className={`absolute h-6 w-6 rounded-full transition-all duration-300 ease-in-out transform ${
            isDark ? 'translate-x-8' : 'translate-x-0'
          }`}
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
        
        {/* Sun Icon */}
        <div className={`absolute left-1 transition-all duration-300 ${isDark ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
          <svg className="h-4 w-4" style={{ color: 'var(--color-warning)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Moon Icon */}
        <div className={`absolute right-1 transition-all duration-300 ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <svg className="h-4 w-4" style={{ color: 'var(--color-info)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;

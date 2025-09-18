import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { theme } = useTheme();
  
  const navItems = [
    { id: 'resume-analysis', label: 'Resume Analysis' },
    { id: 'career-roadmap', label: 'Career Roadmap' },
    { id: 'skill-gap', label: 'Skill Gap' },
    { id: 'profile-booster', label: 'Profile Booster' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <nav 
      className="w-64 h-screen flex flex-col shadow-xl fixed left-0 top-0 z-40 transition-all duration-300 theme-bg-surface"
      style={{
        borderRight: `1px solid ${theme.colors.border}`,
      }}
    >
      <div className="p-8 text-2xl font-extrabold border-b theme-border theme-text-primary">
        <div className="flex items-center gap-2">
          <span>AI Career Counselor</span>
        </div>
      </div>
      
      <ul className="flex-grow mt-6 space-y-2 px-4">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 group theme-text-primary ${
                currentPage === item.id 
                  ? 'theme-bg-surface-elevated font-semibold theme-shadow-md' 
                  : 'hover:theme-bg-surface-elevated hover:theme-shadow-sm'
              }`}
              style={{
                backgroundColor: currentPage === item.id ? theme.colors.accent + '20' : 'transparent',
                borderLeft: currentPage === item.id ? `3px solid ${theme.colors.accent}` : '3px solid transparent',
              }}
              aria-current={currentPage === item.id ? 'page' : undefined}
            >
              <span className="font-medium">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      
      <div className="p-6 border-t theme-border text-sm theme-text-muted text-center">
        <p>&copy; 2024 AI Career Counselor</p>
        <p className="text-xs mt-1 theme-text-muted opacity-75">Powered by AI</p>
      </div>
    </nav>
  );
};

export default Sidebar;

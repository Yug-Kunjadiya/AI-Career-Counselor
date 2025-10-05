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
    { id: 'interview-game', label: 'Interview Game' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <nav 
      className="w-64 h-screen flex flex-col shadow-xl theme-bg-surface"
      style={{
        borderRight: `1px solid ${theme.colors.border}`,
      }}
    >
      <div className="p-4 lg:p-8 text-lg lg:text-2xl font-extrabold border-b theme-border theme-text-primary">
        <div className="flex items-center gap-2">
          <span className="hidden lg:block">AI Career Counselor</span>
          <span className="lg:hidden">AI Career</span>
        </div>
      </div>
      
      <ul className="flex-grow mt-4 lg:mt-6 space-y-1 lg:space-y-2 px-2 lg:px-4">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-300 flex items-center gap-2 lg:gap-3 group theme-text-primary text-sm lg:text-base ${
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
      
      <div className="p-3 lg:p-6 border-t theme-border text-xs lg:text-sm theme-text-muted text-center">
        <p className="hidden lg:block">&copy; 2025 AI Career Counselor</p>
        <p className="lg:hidden">&copy; 2025</p>
        <p className="text-xs mt-1 theme-text-muted opacity-75 hidden lg:block">Powered by YUG KUNJADIYA</p>
      </div>
    </nav>
  );
};

export default Sidebar;

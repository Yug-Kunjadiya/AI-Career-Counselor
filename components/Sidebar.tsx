import React from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'resume-analysis', label: 'Resume Analysis' },
    { id: 'career-roadmap', label: 'Career Roadmap' },
    { id: 'skill-gap', label: 'Skill Gap' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <nav className="w-64 h-screen bg-gradient-to-b from-indigo-700 via-green-500 to-cyan-500 text-white flex flex-col shadow-lg rounded-r-lg fixed left-0 top-0">
      <div className="p-8 text-3xl font-extrabold border-b border-white/30">
        AI Career Counselor
      </div>
      <ul className="flex-grow mt-6">
        {navItems.map((item) => (
          <li key={item.id}>
          <button
            onClick={() => onNavigate(item.id)}
            className={`w-full text-left px-8 py-4 hover:bg-white/30 transition-colors duration-300 rounded-l-lg ${
              currentPage === item.id ? 'bg-white/40 font-semibold shadow-lg' : ''
            }`}
            aria-current={currentPage === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
          </li>
        ))}
      </ul>
      <div className="p-6 border-t border-white/20 text-sm opacity-75 text-center">
        &copy; 2024 AI Career Counselor
      </div>
    </nav>
  );
};

export default Sidebar;

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: {
    colors: {
      // Background colors
      primary: string;
      secondary: string;
      surface: string;
      surfaceElevated: string;
      
      // Text colors
      textPrimary: string;
      textSecondary: string;
      textMuted: string;
      
      // Accent colors
      accent: string;
      accentHover: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      
      // Interactive elements
      buttonPrimary: string;
      buttonPrimaryHover: string;
      buttonSecondary: string;
      buttonSecondaryHover: string;
      
      // Borders and dividers
      border: string;
      borderLight: string;
      
      // Gradients
      gradientPrimary: string;
      gradientSecondary: string;
      gradientAccent: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

const lightTheme = {
  colors: {
    // Modern light theme with sophisticated blues and warm accents
    primary: '#FAFBFC',
    secondary: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    textPrimary: '#1E293B',
    textSecondary: '#475569',
    textMuted: '#64748B',
    
    accent: '#3B82F6',
    accentHover: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    
    buttonPrimary: '#3B82F6',
    buttonPrimaryHover: '#2563EB',
    buttonSecondary: '#E2E8F0',
    buttonSecondaryHover: '#CBD5E1',
    
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientSecondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradientAccent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

const darkTheme = {
  colors: {
    // Sophisticated dark theme with deep blues and vibrant accents
    primary: '#0F172A',
    secondary: '#1E293B',
    surface: '#334155',
    surfaceElevated: '#475569',
    
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#CBD5E1',
    
    accent: '#60A5FA',
    accentHover: '#3B82F6',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#22D3EE',
    
    buttonPrimary: '#60A5FA',
    buttonPrimaryHover: '#3B82F6',
    buttonSecondary: '#475569',
    buttonSecondaryHover: '#64748B',
    
    border: '#475569',
    borderLight: '#64748B',
    
    gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientSecondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradientAccent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const theme = isDark ? darkTheme : lightTheme;

  // Apply theme to document root for CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Add theme class to body for conditional styling
    document.body.className = isDark ? 'theme-dark' : 'theme-light';
  }, [theme, isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

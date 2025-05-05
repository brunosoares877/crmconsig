
import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Aplicar sempre o tema claro
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remover todas as classes de tema
    root.classList.remove('dark', 'light', 'classic-dark');
    
    // Aplicar apenas o tema claro
    root.classList.add('light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

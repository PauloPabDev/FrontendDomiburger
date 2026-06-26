import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Crear el contexto
export const PreferencesContext = createContext();

// Crear el provider para este contexto
export const PreferencesProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false,); // Modo oscuro por defecto

  const [roleSelect, setRoleSelect] = useLocalStorage('roleSelect', null);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (isDarkMode) {
      htmlElement.setAttribute('data-bs-theme', 'dark');
    } else {
      htmlElement.removeAttribute('data-bs-theme');
    }
  }, [isDarkMode])

  return (
    <PreferencesContext.Provider value={{
      isDarkMode, toggleTheme,

      roleSelect, setRoleSelect,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Hook para consumir el contexto
export const usePreferences = () => useContext(PreferencesContext);

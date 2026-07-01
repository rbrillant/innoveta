import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children, storageKey = 'theme' }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(storageKey, dark ? 'dark' : 'light');
  }, [dark, storageKey]);

  function toggle() { setDark((d) => !d); }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

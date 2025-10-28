import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { themes, defaultThemeName, Theme, getThemeByName } from '../utils/themes';

export function useTheme() {
  const [themeName, setThemeName] = useLocalStorage<string>('ganhospro_theme', defaultThemeName);
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeByName(themeName));

  useEffect(() => {
    const selectedTheme = getThemeByName(themeName);
    setCurrentTheme(selectedTheme);

    // Apply CSS variables to the root element (<html>)
    const root = document.documentElement;
    for (const [key, value] of Object.entries(selectedTheme.colors)) {
      root.style.setProperty(key, value);
    }
    // Also update body background and text color directly for initial load and PWA consistency
    document.body.style.backgroundColor = selectedTheme.colors['--color-bg-default'];
    document.body.style.color = selectedTheme.colors['--color-text-default'];
    
    // Update theme-color meta tag for PWA
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', selectedTheme.colors['--color-brand-primary']);
    }

  }, [themeName]);

  const setTheme = useCallback((name: string) => {
    setThemeName(name);
  }, [setThemeName]);

  return {
    theme: currentTheme,
    setTheme,
    themes,
  };
}
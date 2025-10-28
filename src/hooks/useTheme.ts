import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage'; // Caminho corrigido para useLocalStorage
import { themes, defaultThemeName, Theme, getThemeByName } from '../utils/themes';

export function useTheme() {
  // Garante que defaultThemeName é sempre uma string válida
  const [themeName, setThemeName] = useLocalStorage<string>('ganhospro_theme', defaultThemeName);
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getThemeByName(themeName));

  useEffect(() => {
    const selectedTheme = getThemeByName(themeName);
    setCurrentTheme(selectedTheme);

    // Aplica as variáveis CSS ao elemento raiz (<html>)
    const root = document.documentElement;
    for (const [key, value] of Object.entries(selectedTheme.colors)) {
      root.style.setProperty(key, value);
    }
    // Também atualiza a cor de fundo e texto do body diretamente para consistência
    document.body.style.backgroundColor = selectedTheme.colors['--color-bg-default'];
    document.body.style.color = selectedTheme.colors['--color-text-default'];
    
    // Atualiza a meta tag theme-color para PWA
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
    themes, // Retorna a lista completa de temas
  };
}
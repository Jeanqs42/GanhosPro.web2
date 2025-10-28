import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage'; // Caminho corrigido para useLocalStorage

interface ThemeColors {
  'brand-primary': string;
  'brand-secondary': string;
  'brand-dark': string;
  'brand-light': string;
  'brand-accent': string;
  'bg-default': string;
  'bg-card': string;
  'bg-input': string;
  'border-card': string;
  'border-input': string;
  'text-default': string;
  'text-muted': string;
  'text-heading': string;
  'text-success': string;
  'text-danger': string;
  'text-warning': string;
  'text-info': string;
}

export interface Theme {
  name: string;
  displayName: string;
  colors: ThemeColors;
}

export const themes: Theme[] = [
  {
    name: 'default-dark',
    displayName: 'Padrão Escuro',
    colors: {
      'brand-primary': '#10b981', // emerald-500
      'brand-secondary': '#059669', // emerald-600
      'brand-dark': '#1f2937', // gray-800
      'brand-light': '#f9fafb', // gray-50
      'brand-accent': '#f59e0b', // amber-500
      'bg-default': '#1f2937', // gray-800
      'bg-card': '#374151', // gray-700
      'bg-input': '#4b5563', // gray-600
      'border-card': '#4a5568', // gray-600
      'border-input': '#6b7280', // gray-500
      'text-default': '#f9fafb', // gray-50
      'text-muted': '#d1d5db', // gray-300
      'text-heading': '#f9fafb', // gray-50
      'text-success': '#34d399', // green-400
      'text-danger': '#ef4444', // red-500
      'text-warning': '#fbbf24', // amber-400
      'text-info': '#60a5fa', // blue-400
    },
  },
  {
    name: 'ocean-blue',
    displayName: 'Azul Oceano',
    colors: {
      'brand-primary': '#3b82f6', // blue-500
      'brand-secondary': '#2563eb', // blue-600
      'brand-dark': '#1e3a8a', // blue-900
      'brand-light': '#e0f2fe', // blue-50
      'brand-accent': '#f97316', // orange-500
      'bg-default': '#1e3a8a', // blue-900
      'bg-card': '#1f2937', // gray-800
      'bg-input': '#374151', // gray-700
      'border-card': '#4b5563', // gray-600
      'border-input': '#6b7280', // gray-500
      'text-default': '#e0f2fe', // blue-50
      'text-muted': '#93c5fd', // blue-300
      'text-heading': '#e0f2fe', // blue-50
      'text-success': '#34d399', // green-400
      'text-danger': '#ef4444', // red-500
      'text-warning': '#fbbf24', // amber-400
      'text-info': '#60a5fa', // blue-400
    },
  },
  {
    name: 'purple-haze',
    displayName: 'Névoa Roxa',
    colors: {
      'brand-primary': '#a855f7', // purple-500
      'brand-secondary': '#9333ea', // purple-600
      'brand-dark': '#312e81', // indigo-900
      'brand-light': '#ede9fe', // violet-50
      'brand-accent': '#facc15', // yellow-400
      'bg-default': '#312e81', // indigo-900
      'bg-card': '#4338ca', // indigo-700
      'bg-input': '#4f46e5', // indigo-600
      'border-card': '#6366f1', // indigo-500
      'border-input': '#818cf8', // indigo-400
      'text-default': '#ede9fe', // violet-50
      'text-muted': '#c4b5fd', // violet-300
      'text-heading': '#ede9fe', // violet-50
      'text-success': '#34d399', // green-400
      'text-danger': '#ef4444', // red-500
      'text-warning': '#fbbf24', // amber-400
      'text-info': '#60a5fa', // blue-400
    },
  },
];

const getThemeByName = (name: string) => themes.find(t => t.name === name) || themes[0];

export const useTheme = () => {
  const [storedThemeName, setStoredThemeName] = useLocalStorage<string>('ganhospro_theme', themes[0].name);
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getThemeByName(storedThemeName));

  useEffect(() => {
    const themeToApply = getThemeByName(storedThemeName);
    setCurrentTheme(themeToApply);

    const root = document.documentElement;
    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    // Update body background for consistency
    document.body.style.backgroundColor = themeToApply.colors['bg-default'];
  }, [storedThemeName]);

  const setTheme = useCallback((themeName: string) => {
    setStoredThemeName(themeName);
  }, [setStoredThemeName]);

  return {
    theme: currentTheme,
    setTheme,
    themes,
  };
};
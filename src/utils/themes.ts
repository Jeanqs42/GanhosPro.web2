export interface Theme {
  name: string;
  displayName: string;
  colors: {
    '--color-brand-primary': string;
    '--color-brand-secondary': string;
    '--color-brand-dark': string;
    '--color-brand-light': string;
    '--color-brand-accent': string;
    '--color-text-default': string;
    '--color-bg-default': string;
    '--color-bg-card': string;
    '--color-border-card': string;
    '--color-text-muted': string;
    '--color-text-heading': string;
  };
}

export const themes: Theme[] = [
  {
    name: 'dark-emerald',
    displayName: 'Esmeralda Escuro (Padrão)',
    colors: {
      '--color-brand-primary': '#10b981', // emerald-500
      '--color-brand-secondary': '#059669', // emerald-600
      '--color-brand-dark': '#1f2937', // gray-800
      '--color-brand-light': '#f9fafb', // gray-50
      '--color-brand-accent': '#f59e0b', // amber-500
      '--color-text-default': '#f9fafb', // brand-light
      '--color-bg-default': '#1f2937', // brand-dark
      '--color-bg-card': '#1f2937', // gray-800
      '--color-border-card': '#374151', // gray-700
      '--color-text-muted': '#9ca3af', // gray-400
      '--color-text-heading': '#f9fafb', // white
    },
  },
  {
    name: 'light-blue',
    displayName: 'Azul Claro',
    colors: {
      '--color-brand-primary': '#3b82f6', // blue-500
      '--color-brand-secondary': '#2563eb', // blue-600
      '--color-brand-dark': '#bfdbfe', // blue-200
      '--color-brand-light': '#1f2937', // gray-800
      '--color-brand-accent': '#ef4444', // red-500
      '--color-text-default': '#1f2937', // gray-800
      '--color-bg-default': '#f9fafb', // gray-50
      '--color-bg-card': '#ffffff', // white
      '--color-border-card': '#e5e7eb', // gray-200
      '--color-text-muted': '#6b7280', // gray-500
      '--color-text-heading': '#1f2937', // gray-800
    },
  },
  {
    name: 'deep-purple',
    displayName: 'Roxo Profundo',
    colors: {
      '--color-brand-primary': '#a78bfa', // purple-400
      '--color-brand-secondary': '#8b5cf6', // purple-500
      '--color-brand-dark': '#312e81', // indigo-900
      '--color-brand-light': '#e0e7ff', // indigo-100
      '--color-brand-accent': '#f472b6', // pink-400
      '--color-text-default': '#e0e7ff', // indigo-100
      '--color-bg-default': '#312e81', // indigo-900
      '--color-bg-card': '#4338ca', // indigo-700
      '--color-border-card': '#6366f1', // indigo-500
      '--color-text-muted': '#a5b4fc', // indigo-300
      '--color-text-heading': '#e0e7ff', // indigo-100
    },
  },
  {
    name: 'dark-blue-gray',
    displayName: 'Azul Escuro Moderno',
    colors: {
      '--color-brand-primary': '#60a5fa', // blue-400
      '--color-brand-secondary': '#3b82f6', // blue-500
      '--color-brand-dark': '#111827', // gray-900
      '--color-brand-light': '#e0e7ff', // indigo-100
      '--color-brand-accent': '#fcd34d', // amber-300
      '--color-text-default': '#e0e7ff', // indigo-100
      '--color-bg-default': '#111827', // gray-900
      '--color-bg-card': '#1f2937', // gray-800
      '--color-border-card': '#374151', // gray-700
      '--color-text-muted': '#9ca3af', // gray-400
      '--color-text-heading': '#f9fafb', // white
    },
  },
  {
    name: 'light-green-gray',
    displayName: 'Verde Claro Suave',
    colors: {
      '--color-brand-primary': '#4ade80', // green-400
      '--color-brand-secondary': '#22c55e', // green-500
      '--color-brand-dark': '#dcfce7', // green-100
      '--color-brand-light': '#1f2937', // gray-800
      '--color-brand-accent': '#f87171', // red-400
      '--color-text-default': '#1f2937', // gray-800
      '--color-bg-default': '#f0fdf4', // green-50
      '--color-bg-card': '#ffffff', // white
      '--color-border-card': '#d1fae5', // green-200
      '--color-text-muted': '#6b7280', // gray-500
      '--color-text-heading': '#1f2937', // gray-800
    },
  },
];

export const defaultThemeName = themes[0].name;

export function getThemeByName(name: string): Theme {
  return themes.find(theme => theme.name === name) || themes[0];
}
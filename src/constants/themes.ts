import { ThemeColor } from '../types';

export const THEME_PRESETS: ThemeColor[] = [
  {
    id: 'blue',
    name: 'Bleu Royal Pro',
    primary: '#2563eb',
    hover: '#1d4ed8',
    light: '#eff6ff',
    accent: '#3b82f6',
  },
  {
    id: 'indigo',
    name: 'Indigo Cobalt',
    primary: '#4f46e5',
    hover: '#4338ca',
    light: '#eef2ff',
    accent: '#6366f1',
  },
  {
    id: 'emerald',
    name: 'Émeraude & Forêt',
    primary: '#059669',
    hover: '#047857',
    light: '#ecfdf5',
    accent: '#10b981',
  },
  {
    id: 'amber',
    name: 'Ambre & Bronze',
    primary: '#d97706',
    hover: '#b45309',
    light: '#fffbeb',
    accent: '#f59e0b',
  },
  {
    id: 'violet',
    name: 'Violet Impérial',
    primary: '#7c3aed',
    hover: '#6d28d9',
    light: '#f5f3ff',
    accent: '#8b5cf6',
  },
  {
    id: 'rose',
    name: 'Carmin Rubis',
    primary: '#e11d48',
    hover: '#be123c',
    light: '#fff1f2',
    accent: '#f43f5e',
  },
  {
    id: 'cyan',
    name: 'Océan Atlantique',
    primary: '#0284c7',
    hover: '#0369a1',
    light: '#f0f9ff',
    accent: '#0ea5e9',
  },
  {
    id: 'slate',
    name: 'Ardoise & Carbone',
    primary: '#334155',
    hover: '#1e293b',
    light: '#f8fafc',
    accent: '#475569',
  },
];

// Helper to derive subtle tinted light color and hover color from any custom hex
export function deriveThemeColors(hex: string): { primary: string; hover: string; light: string; accent: string } {
  // Normalize hex
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleaned.substring(0, 2), 16) || 37;
  const g = parseInt(cleaned.substring(2, 4), 16) || 99;
  const b = parseInt(cleaned.substring(4, 6), 16) || 235;

  // Darker for hover
  const hoverR = Math.max(0, Math.floor(r * 0.82));
  const hoverG = Math.max(0, Math.floor(g * 0.82));
  const hoverB = Math.max(0, Math.floor(b * 0.82));
  const hover = `#${hoverR.toString(16).padStart(2, '0')}${hoverG.toString(16).padStart(2, '0')}${hoverB.toString(16).padStart(2, '0')}`;

  // Very light tinted background for active items
  const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.94));
  const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.94));
  const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.94));
  const light = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;

  return {
    primary: hex,
    hover,
    light,
    accent: hex,
  };
}

export function applyThemeToDocument(hex: string) {
  const { primary, hover, light } = deriveThemeColors(hex);
  const root = document.documentElement;
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-hover', hover);
  root.style.setProperty('--color-primary-light', light);
}

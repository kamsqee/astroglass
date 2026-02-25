/**
 * Shared prompt helpers — reusable option lists and constants
 */
import type { UserChoices } from '../index.js';

// ─── Available Themes ───

export interface ThemeOption {
  id: string;
  label: string;
  hint: string;
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  { id: 'liquid',  label: '💧 Liquid',  hint: 'Fluid, organic design' },
  { id: 'glass',   label: '🔮 Glass',   hint: 'Glassmorphism & blur' },
  { id: 'neo',     label: '⚡ Neo',     hint: 'Bold brutalist energy' },
  { id: 'luxury',  label: '✨ Luxury',  hint: 'Editorial elegance' },
  { id: 'minimal', label: '○ Minimal',  hint: 'Clean & typographic' },
  { id: 'aurora',  label: '🌌 Aurora',  hint: 'Cosmic gradients' },
];

// ─── Available Palettes ───

export interface PaletteOption {
  id: string;
  label: string;
  category: 'light' | 'dark' | 'colorful';
}

export const AVAILABLE_PALETTES: PaletteOption[] = [
  { id: 'azure',     label: '☀️ Azure',     category: 'light' },
  { id: 'solaris',   label: '🌅 Solaris',   category: 'light' },
  { id: 'evergreen', label: '🌿 Evergreen', category: 'light' },
  { id: 'rose',      label: '🌸 Rosé',      category: 'light' },
  { id: 'monochrome',label: '⚪ Monochrome',category: 'light' },
  { id: 'nordic',    label: '❄️ Nordic',     category: 'light' },
  { id: 'aquatica',  label: '🐚 Aquatica',  category: 'light' },
  { id: 'abyss',     label: '🌙 Abyss',     category: 'dark' },
  { id: 'neonoir',   label: '🎧 NeoNoir',   category: 'dark' },
  { id: 'synthwave', label: '🎹 Synthwave', category: 'dark' },
];

// ─── Available Locales ───

export interface LocaleOption {
  code: string;
  label: string;
}

export const AVAILABLE_LOCALES: LocaleOption[] = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'kk', label: '🇰🇿 Қазақша' },
];

// ─── Feature Flags ───

export interface FeatureOption {
  id: string;
  label: string;
  hint: string;
}

export const AVAILABLE_FEATURES: FeatureOption[] = [
  { id: 'blog',      label: '📝 Blog',      hint: 'MDX blog with RSS' },
  { id: 'docs',      label: '📚 Docs',      hint: 'Full-text search docs' },
  { id: 'dashboard', label: '📊 Dashboard', hint: 'Analytics demo (React)' },
  { id: 'react',     label: '⚛️ React',     hint: 'React components support' },
];

// ─── Deploy Targets ───

export const DEPLOY_TARGETS = [
  { value: 'cloudflare', label: '☁️ Cloudflare Pages', hint: 'Recommended' },
  { value: 'vercel',     label: '▲ Vercel',            hint: 'Zero-config' },
  { value: 'netlify',    label: '◈ Netlify',           hint: 'Edge functions' },
  { value: 'static',     label: '📁 Static',           hint: 'No server needed' },
] as const;

// ─── Presets ───

export interface Preset {
  name: string;
  description: string;
  themes: string[];
  palettes: string[];
  locales: string[];
  features: string[];
  deployTarget: string;
}

export const PRESETS: Record<string, Preset> = {
  minimal: {
    name: 'Minimal',
    description: '1 theme, 1 palette, English only — fastest start',
    themes: ['liquid'],
    palettes: ['azure'],
    locales: ['en'],
    features: [],
    deployTarget: 'static',
  },
  standard: {
    name: 'Standard',
    description: '3 themes, 5 palettes, blog + docs',
    themes: ['liquid', 'glass', 'neo'],
    palettes: ['azure', 'abyss', 'solaris', 'neonoir', 'rose'],
    locales: ['en'],
    features: ['blog', 'docs', 'react'],
    deployTarget: 'cloudflare',
  },
  full: {
    name: 'Full',
    description: 'All 6 themes, all palettes, all features — the complete template',
    themes: ['liquid', 'glass', 'neo', 'luxury', 'minimal', 'aurora'],
    palettes: ['azure', 'solaris', 'evergreen', 'rose', 'monochrome', 'nordic', 'aquatica', 'abyss', 'neonoir', 'synthwave'],
    locales: ['en'],
    features: ['blog', 'docs', 'dashboard', 'react'],
    deployTarget: 'cloudflare',
  },
};

/**
 * Ensure required features are included (e.g., docs/dashboard require react)
 */
export function resolveFeatureDeps(features: string[]): string[] {
  const resolved = [...features];
  if ((resolved.includes('docs') || resolved.includes('dashboard')) && !resolved.includes('react')) {
    resolved.push('react');
  }
  return resolved;
}

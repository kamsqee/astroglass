/**
 * Palette Configuration
 *
 * Central registry of all color palettes. Which palettes are *enabled*
 * is determined by `astroglass.config.json` via config-loader.
 * Components should use the config-gated helpers (getEnabledPalettes,
 * getEnabledPaletteIds, etc.) rather than reading the raw `palettes` array.
 */

import { config } from './config-loader';

export type PaletteCategory = 'light' | 'dark' | 'colorful';

export interface Palette {
  /** Unique palette identifier (matches data-palette attribute and CSS file name) */
  id: string;
  /** Emoji icon displayed in switchers */
  icon: string;
  /** Category for grouping in the ThemeSwitcher dropdown */
  category: PaletteCategory;
  /** Accent hex color for visual previews (Luxury headers, Hero) */
  accentHex: string;
  /** Background hex color for swatch previews */
  bgHex: string;
}

/**
 * All available palettes.
 * Order within each category determines display order in the ThemeSwitcher.
 */
export const palettes: Palette[] = [
  // Light
  { id: 'azure',      icon: '☀️',  category: 'light',    accentHex: '#3B82F6', bgHex: '#ffffff' },
  { id: 'nordic',     icon: '❄️',  category: 'light',    accentHex: '#2592C8', bgHex: '#F8FCFF' },
  { id: 'solaris',    icon: '🌅',  category: 'light',    accentHex: '#F59E0B', bgHex: '#FFF7ED' },
  // Dark
  { id: 'abyss',      icon: '🌙',  category: 'dark',     accentHex: '#6366F1', bgHex: '#0F172A' },
  { id: 'neonoir',    icon: '🌃',  category: 'dark',     accentHex: '#EC4899', bgHex: '#18181B' },
  { id: 'synthwave',  icon: '🎧',  category: 'dark',     accentHex: '#8B5CF6', bgHex: '#2E1065' },
  // Colorful
  { id: 'evergreen',  icon: '🌲',  category: 'colorful', accentHex: '#22C55E', bgHex: '#F0FFF4' },
  { id: 'rose',       icon: '🌸',  category: 'colorful', accentHex: '#F43F5E', bgHex: '#FFF1F2' },
  { id: 'aquatica',   icon: '🌊',  category: 'colorful', accentHex: '#14B8A6', bgHex: '#F0FDFA' },
  { id: 'monochrome', icon: '◻️',  category: 'colorful', accentHex: '#6B7280', bgHex: '#FFFFFF' },
];

/** Default palette ID (used as fallback) */
export const defaultPalette = 'azure';

// ============================================
// Helper Functions (config-gated)
// ============================================

/** Get all enabled palettes (gated by astroglass.config.json) */
export function getEnabledPalettes(): Palette[] {
  return palettes.filter(p => config.palettes.includes(p.id));
}

/** Get enabled palette IDs */
export function getPaletteIds(): string[] {
  return getEnabledPalettes().map(p => p.id);
}

/** Get enabled palettes by category */
export function getPalettesByCategory(category: PaletteCategory): Palette[] {
  return getEnabledPalettes().filter(p => p.category === category);
}

/** Get a single palette by ID (looks up from all palettes, not just enabled) */
export function getPaletteById(id: string): Palette | undefined {
  return palettes.find(p => p.id === id);
}

/** Build a Record<id, icon> for client-side JS (ThemeSwitcher, headers) */
export function getPaletteIconMap(): Record<string, string> {
  return Object.fromEntries(getEnabledPalettes().map(p => [p.id, p.icon]));
}


/**
 * Palette Registry — Central Source of Truth
 *
 * Every component that needs palette awareness imports from here.
 */

export interface Palette {
  id: string;
  icon: string;
  category: 'light' | 'dark' | 'colorful';
  accentHex: string;
  bgHex: string;
}

export const palettes: Palette[] = [

  { id: 'azure', icon: '☀️', category: 'light', accentHex: '#3B82F6', bgHex: '#FFFFFF' },

  { id: 'solaris', icon: '🌅', category: 'light', accentHex: '#F59E0B', bgHex: '#FFF7ED' },

  { id: 'evergreen', icon: '🌿', category: 'light', accentHex: '#10B981', bgHex: '#ECFDF5' },

  { id: 'rose', icon: '🌸', category: 'light', accentHex: '#F43F5E', bgHex: '#FFF1F2' },

  { id: 'monochrome', icon: '⚪', category: 'light', accentHex: '#6B7280', bgHex: '#F9FAFB' },

  { id: 'nordic', icon: '❄️', category: 'light', accentHex: '#06B6D4', bgHex: '#F0FDFA' },

  { id: 'aquatica', icon: '🐚', category: 'light', accentHex: '#0EA5E9', bgHex: '#F0F9FF' },

  { id: 'abyss', icon: '🌙', category: 'dark', accentHex: '#6366F1', bgHex: '#0F172A' },

  { id: 'neonoir', icon: '🎧', category: 'dark', accentHex: '#EC4899', bgHex: '#18181B' },

  { id: 'synthwave', icon: '🎹', category: 'dark', accentHex: '#8B5CF6', bgHex: '#2E1065' }

];

export const defaultPalette = palettes[0];

export function getPaletteIds(): string[] {
  return palettes.map(p => p.id);
}

export function getPalettesByCategory(category: Palette['category']): Palette[] {
  return palettes.filter(p => p.category === category);
}

export function getPaletteById(id: string): Palette | undefined {
  return palettes.find(p => p.id === id);
}

export function getPaletteIconMap(): Record<string, string> {
  return Object.fromEntries(palettes.map(p => [p.id, p.icon]));
}

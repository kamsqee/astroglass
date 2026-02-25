
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

  { id: 'abyss', icon: '🌙', category: 'dark', accentHex: '#6366F1', bgHex: '#0F172A' },

  { id: 'solaris', icon: '🌅', category: 'light', accentHex: '#F59E0B', bgHex: '#FFF7ED' },

  { id: 'neonoir', icon: '🎧', category: 'dark', accentHex: '#EC4899', bgHex: '#18181B' },

  { id: 'rose', icon: '🌸', category: 'light', accentHex: '#F43F5E', bgHex: '#FFF1F2' }

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

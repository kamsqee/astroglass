
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

  { id: 'monochrome', icon: '⚪', category: 'light', accentHex: '#6B7280', bgHex: '#F9FAFB' },

  { id: 'nordic', icon: '❄️', category: 'light', accentHex: '#06B6D4', bgHex: '#F0FDFA' }

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

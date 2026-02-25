
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

  { id: 'evergreen', icon: '🌿', category: 'light', accentHex: '#10B981', bgHex: '#ECFDF5' }

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

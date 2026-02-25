/**
 * Theme Configuration
 * 
 * Central registry for all available themes.
 * This is the single source of truth for theme metadata.
 * 
 * To add a new theme:
 * 1. Add an entry to the `themes` array
 * 2. Create the corresponding components in `src/components/{section}/{SectionThemeName}.astro`
 * 3. The theme will be automatically available throughout the app
 */

export interface ThemeDefinition {
  /** Unique theme identifier (used in URLs and component names) */
  id: string;
  /** Display name */
  name: string;
  /** Tailwind gradient classes for demo card backgrounds */
  color: string;
  /** Emoji icon for the theme */
  icon: string;
  /** List of sections this theme includes */
  sections: string[];
  /** Whether this theme is currently enabled */
  enabled: boolean;
  /** Whether this is a premium theme (for marketplace filtering) */
  premium: boolean;
  /** Optional description */
  description?: string;
}

/**
 * All available themes
 * 
 * Set `enabled: false` to disable a theme without deleting its files.
 */
export const themes: ThemeDefinition[] = [
  {
    id: 'liquid',
    name: 'Liquid',
    color: 'from-blue-500 to-cyan-400',
    icon: '💧',
    sections: ['Header', 'Hero', 'About', 'Features', 'Portfolio', 'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact', 'Footer'],
    enabled: true,
    premium: false,
    description: 'Fluid, organic design with smooth animations',
  },
  {
    id: 'glass',
    name: 'Glass',
    color: 'from-purple-500 to-pink-400',
    icon: '🔮',
    sections: ['Header', 'Hero', 'About', 'Features', 'Portfolio', 'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact', 'Footer'],
    enabled: true,
    premium: false,
    description: 'Glassmorphism with depth and transparency',
  },
  {
    id: 'neo',
    name: 'Neo',
    color: 'from-green-500 to-emerald-400',
    icon: '⚡',
    sections: ['Header', 'Hero', 'About', 'Features', 'Portfolio', 'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact', 'Footer'],
    enabled: true,
    premium: false,
    description: 'Bold, energetic design with dynamic elements',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    color: 'from-amber-500 to-orange-400',
    icon: '✨',
    sections: ['Header', 'Hero', 'About', 'Features', 'Portfolio', 'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact', 'Footer'],
    enabled: true,
    premium: true,
    description: 'Premium, sophisticated aesthetic',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    color: 'from-gray-500 to-slate-400',
    icon: '○',
    sections: ['Header', 'Hero', 'About', 'Features', 'Portfolio', 'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact', 'Footer'],
    enabled: true,
    premium: false,
    description: 'Clean, focused design with essential elements',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    color: 'from-violet-500 to-teal-400',
    icon: '🌌',
    sections: ['Header', 'Hero', 'About', 'Features', 'Portfolio', 'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact', 'Footer'],
    enabled: true,
    premium: true,
    description: 'Immersive, gradient-mesh-rich design with geometric structure',
  },
];

/** Get all enabled themes */
export function getEnabledThemes(): ThemeDefinition[] {
  return themes.filter((theme) => theme.enabled);
}

/** Get theme IDs for enabled themes */
export function getEnabledThemeIds(): string[] {
  return getEnabledThemes().map((theme) => theme.id);
}

/** Get theme by ID */
export function getThemeById(id: string): ThemeDefinition | undefined {
  return themes.find((theme) => theme.id === id);
}

/** Check if a theme ID is valid and enabled */
export function isValidTheme(id: string): boolean {
  return getEnabledThemes().some((theme) => theme.id === id);
}

/** Get sections for a theme */
export function getThemeSections(themeId: string): string[] {
  return getThemeById(themeId)?.sections ?? [];
}

/** Get premium themes only */
export function getPremiumThemes(): ThemeDefinition[] {
  return getEnabledThemes().filter((theme) => theme.premium);
}

/** Get free themes only */
export function getFreeThemes(): ThemeDefinition[] {
  return getEnabledThemes().filter((theme) => !theme.premium);
}

/**
 * Theme icons map (for backward compatibility)
 */
export const themeIcons: Record<string, string> = Object.fromEntries(
  themes.map((t) => [t.id, t.icon])
);

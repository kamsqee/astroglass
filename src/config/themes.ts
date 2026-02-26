/**
 * Theme Configuration — Unified Manifest Registry
 *
 * Central registry for all available themes, powered by per-theme manifest files.
 * Each theme is fully self-describing (identity, layout, header, files) in its
 * own manifest at src/config/manifests/{theme}.ts.
 *
 * Which themes are *enabled* is determined by `astroglass.config.json` via config-loader.
 *
 * To add a new theme:
 * 1. Create a manifest file at src/config/manifests/{theme}.ts
 * 2. Import and register it in the `allThemes` array below
 * 3. Create the barrel file at src/components/sections/themes/{theme}.ts
 * 4. Add the theme ID to astroglass.config.json → themes[]
 */

import { config } from './config-loader';
import type { ThemeManifest } from './theme-manifest';
import type { SectionKey } from './sectionRegistry';

// ── Per-theme manifest imports ────────────────────────────────
import { liquidManifest } from './manifests/liquid';
import { glassManifest } from './manifests/glass';
import { neoManifest } from './manifests/neo';
import { luxuryManifest } from './manifests/luxury';
import { minimalManifest } from './manifests/minimal';
import { auroraManifest } from './manifests/aurora';

// ── All themes (order matters for UI rendering) ───────────────
const allThemes: ThemeManifest[] = [
  liquidManifest,
  glassManifest,
  neoManifest,
  luxuryManifest,
  minimalManifest,
  auroraManifest,
];

// ── Config-gated queries ──────────────────────────────────────

/** Get all enabled themes (gated by astroglass.config.json) */
export function getEnabledThemes(): ThemeManifest[] {
  return allThemes.filter((t) => config.themes.includes(t.id));
}

/** Get theme IDs for enabled themes */
export function getEnabledThemeIds(): string[] {
  return getEnabledThemes().map((t) => t.id);
}

/** Get manifest for a specific theme (enabled or not — for metadata lookups) */
export function getThemeById(id: string): ThemeManifest | undefined {
  return allThemes.find((t) => t.id === id);
}

/** Check if a theme ID is valid and enabled */
export function isValidTheme(id: string): boolean {
  return getEnabledThemes().some((t) => t.id === id);
}

/** Get the landing section order for a theme */
export function getLandingSections(themeId: string): SectionKey[] {
  return getThemeById(themeId)?.landingSections ?? [];
}

/** Get the header version number for a theme (for BaseLayout resolution) */
export function getHeaderVersion(themeId: string): 1 | 2 | 3 | 4 | 5 {
  return getThemeById(themeId)?.headerVersion ?? 3;
}

/** Get premium themes only */
export function getPremiumThemes(): ThemeManifest[] {
  return getEnabledThemes().filter((t) => t.premium);
}

/** Get free themes only */
export function getFreeThemes(): ThemeManifest[] {
  return getEnabledThemes().filter((t) => !t.premium);
}

/**
 * Theme icons map (for backward compatibility with components that
 * read icons by theme ID string)
 */
export const themeIcons: Record<string, string> = Object.fromEntries(
  allThemes.map((t) => [t.id, t.icon]),
);

// ── Re-export types for convenience ───────────────────────────
export type { ThemeManifest } from './theme-manifest';

/**
 * @deprecated Use ThemeManifest instead. Kept for backward compatibility.
 * The `enabled` and `sections` fields are computed from the manifest.
 */
export interface ThemeDefinition {
  id: string;
  name: string;
  color: string;
  icon: string;
  sections: string[];
  enabled: boolean;
  premium: boolean;
  description?: string;
}

/**
 * @deprecated Use getEnabledThemes() which returns ThemeManifest[].
 * Legacy array kept for components still importing `themes` directly.
 */
export const themes: ThemeDefinition[] = allThemes.map((m) => ({
  id: m.id,
  name: m.name,
  color: m.color,
  icon: m.icon,
  sections: ['Header', ...m.landingSections, 'Footer'],
  enabled: config.themes.includes(m.id),
  premium: m.premium,
  description: m.description,
}));

/** @deprecated Use getThemeById().landingSections or getLandingSections() */
export function getThemeSections(themeId: string): string[] {
  const manifest = getThemeById(themeId);
  if (!manifest) return [];
  return ['Header', ...manifest.landingSections, 'Footer'];
}

/**
 * Config Loader — Single Source of Truth
 *
 * Loads, validates, and exposes `astroglass.config.json` as an immutable
 * typed object. Every runtime subsystem (themes, locales, palettes,
 * navigation, features) must read project configuration from here
 * instead of maintaining its own hardcoded enabled/disabled state.
 *
 * This file is imported at build time. A malformed config will crash
 * the build with a clear error message rather than producing silent
 * runtime bugs.
 */

import rawConfig from '../../astroglass.config.json';

// ─── Types ───────────────────────────────────────────────────────

export interface AstroglassConfig {
  version: string;
  themes: string[];
  palettes: string[];
  locales: string[];
  features: string[];
  deployTarget: string;
  defaultPalette: string;
}

// ─── Validation ──────────────────────────────────────────────────

function validateConfig(raw: unknown): AstroglassConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('[astroglass] astroglass.config.json must be a JSON object');
  }

  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];

  // Required string fields
  for (const field of ['version', 'deployTarget', 'defaultPalette'] as const) {
    if (typeof obj[field] !== 'string' || (obj[field] as string).length === 0) {
      errors.push(`"${field}" must be a non-empty string`);
    }
  }

  // Required non-empty string arrays
  for (const field of ['themes', 'palettes', 'locales'] as const) {
    if (!Array.isArray(obj[field]) || (obj[field] as unknown[]).length === 0) {
      errors.push(`"${field}" must be a non-empty array`);
    } else if (!(obj[field] as unknown[]).every(v => typeof v === 'string')) {
      errors.push(`"${field}" must contain only strings`);
    }
  }

  // Features can be empty but must be an array of strings
  if (!Array.isArray(obj.features)) {
    errors.push('"features" must be an array');
  } else if (!(obj.features as unknown[]).every(v => typeof v === 'string')) {
    errors.push('"features" must contain only strings');
  }

  if (errors.length > 0) {
    throw new Error(
      `[astroglass] Invalid astroglass.config.json:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }

  return obj as unknown as AstroglassConfig;
}

// ─── Validated, frozen config ────────────────────────────────────

/** Validated, immutable project configuration. */
export const config: Readonly<AstroglassConfig> = Object.freeze(validateConfig(rawConfig));

// ─── Derived helpers ─────────────────────────────────────────────

/** True when only one theme is selected */
export const isSingleTheme: boolean = config.themes.length === 1;

/** True when multiple themes are selected */
export const isMultiTheme: boolean = config.themes.length > 1;

/** The first (or only) theme — used as the primary in single-theme mode */
export const primaryTheme: string = config.themes[0];

/** Check if a feature is enabled in the project config */
export function hasFeature(feature: string): boolean {
  return config.features.includes(feature);
}

/** Check if a theme is enabled in the project config */
export function hasTheme(themeId: string): boolean {
  return config.themes.includes(themeId);
}

/** Check if a locale is enabled in the project config */
export function hasLocale(code: string): boolean {
  return config.locales.includes(code);
}

/** Check if a palette is enabled in the project config */
export function hasPalette(id: string): boolean {
  return config.palettes.includes(id);
}

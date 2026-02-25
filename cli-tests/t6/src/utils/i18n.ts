/**
 * Internationalization (i18n) Utilities
 * 
 * This module provides utilities for handling translations and locale detection.
 * Uses Vite's import.meta.glob for automatic locale file discovery.
 */

import { 
  defaultLocale, 
  getEnabledLocaleCodes,
  type Locale 
} from '../config/locales';

// ============================================
// Automatic Locale Loading via Glob
// ============================================

/**
 * Load all locale JSON files using Vite's glob import.
 * This eliminates the need for explicit imports for each locale file.
 */
const localeModules = import.meta.glob('../locales/**/*.json', { eager: true });

/**
 * Build translations object for a specific locale
 */
function loadLocaleTranslations(lang: string): Record<string, unknown> {
  const translations: Record<string, unknown> = {};
  
  for (const [path, module] of Object.entries(localeModules)) {
    // Check if this file belongs to the requested locale
    if (path.includes(`/${lang}/`)) {
      // Extract section name from path (e.g., '../locales/en/hero.json' → 'hero')
      const sectionMatch = path.match(/\/(\w+)\.json$/);
      if (sectionMatch) {
        const section = sectionMatch[1];
        const content = (module as { default: unknown }).default;
        
        // Special handling for 'common' - spread at root level
        if (section === 'common') {
          Object.assign(translations, content);
        } else {
          translations[section] = content;
        }
      }
    }
  }
  
  return translations;
}

// ============================================
// Pre-built Translation Objects
// ============================================

/**
 * Cache of loaded translations for all enabled locales
 */
const translations: Record<string, Record<string, unknown>> = {};

// Load translations for all enabled locales
for (const code of getEnabledLocaleCodes()) {
  translations[code] = loadLocaleTranslations(code);
}

// ============================================
// Exports
// ============================================

export { defaultLocale };
export const locales = getEnabledLocaleCodes() as unknown as readonly Locale[];

export type { Locale };

export { getLocaleFromUrl } from './locale-utils';



/**
 * Get a translation function for the given locale
 */
export function useTranslations(locale: Locale) {
  const t = translations[locale] || translations[defaultLocale];
  
  return function getTranslation(key: string, options?: { silent?: boolean }): string {
    const keys = key.split('.');
    let value: unknown = t;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Log warning in development mode, unless explicitly silenced
        if (import.meta.env.DEV && !options?.silent) {
          console.warn(`[i18n] Missing translation: "${key}" for locale "${locale}"`);
        }
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
}



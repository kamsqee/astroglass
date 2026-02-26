/**
 * Locale Configuration
 *
 * Metadata for all supported locales. Which locales are *enabled*
 * is determined by `astroglass.config.json` via config-loader.
 *
 * To add a new locale:
 * 1. Add an entry to the `localesConfig` array
 * 2. Create the corresponding JSON files in `src/locales/{code}/`
 * 3. Add the locale code to `astroglass.config.json` → locales[]
 */

import { config } from './config-loader';

export interface LocaleConfig {
  /** ISO 639-1 language code (e.g., 'en', 'ru', 'kk') */
  code: string;
  /** English name of the language */
  name: string;
  /** Native name of the language (displayed in language switcher) */
  nativeName: string;
  /** Emoji flag for the language */
  flag: string;
  /** Text direction: 'ltr' for left-to-right, 'rtl' for right-to-left */
  direction: 'ltr' | 'rtl';
  /** Whether this locale is currently enabled */
  enabled: boolean;
}

/**
 * All supported locales
 * 
 * Set `enabled: false` to disable a locale without deleting its files.
 * This is useful for locales that are still being translated.
 */
export const localesConfig: LocaleConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    enabled: true,
  },
  {
    code: 'kk',
    name: 'Kazakh',
    nativeName: 'Қазақша',
    flag: '🇰🇿',
    direction: 'ltr',
    enabled: true,
  },
];

/** Default locale code */
export const defaultLocale = 'en';

/** Get all enabled locales (gated by astroglass.config.json) */
export function getEnabledLocales(): LocaleConfig[] {
  return localesConfig.filter((locale) => config.locales.includes(locale.code));
}

/** Get locale codes for enabled locales (for Astro config) */
export function getEnabledLocaleCodes(): string[] {
  return getEnabledLocales().map((locale) => locale.code);
}

/** Get locale config by code */
export function getLocaleByCode(code: string): LocaleConfig | undefined {
  return localesConfig.find((locale) => locale.code === code);
}

/** Check if a locale code is valid and enabled */
export function isValidLocale(code: string): boolean {
  return getEnabledLocales().some((locale) => locale.code === code);
}

/** Type for enabled locale codes */
export type Locale = (typeof localesConfig)[number]['code'];

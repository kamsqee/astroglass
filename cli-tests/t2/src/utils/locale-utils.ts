import { 
  defaultLocale, 
  getEnabledLocaleCodes,
  type Locale 
} from '../config/locales';

export const locales = getEnabledLocaleCodes() as unknown as readonly Locale[];

/**
 * Get the locale from a URL pathname
 */
export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (locales.includes(lang as Locale)) {
    return lang as Locale;
  }
  return defaultLocale as Locale;
}


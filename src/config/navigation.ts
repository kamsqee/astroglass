/**
 * Navigation Configuration
 * 
 * Feature-aware navigation — reads enabled features from astroglass.config.json
 * to conditionally include/exclude nav links (Blog, Docs, etc.).
 * 
 * When only 1 theme is selected, the Home dropdown is hidden since
 * there are no other landing pages to navigate to.
 * 
 * All theme pages use scroll-to-section links (#about, #services, etc.)
 * for on-page sections, plus conditional page links for Blog and Docs.
 */

import { hasFeature, isMultiTheme, isSingleTheme } from './config-loader';
import { getEnabledThemeIds } from './themes';

export interface NavIcon {
  readonly paths: string[] | readonly string[];
  strokeWidth?: number;
}

// Default icons for common nav items
export const navIcons = {
  home: {
    paths: ['M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],
    strokeWidth: 1.75,
  },
  about: {
    paths: ['M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'],
    strokeWidth: 1.75,
  },
  services: {
    paths: ['M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172L8 4z'],
    strokeWidth: 1.75,
  },
  resources: {
    paths: ['M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'],
    strokeWidth: 1.75,
  },
  contact: {
    paths: ['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
    strokeWidth: 1.75,
  },
  pricing: {
    paths: ['M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'],
    strokeWidth: 1.75,
  },
  portfolio: {
    paths: ['M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'],
    strokeWidth: 1.75,
  },
  faq: {
    paths: ['M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'],
    strokeWidth: 1.75,
  },
} as const;

/** Theme display metadata for nav dropdowns (icons per theme) */
const themeIcons: Record<string, string> = {
  liquid: '💧',
  glass: '🔮',
  neo: '⚡',
  luxury: '✨',
  minimal: '○',
  aurora: '🌌',
};

/**
 * Build landing pages list from config-gated enabled themes.
 */
function getLandingPages() {
  return getEnabledThemeIds().map(id => ({
    id,
    labelKey: `nav.theme${id.charAt(0).toUpperCase() + id.slice(1)}`,
    icon: themeIcons[id] || '🎨',
  }));
}

// ─── Feature-conditional page links ─────────────────────────────

/** Build page links (Blog, Docs) based on enabled features */
function buildPageLinks(t: (key: string) => string): ResolvedNavLink[] {
  const links: ResolvedNavLink[] = [];

  if (hasFeature('blog')) {
    links.push({
      href: `/blog`,
      label: t('nav.blog'),
      icon: navIcons.resources,
    });
  }

  if (hasFeature('docs')) {
    links.push({
      href: `/docs`,
      label: t('nav.docs'),
      icon: navIcons.resources,
    });
  }

  return links;
}

/** Build page links for Luxury nav (different interface) */
function buildLuxuryPageLinks(t: (key: string) => string): LuxuryNavLink[] {
  const links: LuxuryNavLink[] = [];

  if (hasFeature('blog')) {
    links.push({
      label: t('nav.blog'),
      href: `/blog`,
      type: 'page',
    });
  }

  if (hasFeature('docs')) {
    links.push({
      label: t('nav.docs'),
      href: `/docs`,
      type: 'page',
    });
  }

  return links;
}

// ─── Resolved types (returned from build functions) ─────────────

export interface ResolvedNavChild {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

export interface ResolvedNavLink {
  href?: string;
  label: string;
  icon: NavIcon;
  children?: ResolvedNavChild[];
}

/**
 * Build nav links for themes with a Home dropdown (Neo, Liquid, Glass, Aurora).
 * 
 * Home dropdown is only shown when multiple themes are enabled.
 * Blog/Docs links are only shown when those features are enabled.
 */
export function buildThemeNavLinks(
  t: (key: string) => string,
  theme: string
): ResolvedNavLink[] {

  // Mode-aware base: in single-theme mode, sections live at /#section
  const themeBase = isSingleTheme ? '' : `/${theme}`;
  const links: ResolvedNavLink[] = [];

  // Home dropdown — only when multiple themes
  if (isMultiTheme) {
    const homeChildren: ResolvedNavChild[] = getLandingPages().map((page) => {
      const child: ResolvedNavChild = {
        href: `/${page.id}`,
        label: t(page.labelKey) || page.id.charAt(0).toUpperCase() + page.id.slice(1),
      };

      // For Liquid theme: add portfolio sub-pages under each landing page
      if (theme === 'liquid') {
        child.children = [
          {
            href: `/${page.id}/portfolio`,
            label: t('nav.portfolio'),
          }
        ];
      }

      return child;
    });

    links.push({
      label: t('nav.home'),
      icon: navIcons.home,
      children: homeChildren,
    });
  }

  // Section scroll links
  links.push(
    { href: `${themeBase}#about`, label: t('nav.about'), icon: navIcons.about },
    { href: `${themeBase}#services`, label: t('nav.services'), icon: navIcons.services },
    { href: `${themeBase}#portfolio`, label: t('nav.portfolio'), icon: navIcons.portfolio },
    { href: `${themeBase}#pricing`, label: t('nav.pricing'), icon: navIcons.pricing },
    { href: `${themeBase}#faq`, label: t('nav.faq'), icon: navIcons.faq },
    { href: `${themeBase}#contact`, label: t('nav.contact'), icon: navIcons.contact },
  );

  // Feature-conditional page links
  links.push(...buildPageLinks(t));

  return links;
}

/**
 * Build simple nav links for Minimal theme (no Home dropdown).
 * Just scroll-to-section links + conditional Blog/Docs.
 */
export function buildMinimalNavLinks(
  t: (key: string) => string
): ResolvedNavLink[] {

  // Mode-aware base: in single-theme mode, sections live at /#section
  const themeBase = isSingleTheme ? '' : '/minimal';

  return [
    { href: `${themeBase}#about`, label: t('nav.about'), icon: navIcons.about },
    { href: `${themeBase}#services`, label: t('nav.services'), icon: navIcons.services },
    { href: `${themeBase}#portfolio`, label: t('nav.portfolio'), icon: navIcons.portfolio },
    { href: `${themeBase}#pricing`, label: t('nav.pricing'), icon: navIcons.pricing },
    { href: `${themeBase}#faq`, label: t('nav.faq'), icon: navIcons.faq },
    { href: `${themeBase}#contact`, label: t('nav.contact'), icon: navIcons.contact },
    ...buildPageLinks(t),
  ];
}

/**
 * Build nav links for default / non-theme pages (index, blog, docs, etc.).
 * 
 * Home dropdown is only shown when multiple themes are enabled.
 * Blog/Docs links are only shown when those features are enabled.
 */
export function buildDefaultNavLinks(
  t: (key: string) => string
): ResolvedNavLink[] {
  
  const links: ResolvedNavLink[] = [];

  // Home dropdown — only when multiple themes
  if (isMultiTheme) {
    const homeChildren: ResolvedNavChild[] = getLandingPages().map((page) => ({
      href: `/${page.id}`,
      label: t(page.labelKey) || page.id.charAt(0).toUpperCase() + page.id.slice(1),
    }));

    links.push({
      label: t('nav.home'),
      icon: navIcons.home,
      children: homeChildren,
    });
  }

  // Index page scroll sections
  links.push(
    { href: `/#showcase`, label: t('nav.features'), icon: navIcons.services },
    { href: `/#get-started`, label: t('nav.getStarted'), icon: navIcons.contact },
    { href: `/#faq-home`, label: t('nav.faq'), icon: navIcons.faq },
  );

  // Feature-conditional page links
  links.push(...buildPageLinks(t));

  return links;
}

// ─── Luxury theme navigation (merged from luxuryNavigation.ts) ──

export interface LuxuryNavLink {
  label: string;
  href: string;
  type: 'section' | 'page'; // 'section' = scroll, 'page' = route
  icon?: NavIcon; // Optional icon for mobile
}

export function buildLuxuryNavLinks(
  t: (key: string) => string
): LuxuryNavLink[] {

  // Mode-aware base: in single-theme mode, sections live at /#section
  const themeBase = isSingleTheme ? '' : '/luxury';

  return [
    { label: t('nav.about'), href: `${themeBase}#about`, type: 'section' },
    { label: t('nav.services'), href: `${themeBase}#services`, type: 'section' },
    { label: t('nav.portfolio'), href: `${themeBase}#portfolio`, type: 'section' },
    { label: t('nav.pricing'), href: `${themeBase}#pricing`, type: 'section' },
    { label: t('nav.faq'), href: `${themeBase}#faq`, type: 'section' },
    { label: t('nav.contact'), href: `${themeBase}#contact`, type: 'section' },
    ...buildLuxuryPageLinks(t),
  ];
}

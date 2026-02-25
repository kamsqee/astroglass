/**
 * Theme Presets — Section Layout Configuration
 *
 * Controls which sections each theme renders and in what order.
 * This replaces the hard-coded section sequence that was previously
 * embedded in the JSX of pages/[theme].astro.
 *
 * REORDERING SECTIONS FOR A THEME:
 *   Change the order of keys in landingSections[].
 *
 * DISABLING A SECTION FOR ONE THEME:
 *   Remove its key from that theme's landingSections[].
 *
 * ENABLING A SECTION FOR ONE THEME:
 *   Add its key to that theme's landingSections[].
 *   Ensure the section component is exported from the theme's barrel file.
 *
 * Section components are resolved from each theme's barrel file at
 * src/components/sections/themes/{theme}.ts — if a key is listed here
 * but not exported by the barrel file, that slot is silently skipped.
 */

import type { SectionKey } from './sectionRegistry';

/** The ordered list of section keys to render inside <main> on the landing page. */
export interface ThemePreset {
  landingSections: SectionKey[];
}

export const themePresets: Record<string, ThemePreset> = {
  liquid: {
    landingSections: [
      'Hero',
      'About',
      'Features',
      'Portfolio',
      'Pricing',
      'Testimonial',
      'FAQ',
      'CTA',
      'Contact',
    ],
  },

  glass: {
    landingSections: [
      'Hero',
      'About',
      'Features',
      'Portfolio',
      'Pricing',
      'Testimonial',
      'FAQ',
      'CTA',
      'Contact',
    ],
  },

  neo: {
    landingSections: [
      'Hero',
      'About',
      'Features',
      'Portfolio',
      'Pricing',
      'Testimonial',
      'FAQ',
      'CTA',
      'Contact',
    ],
  },

  luxury: {
    landingSections: [
      'Hero',
      'About',
      'Features',
      'Portfolio',
      'Pricing',
      'Testimonial',
      'FAQ',
      'CTA',
      'Contact',
    ],
  },

  minimal: {
    landingSections: [
      'Hero',
      'About',
      'Features',
      'Portfolio',
      'Pricing',
      'Testimonial',
      'FAQ',
      'CTA',
      'Contact',
    ],
  },

  aurora: {
    landingSections: [
      'Hero',
      'About',
      'Features',
      'Portfolio',
      'Pricing',
      'Testimonial',
      'FAQ',
      'CTA',
      'Contact',
    ],
  },
};

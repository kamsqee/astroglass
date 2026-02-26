/**
 * Section Registry — Type Definitions
 *
 * Defines the canonical set of section slot keys and the shape that
 * every theme barrel file (src/components/sections/themes/{theme}.ts)
 * must satisfy.
 *
 * ADDING A NEW SECTION TYPE:
 *   1. Add its key to SectionKey below.
 *   2. Export it from each theme barrel file that implements it.
 *   3. Add it to the manifest's landingSections[] in src/config/manifests/{theme}.ts.
 *
 * ADDING A NEW THEME:
 *   1. Create src/config/manifests/{theme}.ts (theme manifest)
 *   2. Register it in src/config/themes.ts → allThemes[]
 *   3. Create src/components/sections/themes/{theme}.ts (barrel file)
 */

/** Keys for section slots that appear inside <main> on the landing page. */
export type SectionKey =
  | 'Hero'
  | 'About'
  | 'Features'
  | 'Portfolio'
  | 'Testimonial'
  | 'Pricing'
  | 'FAQ'
  | 'CTA'
  | 'Contact';

/** Keys for structural layout sections (wrap <main>, always rendered). */
export type LayoutKey = 'Header' | 'Footer';

/** Key for the standalone portfolio page component. */
export type PageKey = 'PortfolioPage';

/** Union of all registerable section keys. */
export type AnyKey = SectionKey | LayoutKey | PageKey;

/**
 * The shape that every theme barrel file must satisfy.
 * All SectionKey exports are optional — if a theme omits a section,
 * it simply won't appear in that theme's preset.
 * Header, Footer, and PortfolioPage are required for a complete theme.
 */
export type ThemeSections = Partial<Record<SectionKey, unknown>> & {
  Header: unknown;
  Footer: unknown;
  PortfolioPage: unknown;
};

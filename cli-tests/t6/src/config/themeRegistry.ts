/**
 * Theme Registry — CLI File Manifests
 *
 * Lists every file that belongs to each theme so the CLI
 * can surgically prune themes the user doesn't select.
 * This file is only consumed by the CLI (tree-shaken in production builds).
 *
 * Pattern: each theme entry lists all files that should be REMOVED
 * when that theme is pruned from the project.
 */

export interface ThemeManifest {
  /** Theme barrel file (exports section components) */
  barrel: string;
  /** Section components (.astro) */
  sections: string[];
  /** Theme-specific CSS files */
  css: string[];
  /** Header + sidebar components */
  header: string[];
  /** Footer component(s) */
  footer: string[];
  /** Theme-specific UI primitives (directories or files) */
  ui: string[];
  /** Theme-specific scripts */
  scripts: string[];
  /** Theme-specific design token files */
  tokens: string[];
  /** npm packages only this theme needs */
  npmDeps: string[];
}

const SECTIONS = 'src/components/sections';
const STYLES = 'src/styles/components';
const HEADER = 'src/components/layout/header';
const UI = 'src/components/ui';

/**
 * Complete file manifest for every theme.
 * The CLI iterates over unselected themes and removes all listed paths.
 */
export const themeRegistry: Record<string, ThemeManifest> = {
  liquid: {
    barrel: `${SECTIONS}/themes/liquid.ts`,
    sections: [
      `${SECTIONS}/hero/HeroLiquid.astro`,
      `${SECTIONS}/about/AboutLiquid.astro`,
      `${SECTIONS}/features/FeaturesLiquid.astro`,
      `${SECTIONS}/portfolio/PortfolioLiquid.astro`,
      `${SECTIONS}/pricing/PricingLiquid.astro`,
      `${SECTIONS}/testimonial/TestimonialLiquid.astro`,
      `${SECTIONS}/faq/FAQLiquid.astro`,
      `${SECTIONS}/cta/CTALiquid.astro`,
      `${SECTIONS}/contact/ContactLiquid.astro`,
    ],
    css: [
      `${STYLES}/hero/HeroLiquid.css`,
      `${STYLES}/about/AboutLiquid.css`,
      `${STYLES}/features/FeaturesLiquid.css`,
      `${STYLES}/portfolio/PortfolioLiquid.css`,
      `${STYLES}/pricing/PricingLiquid.css`,
      `${STYLES}/testimonial/TestimonialLiquid.css`,
      `${STYLES}/faq/FAQLiquid.css`,
      `${STYLES}/cta/CTALiquid.css`,
      `${STYLES}/contact/ContactLiquid.css`,
      `${STYLES}/footer/FooterLiquid.css`,
    ],
    header: [
      `${HEADER}/HeaderLiquid.astro`,
    ],
    footer: [
      `${SECTIONS}/footer/FooterLiquid.astro`,
    ],
    ui: [
      `${UI}/liquid/LiquidSectionTag.astro`,
    ],
    scripts: [],
    tokens: [
      'src/styles/tokens/liquid.css',
    ],
    npmDeps: [],
  },

  glass: {
    barrel: `${SECTIONS}/themes/glass.ts`,
    sections: [
      `${SECTIONS}/hero/HeroGlass.astro`,
      `${SECTIONS}/about/AboutGlass.astro`,
      `${SECTIONS}/features/FeaturesGlass.astro`,
      `${SECTIONS}/portfolio/PortfolioGlass.astro`,
      `${SECTIONS}/pricing/PricingGlass.astro`,
      `${SECTIONS}/testimonial/TestimonialGlass.astro`,
      `${SECTIONS}/faq/FAQGlass.astro`,
      `${SECTIONS}/cta/CTAGlass.astro`,
      `${SECTIONS}/contact/ContactGlass.astro`,
    ],
    css: [
      `${STYLES}/hero/HeroGlass.css`,
      `${STYLES}/about/AboutGlass.css`,
      `${STYLES}/features/FeaturesGlass.css`,
      `${STYLES}/portfolio/PortfolioGlass.css`,
      `${STYLES}/pricing/PricingGlass.css`,
      `${STYLES}/testimonial/TestimonialGlass.css`,
      `${STYLES}/faq/FAQGlass.css`,
      `${STYLES}/cta/CTAGlass.css`,
      `${STYLES}/contact/ContactGlass.css`,
      `${STYLES}/footer/FooterGlass.css`,
      `${STYLES}/header/HeaderGlass.css`,
    ],
    header: [
      `${HEADER}/HeaderGlass.astro`,
    ],
    footer: [
      `${SECTIONS}/footer/FooterGlass.astro`,
    ],
    ui: [
      `${UI}/glass/SectionHeading.astro`,
      `${UI}/glass/SectionTag.astro`,
    ],
    scripts: [],
    tokens: [
      'src/styles/tokens/glass.css',
    ],
    npmDeps: [],
  },

  neo: {
    barrel: `${SECTIONS}/themes/neo.ts`,
    sections: [
      `${SECTIONS}/hero/HeroNeo.astro`,
      `${SECTIONS}/about/AboutNeo.astro`,
      `${SECTIONS}/features/FeaturesNeo.astro`,
      `${SECTIONS}/portfolio/PortfolioNeo.astro`,
      `${SECTIONS}/pricing/PricingNeo.astro`,
      `${SECTIONS}/testimonial/TestimonialNeo.astro`,
      `${SECTIONS}/faq/FAQNeo.astro`,
      `${SECTIONS}/cta/CTANeo.astro`,
      `${SECTIONS}/contact/ContactNeo.astro`,
    ],
    css: [
      `${STYLES}/hero/HeroNeo.css`,
      `${STYLES}/about/AboutNeo.css`,
      `${STYLES}/features/FeaturesNeo.css`,
      `${STYLES}/portfolio/PortfolioNeo.css`,
      `${STYLES}/pricing/PricingNeo.css`,
      `${STYLES}/testimonial/TestimonialNeo.css`,
      `${STYLES}/faq/FAQNeo.css`,
      `${STYLES}/cta/CTANeo.css`,
      `${STYLES}/contact/ContactNeo.css`,
      `${STYLES}/footer/FooterNeo.css`,
      `${STYLES}/header/HeaderNeo.css`,
    ],
    header: [
      `${HEADER}/HeaderNeo.astro`,
    ],
    footer: [
      `${SECTIONS}/footer/FooterNeo.astro`,
    ],
    ui: [
      `${UI}/neo/NeoSectionTag.astro`,
    ],
    scripts: [],
    tokens: [],
    npmDeps: [],
  },

  luxury: {
    barrel: `${SECTIONS}/themes/luxury.ts`,
    sections: [
      `${SECTIONS}/hero/HeroLuxury.astro`,
      `${SECTIONS}/about/AboutLuxury.astro`,
      `${SECTIONS}/features/FeaturesLuxury.astro`,
      `${SECTIONS}/portfolio/PortfolioLuxury.astro`,
      `${SECTIONS}/pricing/PricingLuxury.astro`,
      `${SECTIONS}/testimonial/TestimonialLuxury.astro`,
      `${SECTIONS}/faq/FAQLuxury.astro`,
      `${SECTIONS}/cta/CTALuxury.astro`,
      `${SECTIONS}/contact/ContactLuxury.astro`,
    ],
    css: [
      `${STYLES}/hero/HeroLuxury.css`,
      `${STYLES}/about/AboutLuxury.css`,
      `${STYLES}/features/FeaturesLuxury.css`,
      `${STYLES}/portfolio/PortfolioLuxury.css`,
      `${STYLES}/pricing/PricingLuxury.css`,
      `${STYLES}/testimonial/TestimonialLuxury.css`,
      `${STYLES}/faq/FAQLuxury.css`,
      `${STYLES}/cta/CTALuxury.css`,
      `${STYLES}/contact/ContactLuxury.css`,
      `${STYLES}/footer/FooterLuxury.css`,
      `${STYLES}/header/HeaderLuxury.css`,
    ],
    header: [
      `${HEADER}/HeaderLuxury.astro`,
      `${HEADER}/HeaderDesktopLuxury.astro`,
      `${HEADER}/SidebarStructureLuxury.astro`,
      `${HEADER}/DesktopControlsLuxury.astro`,
    ],
    footer: [
      `${SECTIONS}/footer/FooterLuxury.astro`,
    ],
    ui: [
      `${UI}/luxury/LuxuryButton.astro`,
      `${UI}/luxury/LuxuryCard.astro`,
      `${UI}/luxury/LuxurySectionLabel.astro`,
    ],
    scripts: [
      'src/scripts/luxury-interactions.js',
    ],
    tokens: [
      'src/styles/tokens/luxury.css',
    ],
    npmDeps: [],
  },

  minimal: {
    barrel: `${SECTIONS}/themes/minimal.ts`,
    sections: [
      `${SECTIONS}/hero/HeroMinimal.astro`,
      `${SECTIONS}/about/AboutMinimal.astro`,
      `${SECTIONS}/features/FeaturesMinimal.astro`,
      `${SECTIONS}/portfolio/PortfolioMinimal.astro`,
      `${SECTIONS}/pricing/PricingMinimal.astro`,
      `${SECTIONS}/testimonial/TestimonialMinimal.astro`,
      `${SECTIONS}/faq/FAQMinimal.astro`,
      `${SECTIONS}/cta/CTAMinimal.astro`,
      `${SECTIONS}/contact/ContactMinimal.astro`,
    ],
    css: [
      `${STYLES}/hero/HeroMinimal.css`,
      `${STYLES}/about/AboutMinimal.css`,
      `${STYLES}/features/FeaturesMinimal.css`,
      `${STYLES}/portfolio/PortfolioMinimal.css`,
      `${STYLES}/pricing/PricingMinimal.css`,
      `${STYLES}/testimonial/TestimonialMinimal.css`,
      `${STYLES}/faq/FAQMinimal.css`,
      `${STYLES}/cta/CTAMinimal.css`,
      `${STYLES}/contact/ContactMinimal.css`,
      `${STYLES}/footer/FooterMinimal.css`,
      `${STYLES}/header/HeaderMinimal.css`,
    ],
    header: [
      `${HEADER}/HeaderMinimal.astro`,
    ],
    footer: [
      `${SECTIONS}/footer/FooterMinimal.astro`,
    ],
    ui: [],
    scripts: [],
    tokens: [
      'src/styles/tokens/minimal.css',
    ],
    npmDeps: [],
  },

  aurora: {
    barrel: `${SECTIONS}/themes/aurora.ts`,
    sections: [
      `${SECTIONS}/hero/HeroAurora.astro`,
      `${SECTIONS}/about/AboutAurora.astro`,
      `${SECTIONS}/features/FeaturesAurora.astro`,
      `${SECTIONS}/portfolio/PortfolioAurora.astro`,
      `${SECTIONS}/pricing/PricingAurora.astro`,
      `${SECTIONS}/testimonial/TestimonialAurora.astro`,
      `${SECTIONS}/faq/FAQAurora.astro`,
      `${SECTIONS}/cta/CTAAurora.astro`,
      `${SECTIONS}/contact/ContactAurora.astro`,
    ],
    css: [
      `${STYLES}/hero/HeroAurora.css`,
      `${STYLES}/about/AboutAurora.css`,
      `${STYLES}/features/FeaturesAurora.css`,
      `${STYLES}/portfolio/PortfolioAurora.css`,
      `${STYLES}/pricing/PricingAurora.css`,
      `${STYLES}/testimonial/TestimonialAurora.css`,
      `${STYLES}/faq/FAQAurora.css`,
      `${STYLES}/cta/CTAAurora.css`,
      `${STYLES}/contact/ContactAurora.css`,
      `${STYLES}/footer/FooterAurora.css`,
      `${STYLES}/header/HeaderAurora.css`,
    ],
    header: [
      `${HEADER}/HeaderAurora.astro`,
    ],
    footer: [
      `${SECTIONS}/footer/FooterAurora.astro`,
    ],
    ui: [],
    scripts: [],
    tokens: [],
    npmDeps: [],
  },
};

// ============================================
// Helper Functions
// ============================================

/** Get all theme IDs */
export function getThemeIds(): string[] {
  return Object.keys(themeRegistry);
}

/** Get all files for a given theme (flat list) */
export function getThemeFiles(themeId: string): string[] {
  const m = themeRegistry[themeId];
  if (!m) return [];
  return [
    m.barrel,
    ...m.sections,
    ...m.css,
    ...m.header,
    ...m.footer,
    ...m.ui,
    ...m.scripts,
    ...m.tokens,
  ];
}

/** Get npm deps that are exclusive to specific themes */
export function getExclusiveNpmDeps(selectedThemes: string[]): string[] {
  const allDeps = new Set<string>();
  const selectedDeps = new Set<string>();

  for (const [id, manifest] of Object.entries(themeRegistry)) {
    for (const dep of manifest.npmDeps) {
      allDeps.add(dep);
      if (selectedThemes.includes(id)) {
        selectedDeps.add(dep);
      }
    }
  }

  // Return deps that are NOT needed by selected themes
  return [...allDeps].filter(d => !selectedDeps.has(d));
}

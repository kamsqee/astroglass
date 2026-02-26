/**
 * Prune Themes — remove all files belonging to unselected themes
 *
 * Uses the themeRegistry from the downloaded template to know exactly
 * which files to delete for each unselected theme.
 *
 * NOTE: We intentionally do NOT prune src/styles/components/ CSS files
 * because shared components (HeroHome.astro, etc.) may import them.
 * CSS tree-shaking happens at build time anyway.
 */
import { join } from 'node:path';
import { rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import fg from 'fast-glob';

/**
 * Barrel files that must be STUBBED (replaced with empty re-exports)
 * rather than deleted. Pages like [theme].astro, index.astro, and
 * NotFoundPage.astro import all barrel files statically — deleting
 * them causes "Cannot find module" errors at build time.
 */
const BARREL_FILES: Record<string, string> = {
  liquid:  'src/components/sections/themes/liquid.ts',
  glass:   'src/components/sections/themes/glass.ts',
  neo:     'src/components/sections/themes/neo.ts',
  luxury:  'src/components/sections/themes/luxury.ts',
  minimal: 'src/components/sections/themes/minimal.ts',
  aurora:  'src/components/sections/themes/aurora.ts',
};

// Theme → file manifest (hardcoded to avoid importing from the template at build time)
const THEME_FILES: Record<string, string[]> = {
  liquid: [
    'src/components/sections/themes/liquid.ts',
    'src/components/sections/hero/HeroLiquid.astro',
    'src/components/sections/about/AboutLiquid.astro',
    'src/components/sections/features/FeaturesLiquid.astro',
    'src/components/sections/portfolio/PortfolioLiquid.astro',
    'src/components/sections/pricing/PricingLiquid.astro',
    'src/components/sections/testimonial/TestimonialLiquid.astro',
    'src/components/sections/faq/FAQLiquid.astro',
    'src/components/sections/cta/CTALiquid.astro',
    'src/components/sections/contact/ContactLiquid.astro',
    'src/components/sections/footer/FooterLiquid.astro',
    'src/components/layout/header/HeaderLiquid.astro',
    'src/components/pages/portfolio/PortfolioPageLiquid.astro',
    'src/components/pages/portfolio/liquid/',
    'src/components/ui/liquid/',
    'src/styles/tokens/liquid.css',
  ],
  glass: [
    'src/components/sections/themes/glass.ts',
    'src/components/sections/hero/HeroGlass.astro',
    'src/components/sections/about/AboutGlass.astro',
    'src/components/sections/features/FeaturesGlass.astro',
    'src/components/sections/portfolio/PortfolioGlass.astro',
    'src/components/sections/pricing/PricingGlass.astro',
    'src/components/sections/testimonial/TestimonialGlass.astro',
    'src/components/sections/faq/FAQGlass.astro',
    'src/components/sections/cta/CTAGlass.astro',
    'src/components/sections/contact/ContactGlass.astro',
    'src/components/sections/footer/FooterGlass.astro',
    'src/components/layout/header/HeaderGlass.astro',
    'src/components/pages/portfolio/PortfolioPageGlass.astro',
    'src/components/pages/portfolio/glass/',
    'src/components/ui/glass/',
    'src/styles/tokens/glass.css',
  ],
  neo: [
    'src/components/sections/themes/neo.ts',
    'src/components/sections/hero/HeroNeo.astro',
    'src/components/sections/about/AboutNeo.astro',
    'src/components/sections/features/FeaturesNeo.astro',
    'src/components/sections/portfolio/PortfolioNeo.astro',
    'src/components/sections/pricing/PricingNeo.astro',
    'src/components/sections/testimonial/TestimonialNeo.astro',
    'src/components/sections/faq/FAQNeo.astro',
    'src/components/sections/cta/CTANeo.astro',
    'src/components/sections/contact/ContactNeo.astro',
    'src/components/sections/footer/FooterNeo.astro',
    'src/components/layout/header/HeaderNeo.astro',
    'src/components/pages/portfolio/PortfolioPageNeo.astro',
    'src/components/pages/portfolio/neo/',
    'src/components/ui/neo/',
  ],
  luxury: [
    'src/components/sections/themes/luxury.ts',
    'src/components/sections/hero/HeroLuxury.astro',
    'src/components/sections/about/AboutLuxury.astro',
    'src/components/sections/features/FeaturesLuxury.astro',
    'src/components/sections/portfolio/PortfolioLuxury.astro',
    'src/components/sections/pricing/PricingLuxury.astro',
    'src/components/sections/testimonial/TestimonialLuxury.astro',
    'src/components/sections/faq/FAQLuxury.astro',
    'src/components/sections/cta/CTALuxury.astro',
    'src/components/sections/contact/ContactLuxury.astro',
    'src/components/sections/footer/FooterLuxury.astro',
    'src/components/layout/header/HeaderLuxury.astro',
    'src/components/layout/header/HeaderDesktopLuxury.astro',
    'src/components/layout/header/SidebarStructureLuxury.astro',
    'src/components/layout/header/DesktopControlsLuxury.astro',
    'src/components/pages/portfolio/PortfolioPageLuxury.astro',
    'src/components/pages/portfolio/luxury/',
    'src/components/ui/luxury/',
    'src/scripts/luxury-interactions.js',
    'src/styles/_luxury-interactions.css',
    'src/styles/tokens/luxury.css',
  ],
  minimal: [
    'src/components/sections/themes/minimal.ts',
    'src/components/sections/hero/HeroMinimal.astro',
    'src/components/sections/about/AboutMinimal.astro',
    'src/components/sections/features/FeaturesMinimal.astro',
    'src/components/sections/portfolio/PortfolioMinimal.astro',
    'src/components/sections/pricing/PricingMinimal.astro',
    'src/components/sections/testimonial/TestimonialMinimal.astro',
    'src/components/sections/faq/FAQMinimal.astro',
    'src/components/sections/cta/CTAMinimal.astro',
    'src/components/sections/contact/ContactMinimal.astro',
    'src/components/sections/footer/FooterMinimal.astro',
    'src/components/layout/header/HeaderMinimal.astro',
    'src/components/pages/portfolio/PortfolioPageMinimal.astro',
    'src/components/pages/portfolio/minimal/',
    'src/styles/tokens/minimal.css',
  ],
  aurora: [
    'src/components/sections/themes/aurora.ts',
    'src/components/sections/hero/HeroAurora.astro',
    'src/components/sections/about/AboutAurora.astro',
    'src/components/sections/features/FeaturesAurora.astro',
    'src/components/sections/portfolio/PortfolioAurora.astro',
    'src/components/sections/pricing/PricingAurora.astro',
    'src/components/sections/testimonial/TestimonialAurora.astro',
    'src/components/sections/faq/FAQAurora.astro',
    'src/components/sections/cta/CTAAurora.astro',
    'src/components/sections/contact/ContactAurora.astro',
    'src/components/sections/footer/FooterAurora.astro',
    'src/components/layout/header/HeaderAurora.astro',
    'src/components/pages/portfolio/PortfolioPageAurora.astro',
    'src/components/pages/portfolio/aurora/',
  ],
};

const ALL_THEMES = Object.keys(THEME_FILES);

export async function pruneThemes(
  projectPath: string,
  selectedThemes: string[],
  dryRun: boolean
): Promise<{ removed: number }> {
  const unselected = ALL_THEMES.filter(t => !selectedThemes.includes(t));
  let removed = 0;

  for (const theme of unselected) {
    const files = THEME_FILES[theme] || [];
    const barrelFile = BARREL_FILES[theme];

    for (const file of files) {
      const fullPath = join(projectPath, file);

      if (dryRun) {
        console.log(`  [dry-run] Would ${file === barrelFile ? 'stub' : 'remove'}: ${file}`);
        removed++;
        continue;
      }

      try {
        if (existsSync(fullPath)) {
          if (file === barrelFile) {
            // Stub barrel files so static imports resolve — the module
            // exports nothing, causing section lookups to return undefined.
            await writeFile(fullPath, '// Pruned theme — empty stub\nexport {};\n');
          } else {
            await rm(fullPath, { recursive: true, force: true });
          }
          removed++;
        }
      } catch {
        // File already removed or doesn't exist
      }
    }
  }

  // Also remove unselected themes from themePresets.ts and themeRegistry.ts
  // These hub files are regenerated anyway, so no patching needed here

  return { removed };
}

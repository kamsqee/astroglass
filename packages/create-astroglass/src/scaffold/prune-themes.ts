/**
 * Prune Themes — remove all files belonging to unselected themes
 *
 * Uses the themeRegistry from the downloaded template to know exactly
 * which files to delete for each unselected theme.
 */
import { join } from 'node:path';
import { rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import fg from 'fast-glob';

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
    'src/components/ui/liquid/',
    'src/styles/components/hero/HeroLiquid.css',
    'src/styles/components/about/AboutLiquid.css',
    'src/styles/components/features/FeaturesLiquid.css',
    'src/styles/components/portfolio/PortfolioLiquid.css',
    'src/styles/components/pricing/PricingLiquid.css',
    'src/styles/components/testimonial/TestimonialLiquid.css',
    'src/styles/components/faq/FAQLiquid.css',
    'src/styles/components/cta/CTALiquid.css',
    'src/styles/components/contact/ContactLiquid.css',
    'src/styles/components/footer/FooterLiquid.css',
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
    'src/components/ui/glass/',
    'src/styles/components/hero/HeroGlass.css',
    'src/styles/components/about/AboutGlass.css',
    'src/styles/components/features/FeaturesGlass.css',
    'src/styles/components/portfolio/PortfolioGlass.css',
    'src/styles/components/pricing/PricingGlass.css',
    'src/styles/components/testimonial/TestimonialGlass.css',
    'src/styles/components/faq/FAQGlass.css',
    'src/styles/components/cta/CTAGlass.css',
    'src/styles/components/contact/ContactGlass.css',
    'src/styles/components/footer/FooterGlass.css',
    'src/styles/components/header/HeaderGlass.css',
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
    'src/components/ui/neo/',
    'src/styles/components/hero/HeroNeo.css',
    'src/styles/components/about/AboutNeo.css',
    'src/styles/components/features/FeaturesNeo.css',
    'src/styles/components/portfolio/PortfolioNeo.css',
    'src/styles/components/pricing/PricingNeo.css',
    'src/styles/components/testimonial/TestimonialNeo.css',
    'src/styles/components/faq/FAQNeo.css',
    'src/styles/components/cta/CTANeo.css',
    'src/styles/components/contact/ContactNeo.css',
    'src/styles/components/footer/FooterNeo.css',
    'src/styles/components/header/HeaderNeo.css',
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
    'src/components/ui/luxury/',
    'src/scripts/luxury-interactions.js',
    'src/styles/components/hero/HeroLuxury.css',
    'src/styles/components/about/AboutLuxury.css',
    'src/styles/components/features/FeaturesLuxury.css',
    'src/styles/components/portfolio/PortfolioLuxury.css',
    'src/styles/components/pricing/PricingLuxury.css',
    'src/styles/components/testimonial/TestimonialLuxury.css',
    'src/styles/components/faq/FAQLuxury.css',
    'src/styles/components/cta/CTALuxury.css',
    'src/styles/components/contact/ContactLuxury.css',
    'src/styles/components/footer/FooterLuxury.css',
    'src/styles/components/header/HeaderLuxury.css',
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
    'src/styles/components/hero/HeroMinimal.css',
    'src/styles/components/about/AboutMinimal.css',
    'src/styles/components/features/FeaturesMinimal.css',
    'src/styles/components/portfolio/PortfolioMinimal.css',
    'src/styles/components/pricing/PricingMinimal.css',
    'src/styles/components/testimonial/TestimonialMinimal.css',
    'src/styles/components/faq/FAQMinimal.css',
    'src/styles/components/cta/CTAMinimal.css',
    'src/styles/components/contact/ContactMinimal.css',
    'src/styles/components/footer/FooterMinimal.css',
    'src/styles/components/header/HeaderMinimal.css',
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
    'src/styles/components/hero/HeroAurora.css',
    'src/styles/components/about/AboutAurora.css',
    'src/styles/components/features/FeaturesAurora.css',
    'src/styles/components/portfolio/PortfolioAurora.css',
    'src/styles/components/pricing/PricingAurora.css',
    'src/styles/components/testimonial/TestimonialAurora.css',
    'src/styles/components/faq/FAQAurora.css',
    'src/styles/components/cta/CTAAurora.css',
    'src/styles/components/contact/ContactAurora.css',
    'src/styles/components/footer/FooterAurora.css',
    'src/styles/components/header/HeaderAurora.css',
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
    for (const file of files) {
      const fullPath = join(projectPath, file);

      if (dryRun) {
        console.log(`  [dry-run] Would remove: ${file}`);
        removed++;
        continue;
      }

      try {
        if (existsSync(fullPath)) {
          await rm(fullPath, { recursive: true, force: true });
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

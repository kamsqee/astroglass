import type { ThemeManifest } from '../theme-manifest';

const SECTIONS = 'src/components/sections';
const STYLES = 'src/styles/components';
const HEADER = 'src/components/layout/header';
const UI = 'src/components/ui';

export const luxuryManifest: ThemeManifest = {
  id: 'luxury',
  name: 'Luxury',
  icon: '✨',
  color: 'from-amber-500 to-orange-400',
  description: 'Premium, sophisticated aesthetic',
  premium: true,

  landingSections: [
    'Hero', 'About', 'Features', 'Portfolio',
    'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact',
  ],

  headerVersion: 4,

  files: {
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
    footer: [`${SECTIONS}/footer/FooterLuxury.astro`],
    ui: [
      `${UI}/luxury/LuxuryButton.astro`,
      `${UI}/luxury/LuxuryCard.astro`,
      `${UI}/luxury/LuxurySectionLabel.astro`,
    ],
    scripts: ['src/scripts/luxury-interactions.js'],
    tokens: ['src/styles/tokens/luxury.css'],
    npmDeps: [],
  },
};

import type { ThemeManifest } from '../theme-manifest';

const SECTIONS = 'src/components/sections';
const STYLES = 'src/styles/components';
const HEADER = 'src/components/layout/header';

export const minimalManifest: ThemeManifest = {
  id: 'minimal',
  name: 'Minimal',
  icon: '○',
  color: 'from-gray-500 to-slate-400',
  description: 'Clean, focused design with essential elements',
  premium: false,

  landingSections: [
    'Hero', 'About', 'Features', 'Portfolio',
    'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact',
  ],

  headerVersion: 5,

  files: {
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
    header: [`${HEADER}/HeaderMinimal.astro`],
    footer: [`${SECTIONS}/footer/FooterMinimal.astro`],
    ui: [],
    scripts: [],
    tokens: ['src/styles/tokens/minimal.css'],
    npmDeps: [],
  },
};

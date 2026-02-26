import type { ThemeManifest } from '../theme-manifest';

const SECTIONS = 'src/components/sections';
const STYLES = 'src/styles/components';
const HEADER = 'src/components/layout/header';
const UI = 'src/components/ui';

export const glassManifest: ThemeManifest = {
  id: 'glass',
  name: 'Glass',
  icon: '🔮',
  color: 'from-purple-500 to-pink-400',
  description: 'Glassmorphism with depth and transparency',
  premium: false,

  landingSections: [
    'Hero', 'About', 'Features', 'Portfolio',
    'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact',
  ],

  headerVersion: 2,

  files: {
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
    header: [`${HEADER}/HeaderGlass.astro`],
    footer: [`${SECTIONS}/footer/FooterGlass.astro`],
    ui: [
      `${UI}/glass/SectionHeading.astro`,
      `${UI}/glass/SectionTag.astro`,
    ],
    scripts: [],
    tokens: ['src/styles/tokens/glass.css'],
    npmDeps: [],
  },
};

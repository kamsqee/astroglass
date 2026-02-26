import type { ThemeManifest } from '../theme-manifest';

const SECTIONS = 'src/components/sections';
const STYLES = 'src/styles/components';
const HEADER = 'src/components/layout/header';
const UI = 'src/components/ui';

export const neoManifest: ThemeManifest = {
  id: 'neo',
  name: 'Neo',
  icon: '⚡',
  color: 'from-green-500 to-emerald-400',
  description: 'Bold, energetic design with dynamic elements',
  premium: false,

  landingSections: [
    'Hero', 'About', 'Features', 'Portfolio',
    'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact',
  ],

  headerVersion: 3,

  files: {
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
    header: [`${HEADER}/HeaderNeo.astro`],
    footer: [`${SECTIONS}/footer/FooterNeo.astro`],
    ui: [`${UI}/neo/NeoSectionTag.astro`],
    scripts: [],
    tokens: [],
    npmDeps: [],
  },
};

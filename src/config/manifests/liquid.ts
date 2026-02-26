import type { ThemeManifest } from '../theme-manifest';

const SECTIONS = 'src/components/sections';
const STYLES = 'src/styles/components';
const HEADER = 'src/components/layout/header';
const UI = 'src/components/ui';

export const liquidManifest: ThemeManifest = {
  id: 'liquid',
  name: 'Liquid',
  icon: '💧',
  color: 'from-blue-500 to-cyan-400',
  description: 'Fluid, organic design with smooth animations',
  premium: false,

  landingSections: [
    'Hero', 'About', 'Features', 'Portfolio',
    'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact',
  ],

  headerVersion: 1,

  files: {
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
    header: [`${HEADER}/HeaderLiquid.astro`],
    footer: [`${SECTIONS}/footer/FooterLiquid.astro`],
    ui: [`${UI}/liquid/LiquidSectionTag.astro`],
    scripts: [],
    tokens: ['src/styles/tokens/liquid.css'],
    npmDeps: [],
  },
};

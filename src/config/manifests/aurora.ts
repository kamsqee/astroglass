import type { ThemeManifest } from '../theme-manifest';

const SECTIONS = 'src/components/sections';
const STYLES = 'src/styles/components';
const HEADER = 'src/components/layout/header';

export const auroraManifest: ThemeManifest = {
  id: 'aurora',
  name: 'Aurora',
  icon: '🌌',
  color: 'from-violet-500 to-teal-400',
  description: 'Immersive, gradient-mesh-rich design with geometric structure',
  premium: true,

  landingSections: [
    'Hero', 'About', 'Features', 'Portfolio',
    'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact',
  ],

  headerVersion: 3,

  files: {
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
    header: [`${HEADER}/HeaderAurora.astro`],
    footer: [`${SECTIONS}/footer/FooterAurora.astro`],
    ui: [],
    scripts: [],
    tokens: [],
    npmDeps: [],
  },
};

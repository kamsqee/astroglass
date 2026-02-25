/**
 * Type Declarations for Theme Barrel Files
 *
 * Astro component re-exports from .ts barrel files don't resolve
 * at type-check time. These ambient module declarations give TypeScript
 * the shape it needs so that we can avoid @ts-ignore on every import.
 *
 * Each barrel exports Astro components under canonical SectionKey names.
 * At runtime Astro resolves these correctly — this file only exists for DX.
 */

declare module '*/sections/themes/liquid' {
  const Header: any;
  const Footer: any;
  const Hero: any;
  const About: any;
  const Features: any;
  const Portfolio: any;
  const Testimonial: any;
  const Pricing: any;
  const FAQ: any;
  const CTA: any;
  const Contact: any;
  const PortfolioPage: any;
}

declare module '*/sections/themes/glass' {
  const Header: any;
  const Footer: any;
  const Hero: any;
  const About: any;
  const Features: any;
  const Portfolio: any;
  const Testimonial: any;
  const Pricing: any;
  const FAQ: any;
  const CTA: any;
  const Contact: any;
  const PortfolioPage: any;
}

declare module '*/sections/themes/neo' {
  const Header: any;
  const Footer: any;
  const Hero: any;
  const About: any;
  const Features: any;
  const Portfolio: any;
  const Testimonial: any;
  const Pricing: any;
  const FAQ: any;
  const CTA: any;
  const Contact: any;
  const PortfolioPage: any;
}

declare module '*/sections/themes/luxury' {
  const Header: any;
  const Footer: any;
  const Hero: any;
  const About: any;
  const Features: any;
  const Portfolio: any;
  const Testimonial: any;
  const Pricing: any;
  const FAQ: any;
  const CTA: any;
  const Contact: any;
  const PortfolioPage: any;
}

declare module '*/sections/themes/minimal' {
  const Header: any;
  const Footer: any;
  const Hero: any;
  const About: any;
  const Features: any;
  const Portfolio: any;
  const Testimonial: any;
  const Pricing: any;
  const FAQ: any;
  const CTA: any;
  const Contact: any;
  const PortfolioPage: any;
}

declare module '*/sections/themes/aurora' {
  const Header: any;
  const Footer: any;
  const Hero: any;
  const About: any;
  const Features: any;
  const Portfolio: any;
  const Testimonial: any;
  const Pricing: any;
  const FAQ: any;
  const CTA: any;
  const Contact: any;
  const PortfolioPage: any;
}

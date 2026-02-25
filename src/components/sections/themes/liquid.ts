/// <reference types="astro/client" />
/**
 * Liquid Theme — Section Barrel
 *
 * Re-exports all Liquid theme section components under canonical SectionKey names.
 * This is the single source of truth for which components implement each slot
 * for the Liquid theme.
 *
 * To add a new section to Liquid:
 *   1. Create the component (e.g. NewSectionLiquid.astro)
 *   2. Add the export below
 *   3. Add the key to themePresets.ts → liquid.landingSections
 */

export { default as Header }       from '../../layout/header/HeaderLiquid.astro';
export { default as Footer }       from '../footer/FooterLiquid.astro';
export { default as Hero }         from '../hero/HeroLiquid.astro';
export { default as About }        from '../about/AboutLiquid.astro';
export { default as Features }     from '../features/FeaturesLiquid.astro';
export { default as Portfolio }    from '../portfolio/PortfolioLiquid.astro';
export { default as Testimonial }  from '../testimonial/TestimonialLiquid.astro';
export { default as Pricing }      from '../pricing/PricingLiquid.astro';
export { default as FAQ }          from '../faq/FAQLiquid.astro';
export { default as CTA }          from '../cta/CTALiquid.astro';
export { default as Contact }      from '../contact/ContactLiquid.astro';
export { default as PortfolioPage } from '../../pages/portfolio/PortfolioPageLiquid.astro';

/**
 * Static Provider Configuration
 * 
 * No adapter needed for static site generation.
 * Astro will pre-render all pages at build time.
 * 
 * @see https://docs.astro.build/en/guides/deploy/
 */

/** No adapter needed for static output */
export const adapter = undefined;

/** Output mode for static */
export const output = 'static' as const;

/** Provider name for display */
export const providerName = 'Static';

/** Provider-specific build notes */
export const buildNotes = `
  Deploy the dist/ folder to any static hosting provider
  (GitHub Pages, Cloudflare Pages, Netlify, Vercel, etc.)
`;

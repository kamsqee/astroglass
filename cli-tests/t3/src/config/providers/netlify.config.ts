/**
 * Netlify Provider Configuration
 * 
 * Astro adapter configuration for Netlify deployment.
 * 
 * NOTE: To use this provider:
 * 1. Install the adapter: pnpm add @astrojs/netlify
 * 2. Update active-provider.ts to export from this file
 * 
 * @see https://docs.astro.build/en/guides/deploy/netlify/
 */

// Uncomment after installing @astrojs/netlify
// import netlify from '@astrojs/netlify';

/** 
 * Netlify adapter
 * Uncomment after installing @astrojs/netlify
 */
// export const adapter = netlify();

/** Placeholder adapter - replace after installing @astrojs/netlify */
export const adapter = undefined;

/** Output mode for Netlify */
export const output = 'static' as const;

/** Provider name for display */
export const providerName = 'Netlify';

/** Provider-specific build notes */
export const buildNotes = `
  Deploy to Netlify using:
    netlify deploy --prod
  
  Or connect your repository to Netlify for automatic deployments.
  
  To enable this provider:
    1. pnpm add @astrojs/netlify
    2. Uncomment the adapter import and export in this file
    3. Update active-provider.ts to use './netlify.config'
`;

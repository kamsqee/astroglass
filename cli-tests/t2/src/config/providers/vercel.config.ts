/**
 * Vercel Provider Configuration
 * 
 * Astro adapter configuration for Vercel deployment.
 * 
 * NOTE: To use this provider:
 * 1. Install the adapter: pnpm add @astrojs/vercel
 * 2. Update active-provider.ts to export from this file
 * 
 * @see https://docs.astro.build/en/guides/deploy/vercel/
 */

// Uncomment after installing @astrojs/vercel
// import vercel from '@astrojs/vercel';

/** 
 * Vercel adapter
 * Uncomment after installing @astrojs/vercel
 */
// export const adapter = vercel({
//   imageService: true,
// });

/** Placeholder adapter - replace after installing @astrojs/vercel */
export const adapter = undefined;

/** Output mode for Vercel (static or hybrid) */
export const output = 'static' as const;

/** Provider name for display */
export const providerName = 'Vercel';

/** Provider-specific build notes */
export const buildNotes = `
  Deploy to Vercel using:
    vercel deploy
  
  Or connect your repository to Vercel for automatic deployments.
  
  To enable this provider:
    1. pnpm add @astrojs/vercel
    2. Uncomment the adapter import and export in this file
    3. Update active-provider.ts to use './vercel.config'
`;

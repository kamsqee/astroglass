/**
 * Cloudflare Provider Configuration
 * 
 * Astro adapter configuration for Cloudflare Pages deployment.
 * 
 * @see https://docs.astro.build/en/guides/deploy/cloudflare/
 */

import cloudflare from '@astrojs/cloudflare';

/** Cloudflare adapter with image service */
export const adapter = cloudflare({
  imageService: 'compile',
});

/** Output mode for Cloudflare */
export const output = 'static' as const;

/** Provider name for display */
export const providerName = 'Cloudflare Pages';

/** Provider-specific build notes */
export const buildNotes = `
  Deploy to Cloudflare Pages automatically by configuring GitHub integration.
  (Local deploy with wrangler is no longer required)
`;

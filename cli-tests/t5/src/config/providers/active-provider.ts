
/**
 * Active Provider Configuration
 * 
 * This file exports the currently active cloud provider configuration.
 * Change the import path to switch between providers.
 * 
 * Available providers:
 * - './cloudflare.config' (default)
 * - './vercel.config' (requires @astrojs/vercel)
 * - './netlify.config' (requires @astrojs/netlify)
 */

export { adapter, output, providerName, buildNotes } from './netlify.config';

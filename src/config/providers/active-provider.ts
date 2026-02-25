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
 * 
 * To switch providers:
 * 1. Install the required adapter package
 * 2. Uncomment the adapter in the provider config file
 * 3. Change the import below to the desired provider
 */

export { adapter, output, providerName, buildNotes } from './cloudflare.config';

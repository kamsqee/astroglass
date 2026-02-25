/**
 * Astro Page Lifecycle Utility
 *
 * Provides safe registration of page init functions that work
 * correctly with Astro's View Transitions (client-side navigation).
 *
 * Fixes the listener accumulation bug where each navigation adds
 * a new `astro:after-swap` listener without removing the old one,
 * and handles Astro script module evaluation skipping.
 */

/**
 * Register a page init function with safe astro:page-load handling.
 *
 * - Uses `astro:page-load` to run reliably on initial load and every navigation.
 * - Passes an `AbortSignal` to the init payload for listeners.
 * - Triggers `.abort()` on navigation away (`astro:before-swap`).
 */
export function registerAstroPage(initFn: (signal?: AbortSignal) => void): void {
  let controller: AbortController | null = null;

  document.addEventListener('astro:page-load', () => {
    // Ensure any stale controller is aborted
    if (controller) controller.abort();
    
    controller = new AbortController();
    initFn(controller.signal);
  });

  document.addEventListener('astro:before-swap', () => {
    if (controller) {
      controller.abort();
      controller = null;
    }
  });
}

/**
 * Scroll Reveal Animation Utility
 *
 * Provides a reusable IntersectionObserver-based scroll reveal
 * that adds a visibility class when elements enter the viewport.
 * Replaces 6 identical observer blocks across portfolio pages.
 */

export interface ScrollRevealOptions {
  /** IntersectionObserver threshold (default: 0.1) */
  threshold?: number;
  /** IntersectionObserver rootMargin (default: '0px 0px -40px 0px') */
  rootMargin?: string;
  /** Stagger delay between elements in ms (default: 0 = no stagger) */
  staggerMs?: number;
  /** Class to add when element is visible (default: 'is-visible') */
  visibleClass?: string;
  /** Optional signal to automatically disconnect observer */
  signal?: AbortSignal;
}

/**
 * Observe elements matching `selector` and add a class when they
 * enter the viewport. Optionally applies staggered transition delays.
 *
 * @returns The IntersectionObserver instance (for manual cleanup if needed)
 */
export function initScrollReveal(
  selector: string,
  options: ScrollRevealOptions = {}
): IntersectionObserver {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -40px 0px',
    staggerMs = 0,
    visibleClass = 'is-visible',
    signal,
  } = options;

  const elements = document.querySelectorAll<HTMLElement>(selector);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(visibleClass);
        }
      });
    },
    { threshold, rootMargin }
  );

  elements.forEach((el, i) => {
    if (staggerMs > 0) {
      el.style.transitionDelay = `${i * staggerMs}ms`;
    }
    observer.observe(el);
  });

  if (signal) {
    signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  }

  return observer;
}

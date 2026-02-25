/**
 * Portfolio Shared Behavior Utilities
 *
 * Extracts the category filter logic and expand/collapse detail panel
 * logic shared across all 6 portfolio pages.
 *
 * Uses AbortController instead of the cloneNode anti-pattern for
 * clean listener deduplication on Astro page re-initialization.
 */

// ─── Category Filter ────────────────────────────────────────────

export interface CategoryFilterConfig {
  /** ID of the filters container element */
  filtersId: string;
  /** CSS selector for the filterable card/item elements */
  cardSelector: string;
  /** Classes to add to the active filter button */
  activeClasses: string[];
  /** Classes to add to inactive filter buttons */
  inactiveClasses: string[];
  /** Optional callback after a filter is applied */
  onFilter?: (filter: string) => void;
  /**
   * Transform applied to cards when hiding (default: 'translateY(20px)').
   * Set to a custom value like 'scale(0.95)' for different themes.
   */
  hideTransform?: string;
  /** Delay in ms before swapping display (default: 400) */
  fadeOutMs?: number;
  /**
   * If true, uses a two-step animation: fade out everything first,
   * then swap display and fade matching items back in.
   * Used by Luxury, Minimal, Aurora themes.
   */
  twoStepAnimation?: boolean;
  /**
   * If provided, target this child selector inside each card for the
   * opacity/transform animation instead of the card itself.
   * Used by Minimal theme which animates `.c-portfolio-page-minimal__row`.
   */
  animateChildSelector?: string;
  /** Signal for cleanup string View Transitions */
  signal?: AbortSignal;
}

/**
 * A helper to track animation timeouts to prevent race conditions during rapid clicks.
 */
const timeoutRegistry = new WeakMap<HTMLElement, NodeJS.Timeout>();

function clearElementTimeout(el: HTMLElement) {
  if (timeoutRegistry.has(el)) {
    clearTimeout(timeoutRegistry.get(el));
    timeoutRegistry.delete(el);
  }
}

function setElementTimeout(el: HTMLElement, fn: () => void, ms: number) {
  clearElementTimeout(el);
  const id = setTimeout(() => {
    fn();
    timeoutRegistry.delete(el);
  }, ms);
  timeoutRegistry.set(el, id);
}

/**
 * Filter DOM items based on category. Will use document.startViewTransition 
 * for layout morphing if supported, otherwise degrades gracefully.
 */
function applyFilterLogic(
  filter: string,
  config: CategoryFilterConfig
) {
  const {
    cardSelector,
    hideTransform = 'translateY(20px)',
    twoStepAnimation = false,
    animateChildSelector,
  } = config;
  
  // Attempt to fetch from CSS vars, fallback to config or 400
  let fadeOutMs = config.fadeOutMs;
  if (!fadeOutMs) {
    const rawVal = getComputedStyle(document.documentElement).getPropertyValue('--duration-normal').trim();
    fadeOutMs = parseInt(rawVal.replace('ms', '')) || 400;
  }

  const cards = document.querySelectorAll<HTMLElement>(cardSelector);

  if (twoStepAnimation) {
    // Step 1: Fade out all items
    cards.forEach((card) => {
      const target = animateChildSelector
        ? card.querySelector<HTMLElement>(animateChildSelector)
        : card;
      if (target) {
        target.style.opacity = '0';
        target.style.transform = hideTransform;
      }
    });

    // Step 2: After fade-out, swap display and reveal matching
    setTimeout(() => {
      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        const target = animateChildSelector
          ? card.querySelector<HTMLElement>(animateChildSelector)
          : card;

        if (filter === 'all' || category === filter) {
          card.style.display = '';
          if (target) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                target.style.opacity = '1';
                target.style.transform = '';
              });
            });
          }
        } else {
          card.style.display = 'none';
        }
      });
    }, fadeOutMs < 400 ? fadeOutMs : 300);
  } else {
    // Simple show/hide with transition fallback (no startViewTransition)
    cards.forEach((card) => {
      clearElementTimeout(card);
      
      const category = card.getAttribute('data-category');
      const isMatch = filter === 'all' || category === filter;

      if (isMatch) {
        card.style.display = '';
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = '';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = hideTransform;
        
        setElementTimeout(
          card,
          () => {
            card.style.display = 'none';
          },
          fadeOutMs
        );
      }
    });
  }
}

/**
 * Wire up category filter buttons to show/hide project cards.
 */
export function initCategoryFilter(config: CategoryFilterConfig): void {
  const {
    filtersId,
    activeClasses,
    inactiveClasses,
    onFilter,
    signal,
  } = config;

  const filters = document.getElementById(filtersId);
  if (!filters) return;

  const handleClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('button[data-filter]');
    if (!btn) return;

    // Update active state on all filter buttons
    filters.querySelectorAll<HTMLElement>('button').forEach((b) => {
      [...activeClasses, ...inactiveClasses].forEach((cls) => b.classList.remove(cls));
      inactiveClasses.forEach((cls) => b.classList.add(cls));
    });
    
    // Mark clicked button as active
    inactiveClasses.forEach((cls) => btn.classList.remove(cls));
    activeClasses.forEach((cls) => btn.classList.add(cls));

    const filter = btn.getAttribute('data-filter') || 'all';
    if (onFilter) onFilter(filter);

    // Use native View Transitions API if supported to prevent layout jumping
    if (!config.twoStepAnimation && document.startViewTransition) {
      // Find a suitable parent container or default to the first card's parent
      const firstCard = document.querySelector<HTMLElement>(config.cardSelector);
      const container = firstCard ? firstCard.parentElement : null;

      if (container) {
        // Isolate the view transition purely to the portfolio grid instead of whole page
        container.style.viewTransitionName = 'portfolio-grid';
        
        const transition = document.startViewTransition(() => {
          applyFilterLogic(filter, { ...config, fadeOutMs: 0 }); 
        });

        // Cleanup constraint after transition completes
        transition.finished.finally(() => {
          container.style.viewTransitionName = '';
        });
      } else {
        document.startViewTransition(() => {
          applyFilterLogic(filter, { ...config, fadeOutMs: 0 }); 
        });
      }
    } else {
      applyFilterLogic(filter, config);
    }
  };

  filters.addEventListener('click', handleClick, { signal });
}

// ─── Detail Panel Expand/Collapse ───────────────────────────────

export interface DetailPanelConfig {
  /** Selector for toggle buttons, e.g. '[data-toggle-details]' */
  toggleSelector: string;
  /** Selector for close buttons, e.g. '[data-close-details]' */
  closeSelector: string;
  /** CSS class used on expanded panels */
  expandedClass?: string;
  /** Selector for the detail panel container class (for closing "all others") */
  panelBaseSelector: string;
  /** Selector for the card/item ancestor (used for scroll-back on close) */
  cardSelector: string;
  /** Optional signal from registerAstroPage */
  signal?: AbortSignal;
}

/**
 * Wire up expand/collapse behavior for inline detail panels.
 *
 * Used by Liquid, Neo, and Minimal portfolio pages (themes with
 * inline expandable panels rather than modals).
 */
export function initDetailPanels(config: DetailPanelConfig): void {
  const {
    toggleSelector,
    closeSelector,
    expandedClass = 'is-expanded',
    panelBaseSelector,
    cardSelector,
    signal,
  } = config;

  // Toggle buttons
  document.querySelectorAll<HTMLElement>(toggleSelector).forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const projectId = btn.getAttribute('data-toggle-details');
        const panel = document.querySelector<HTMLElement>(`[data-details="${projectId}"]`);
        if (!panel) return;

        const isExpanded = panel.classList.contains(expandedClass);

        // Close all other panels first
        document.querySelectorAll(`${panelBaseSelector}.${expandedClass}`).forEach((p) => {
          if (p !== panel) p.classList.remove(expandedClass);
        });

        if (isExpanded) {
          panel.classList.remove(expandedClass);
        } else {
          panel.classList.add(expandedClass);
          setTimeout(() => {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      },
      { signal }
    );
  });

  // Close buttons
  document.querySelectorAll<HTMLElement>(closeSelector).forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const projectId = btn.getAttribute('data-close-details');
        const panel = document.querySelector<HTMLElement>(`[data-details="${projectId}"]`);
        if (panel) {
          panel.classList.remove(expandedClass);
          const card = panel.closest(cardSelector);
          if (card) {
            setTimeout(() => {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        }
      },
      { signal }
    );
  });
}

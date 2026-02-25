/**
 * Nav Overflow Utility
 * 
 * Automatically moves nav items that don't fit into a "More ▼" dropdown.
 * Works with any header theme by accepting CSS selectors via config.
 * 
 * The approach:
 * 1. Make all items visible + un-shrinkable (flex-shrink: 0)
 * 2. Measure the total width of all items
 * 3. Compare against the nav container's available width
 * 4. Hide items from the right until the total fits
 * 5. Show those hidden items inside the "More" dropdown
 */

export interface NavOverflowConfig {
  /** Selector for the <nav> container */
  navSelector: string;
  /** Selector for direct nav items (links + dropdown wrappers) relative to nav */
  itemSelector: string;
  /** Selector for the "More" dropdown wrapper */
  moreSelector: string;
  /** Selector for the menu inside the "More" dropdown */
  moreMenuSelector: string;
  /** AbortController signal for cleanup */
  signal?: AbortSignal;
}

export function initNavOverflow(config: NavOverflowConfig) {
  const nav = document.querySelector(config.navSelector) as HTMLElement | null;
  if (!nav) return;

  const moreWrapper = nav.querySelector(config.moreSelector) as HTMLElement | null;
  const moreMenu = nav.querySelector(config.moreMenuSelector) as HTMLElement | null;
  if (!moreWrapper || !moreMenu) return;

  const moreTrigger = moreWrapper.querySelector('button') as HTMLElement | null;

  function getNavItems(): HTMLElement[] {
    return Array.from(nav!.querySelectorAll(config.itemSelector)).filter(
      (el) => el !== moreWrapper && !moreWrapper!.contains(el)
    ) as HTMLElement[];
  }

  function recalculate() {
    const items = getNavItems();
    if (items.length === 0) return;

    // 1. Reset: show all items, force natural widths
    items.forEach((item) => {
      item.style.display = '';
      item.style.flexShrink = '0';
      item.style.whiteSpace = 'nowrap';
      item.removeAttribute('data-overflow-hidden');
    });
    moreWrapper!.style.display = 'none';  // Inline none
    moreMenu!.innerHTML = '';

    // 2. Force the nav to not wrap and measure
    const originalFlexWrap = nav!.style.flexWrap;
    const originalOverflow = nav!.style.overflow;
    nav!.style.flexWrap = 'nowrap';
    nav!.style.overflow = 'hidden';

    // 3. Get available width (nav's current constrained width from its flex parent)
    const navWidth = nav!.clientWidth;

    // 4. Measure the More button width
    moreWrapper!.style.display = 'flex';  // Override CSS display:none
    moreWrapper!.style.flexShrink = '0';
    moreWrapper!.style.whiteSpace = 'nowrap';
    const moreWidth = moreWrapper!.offsetWidth;
    moreWrapper!.style.display = 'none';  // Re-hide after measuring

    // 5. Get gap
    const gap = parseFloat(getComputedStyle(nav!).gap) || 0;

    // 6. Measure each item's natural width
    const itemWidths: number[] = items.map((item) => item.offsetWidth);

    // 7. Calculate total width used
    let totalUsed = 0;
    for (let i = 0; i < items.length; i++) {
      totalUsed += itemWidths[i];
      if (i > 0) totalUsed += gap;
    }

    // 8. If everything fits, restore and exit
    if (totalUsed <= navWidth) {
      nav!.style.flexWrap = originalFlexWrap;
      nav!.style.overflow = originalOverflow;
      items.forEach((item) => {
        item.style.flexShrink = '';
        item.style.whiteSpace = '';
      });
      return;
    }

    // 9. Items overflow — find the cutoff point
    // Budget = navWidth - moreButton - gap(for more button)
    const budget = navWidth - moreWidth - gap;
    let usedWidth = 0;
    let overflowStartIndex = -1;

    for (let i = 0; i < items.length; i++) {
      const gapWidth = i > 0 ? gap : 0;
      usedWidth += gapWidth + itemWidths[i];

      if (usedWidth > budget) {
        overflowStartIndex = i;
        break;
      }
    }

    // Edge case: even the first item doesn't fit
    if (overflowStartIndex === -1 && totalUsed > navWidth) {
      overflowStartIndex = 0;
    }

    if (overflowStartIndex === -1) {
      // Shouldn't happen, but restore
      nav!.style.flexWrap = originalFlexWrap;
      nav!.style.overflow = originalOverflow;
      items.forEach((item) => {
        item.style.flexShrink = '';
        item.style.whiteSpace = '';
      });
      return;
    }

    // 10. Hide overflowed items and show More
    moreWrapper!.style.display = 'flex';  // Override CSS display:none

    for (let i = overflowStartIndex; i < items.length; i++) {
      items[i].style.display = 'none';
      items[i].setAttribute('data-overflow-hidden', 'true');

      // Clone into More menu
      if (items[i].tagName === 'A' || (items[i].querySelector(':scope > a') && !items[i].querySelector('button'))) {
        // Simple link item
        const link = items[i].tagName === 'A' ? items[i] as HTMLAnchorElement : items[i].querySelector('a') as HTMLAnchorElement;
        if (link) {
          const menuItem = document.createElement('a');
          menuItem.href = link.getAttribute('href') || '#';
          menuItem.textContent = link.textContent?.trim() || '';
          menuItem.className = 'nav-more-menu-item';
          moreMenu!.appendChild(menuItem);
        }
      } else if (items[i].querySelector('button')) {
        // Dropdown item — add heading + child links
        const trigger = items[i].querySelector('button');
        const dropdownMenu = items[i].querySelector('[class*="dropdown-"][class*="-menu"]') ||
                             items[i].querySelector('.dropdown-menu');
        
        if (trigger) {
          const childLinks = dropdownMenu?.querySelectorAll('a') || [];
          if (childLinks.length > 0) {
            const divider = document.createElement('div');
            divider.className = 'nav-more-menu-divider';
            divider.textContent = trigger.textContent?.trim().replace(/[\n\r]/g, '').replace(/\s+/g, ' ') || '';
            moreMenu!.appendChild(divider);

            childLinks.forEach((childLink) => {
              const menuItem = document.createElement('a');
              menuItem.href = childLink.getAttribute('href') || '#';
              menuItem.textContent = childLink.textContent?.trim() || '';
              menuItem.className = 'nav-more-menu-item nav-more-menu-subitem';
              moreMenu!.appendChild(menuItem);
            });
          } else {
            // Dropdown with no children links — just add trigger text
            const menuItem = document.createElement('span');
            menuItem.textContent = trigger.textContent?.trim().replace(/[\n\r]/g, '').replace(/\s+/g, ' ') || '';
            menuItem.className = 'nav-more-menu-item';
            moreMenu!.appendChild(menuItem);
          }
        }
      }
    }

    // Restore nav overflow style (keep nowrap so visible items don't wrap)
    nav!.style.flexWrap = 'nowrap';
    nav!.style.overflow = 'visible'; // So More dropdown can be positioned
  }

  // Toggle the More dropdown open/close
  if (moreTrigger) {
    moreTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      moreWrapper!.classList.toggle('is-open');
    }, { signal: config.signal });
  }

  // Close on outside click
  document.addEventListener('click', () => {
    moreWrapper!.classList.remove('is-open');
  }, { signal: config.signal });

  // Run on init
  recalculate();

  // Re-run on resize (debounced)
  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(recalculate, 80);
  }, { signal: config.signal });
}

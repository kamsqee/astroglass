/**
 * Theme Manifest — Unified Type Definition
 *
 * A ThemeManifest is the single source of truth for everything about a theme:
 * identity, layout order, header resolution, and CLI file pruning data.
 *
 * Previously this information was split across three files:
 *   - themes.ts          (id, name, color, icon, etc.)
 *   - themePresets.ts     (landingSections order)
 *   - themeRegistry.ts    (file paths for CLI pruning)
 *
 * Now each theme declares everything about itself in one manifest file
 * at src/config/manifests/{theme}.ts.
 */

import type { SectionKey } from './sectionRegistry';

export interface ThemeManifest {
  // ── Identity ────────────────────────────────────────────────
  /** Unique theme identifier (used in URLs and component names) */
  id: string;
  /** Display name */
  name: string;
  /** Emoji icon for the theme */
  icon: string;
  /** Tailwind gradient classes for demo card backgrounds */
  color: string;
  /** Short description of the theme */
  description: string;
  /** Whether this is a premium theme (for marketplace filtering) */
  premium: boolean;

  // ── Layout ──────────────────────────────────────────────────
  /** Ordered list of sections rendered inside <main> on the landing page */
  landingSections: SectionKey[];

  // ── Header Resolution ───────────────────────────────────────
  /**
   * Which BaseLayout header to use for non-theme pages (blog, docs, etc.)
   * when this theme is the primary theme:
   *   1 = HeaderLiquid, 2 = HeaderGlass, 3 = HeaderDefault,
   *   4 = HeaderLuxury, 5 = HeaderMinimal
   */
  headerVersion: 1 | 2 | 3 | 4 | 5;

  // ── File Manifest (CLI only — tree-shaken in prod) ──────────
  /** All files belonging to this theme, used by the CLI for pruning */
  files: {
    barrel: string;
    sections: string[];
    css: string[];
    header: string[];
    footer: string[];
    ui: string[];
    scripts: string[];
    tokens: string[];
    npmDeps: string[];
  };
}

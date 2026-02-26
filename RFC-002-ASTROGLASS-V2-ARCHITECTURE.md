# RFC-002: AstroGlass v2.0 — Architectural Redesign

| Field         | Value                                      |
|---------------|--------------------------------------------|
| **RFC**       | 002                                        |
| **Title**     | AstroGlass v2.0 Re-Architecture            |
| **Status**    | Draft                                      |
| **Authors**   | AstroGlass Core Team                       |
| **Created**   | 2026-02-26                                 |
| **Requires**  | Breaking changes to config, CLI, and runtime |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Root Cause Analysis](#2-root-cause-analysis)
3. [Systemic Design Failures vs Surface Bugs](#3-systemic-design-failures-vs-surface-bugs)
4. [Architectural Principles for v2.0](#4-architectural-principles-for-v20)
5. [Proposed Target Architecture](#5-proposed-target-architecture)
6. [Config Hydration Layer Design](#6-config-hydration-layer-design)
7. [Unified Theme Registry Model](#7-unified-theme-registry-model)
8. [Explicit Routing Model Specification](#8-explicit-routing-model-specification)
9. [Navigation System Redesign](#9-navigation-system-redesign)
10. [Palette System Redesign](#10-palette-system-redesign)
11. [Feature Gating Strategy](#11-feature-gating-strategy)
12. [Locale System Redesign](#12-locale-system-redesign)
13. [CLI Architecture Redesign](#13-cli-architecture-redesign)
14. [CI/CD & GitHub Pages Preview Matrix Design](#14-cicd--github-pages-preview-matrix-design)
15. [Migration Plan](#15-migration-plan)
16. [Risk Analysis](#16-risk-analysis)
17. [Backward Compatibility Strategy](#17-backward-compatibility-strategy)
18. [Long-Term Scalability Considerations](#18-long-term-scalability-considerations)

---

## 1. Executive Summary

AstroGlass is a multi-theme Astro template system distributed via `npm create astroglass@latest`. It currently supports 6 themes, 10 palettes, 7 locales, and 4 optional features (blog, docs, dashboard, react). Users scaffold a project by selecting a subset of these dimensions through a CLI wizard.

**The system is architecturally broken.** The CLI generates `astroglass.config.json` reflecting user selections, but the runtime overwhelmingly ignores it. Static registries (`themes.ts`, `locales.ts`, `themeRegistry.ts`, `themePresets.ts`, `palettes.ts`) define hardcoded arrays with `enabled: true` on all entries. The result is a systemic mismatch between what the CLI prunes and what the runtime assumes exists.

This is not a collection of isolated bugs. It is a fundamental absence of a configuration consumption layer. Every downstream defect — broken section links, phantom theme dropdowns, 404 page header mismatches, palette black-screening, footer links to non-existent features — traces back to this single root failure: **the runtime has no config gate**.

This RFC proposes a complete re-architecture across 5 phases that introduces:

- A **config hydration layer** as a single source of truth consumed by all runtime subsystems
- A **unified theme manifest** merging the current three-file duplication into a self-describing model
- An **explicit routing model** with formally defined single-theme, multi-theme, and demo modes
- A **first-class palette system** decoupled from header version and data-theme scoping
- A **feature gating strategy** enforced at both build-time and runtime
- A **CI/CD preview matrix** that deploys representative combinations to GitHub Pages for visual verification

---

## 2. Root Cause Analysis

### 2.1 The Config Gap

The CLI writes `astroglass.config.json` at scaffold time:

```json
{
  "version": "1.0.0",
  "themes": ["glass"],
  "palettes": ["azure", "abyss"],
  "locales": ["en"],
  "features": ["blog"],
  "deployTarget": "static",
  "defaultPalette": "azure"
}
```

The runtime ignores this file almost entirely. Only `navigation.ts` partially reads it (for `hasFeature()` and `isMultiTheme()` checks). Every other registry — `themes.ts`, `locales.ts`, `themePresets.ts`, `palettes.ts` — operates from hardcoded arrays where all entries are always enabled.

**Evidence chain:**

| File | What It Does | Does It Read Config? |
|------|-------------|---------------------|
| `src/config/themes.ts:101-103` | `getEnabledThemes()` filters by `theme.enabled` field — always `true` for all 6 | No |
| `src/config/locales.ts:97-99` | `getEnabledLocales()` filters by `locale.enabled` — always `true` for all 7 | No |
| `src/config/themeRegistry.ts:300-302` | `getThemeIds()` returns `Object.keys()` of all 6 manifests | No |
| `src/config/palettes.ts:52-54` | `getPaletteIds()` maps all 10 palettes | No |
| `src/config/navigation.ts:86` | `getLandingPages()` calls `getThemeIds()` from themeRegistry | Partial (features only) |
| `src/layouts/BaseLayout.astro:37` | Hardcodes `activeTheme` to `'nordic'` or `'azure'` based on header version | No |
| `src/components/pages/NotFoundPage.astro:10` | Always imports `HeaderDefault` | No |
| `src/components/sections/footer/FooterLiquid.astro:66-77` | Hardcodes links to `/blog`, `/docs` | No |

### 2.2 The Pruning Illusion

The CLI correctly prunes files — deleting unselected theme components, locale JSON files, palette CSS files, and feature directories. But the registries that index these files are never updated. This creates ghost references: routes generated for locales whose translations don't exist, nav entries for themes whose components were deleted, footer links pointing to feature pages that were removed.

### 2.3 The Emergent Routing Problem

There is no formal routing model. The system implicitly behaves in three modes:

| Mode | Condition | Expected Behavior | Actual Behavior |
|------|-----------|-------------------|-----------------|
| **Demo** | All 6 themes, all features enabled | Show index showcase + all theme pages | Works (this is the development default) |
| **Multi-theme** | 2-5 themes selected | Show theme picker index + selected theme pages | Partially works — nav dropdown still shows all 6 via `getThemeIds()` |
| **Single-theme** | 1 theme selected | Render that theme's sections at `/` | Broken — section anchors use `/{theme}#section` format but `/{theme}` doesn't exist as a route when rendered at index |

None of these modes are formally defined. Routing behavior is an emergent artifact of which files happen to exist after pruning.

---

## 3. Systemic Design Failures vs Surface Bugs

### Systemic Failures (require architectural intervention)

| ID | Failure | Impact | Root |
|----|---------|--------|------|
| S1 | No runtime config consumption | Every feature below this is affected | Missing config hydration layer |
| S2 | Theme metadata in 3 files | Adding a theme requires editing 7+ files | No unified theme manifest |
| S3 | No formal routing model | Routing behavior is emergent, not designed | Missing mode-aware route generation |
| S4 | Palette scoped to `[data-theme]` selector | Palette variables undefined when data-theme doesn't match CSS selectors | Palette is a side effect of theme switching, not a first-class system |
| S5 | Navigation not mode/feature/config-aware | Dropdown shows all themes, footer shows all features | Nav reads from hardcoded registries |
| S6 | No theme context system | 404, error pages, shared layouts cannot resolve current theme | Layout system has no context propagation |
| S7 | Locale registry never filtered | 7 locales always enabled despite CLI pruning | `locales.ts` ignores config |

### Surface Bugs (symptoms of systemic failures)

| ID | Bug | Symptom Of |
|----|-----|-----------|
| B1 | Sections render blank/black | S4 — palette vars undefined |
| B2 | Home dropdown shows 6 themes | S1, S5 — `getThemeIds()` ignores config |
| B3 | Section links produce 404s | S3 — single-theme routing undefined |
| B4 | Footer shows Blog/Docs always | S1, S11 — no feature gating in components |
| B5 | 404 page uses wrong header | S6 — no theme context |
| B6 | Palette breaks on Glass theme navigation | S4 — `BaseLayout.astro:37` hardcodes `'nordic'` for Glass |
| B7 | Demo index shows for non-full presets | S3 — no mode-aware index page selection |
| B8 | Luxury/Minimal navbars can't represent multi-theme | S5 — nav builders hardcode `/luxury`, `/minimal` as base paths |

---

## 4. Architectural Principles for v2.0

1. **Single Source of Truth**: `astroglass.config.json` is the authoritative record of what is enabled. All registries are gated by it.

2. **Config Flows Down**: Config is loaded once, validated once, and injected into every subsystem. No subsystem maintains its own hardcoded enabled/disabled state.

3. **Modes Are Explicit**: The system formally recognizes `single-theme`, `multi-theme`, and `demo` as distinct operational modes with different routing, navigation, and layout behaviors.

4. **Self-Describing Themes**: A theme is a single manifest that declares its own metadata, sections, file paths, presets, and dependencies. No external file needs to know about a theme's internals.

5. **Palette Is First-Class**: Palettes are independent of themes. CSS custom properties load at `:root` scope for the default palette and are switchable without coupling to a `[data-theme]` attribute that also serves double-duty as a theme identifier.

6. **Feature Gating at Boundaries**: Features are gated at the config layer, not by hoping the CLI deleted the right files. Components query config before rendering feature-dependent content.

7. **Build Verification Is Visual**: CI validates not just that `astro build` exits 0, but that representative scaffolds produce correct visual output via deployed previews.

8. **Additions Are Local**: Adding a new theme, palette, locale, or feature should require touching at most 2-3 files, not 7+.

---

## 5. Proposed Target Architecture

### 5.1 Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   astroglass.config.json                │
│  (Single Source of Truth — written by CLI, read by all) │
└──────────────────────────┬─────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ ConfigLoader │  ← Validates, resolves,
                    │  (runtime)   │     and caches config
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┬──────────────┐
              ▼            ▼            ▼              ▼
     ┌────────────┐ ┌───────────┐ ┌─────────┐ ┌──────────┐
     │  ThemeKit   │ │PaletteKit │ │LocaleKit│ │FeatureKit│
     │             │ │           │ │         │ │          │
     │• manifests  │ │• variables│ │• codes  │ │• enabled │
     │• presets    │ │• switcher │ │• routes │ │• gates   │
     │• sections   │ │• defaults │ │• i18n   │ │• pruning │
     │• registry   │ │• scoping  │ │• detect │ │• links   │
     └──────┬─────┘ └─────┬─────┘ └────┬────┘ └─────┬────┘
            │             │            │             │
            └──────┬──────┴────────────┴─────────────┘
                   │
          ┌────────▼────────┐
          │   Router Model   │
          │                  │
          │ • mode detection │
          │ • path generation│
          │ • static paths   │
          │ • index strategy │
          └────────┬────────┘
                   │
          ┌────────▼────────┐
          │  Layout Engine   │
          │                  │
          │ • header resolve │
          │ • footer resolve │
          │ • nav builder    │
          │ • context inject │
          └─────────────────┘
```

### 5.2 Module Boundaries

| Module | Responsibility | Inputs | Outputs |
|--------|---------------|--------|---------|
| **ConfigLoader** | Load, validate, cache `astroglass.config.json` | Raw JSON file | Typed, validated `ResolvedConfig` |
| **ThemeKit** | Provide theme metadata, section lookups, manifests | `ResolvedConfig.themes` | Enabled themes, section resolvers, preset lookups |
| **PaletteKit** | Manage CSS variable injection, switcher data | `ResolvedConfig.palettes`, `ResolvedConfig.defaultPalette` | Palette list, default palette, CSS scope strategy |
| **LocaleKit** | Manage locale detection, route generation, i18n | `ResolvedConfig.locales` | Enabled locale codes, translation loaders |
| **FeatureKit** | Gate feature-dependent content and routes | `ResolvedConfig.features` | `hasFeature()`, conditional route generation |
| **Router** | Generate static paths based on mode | All kits | `getStaticPaths()` results, mode detection |
| **LayoutEngine** | Resolve header/footer/nav per context | Theme ID, mode, features | Correct components for current page |

---

## 6. Config Hydration Layer Design

### 6.1 Problem Statement

Today, `astroglass.config.json` is written by the CLI and read by exactly one file (`navigation.ts`). All other registries maintain independent hardcoded state. There is no validation, no typing at the boundary, and no single import point.

### 6.2 Proposed Design

Create `src/config/config-loader.ts` as the sole entry point for configuration:

```typescript
// src/config/config-loader.ts

import rawConfig from '../../astroglass.config.json';
import { z } from 'astro/zod';

const ConfigSchema = z.object({
  version: z.string(),
  themes: z.array(z.string()).min(1),
  palettes: z.array(z.string()).min(1),
  locales: z.array(z.string()).min(1),
  features: z.array(z.string()),
  deployTarget: z.string(),
  defaultPalette: z.string(),
});

export type ResolvedConfig = z.infer<typeof ConfigSchema>;

const parsed = ConfigSchema.safeParse(rawConfig);
if (!parsed.success) {
  throw new Error(
    `Invalid astroglass.config.json:\n${parsed.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`
  );
}

/** Validated, typed project configuration */
export const config: ResolvedConfig = Object.freeze(parsed.data);

// Derived helpers (the ONLY place these decisions are made)
export const isSingleTheme = config.themes.length === 1;
export const isMultiTheme  = config.themes.length > 1;
export const primaryTheme  = config.themes[0];

export function hasFeature(feature: string): boolean {
  return config.features.includes(feature);
}

export function hasTheme(themeId: string): boolean {
  return config.themes.includes(themeId);
}

export function hasLocale(code: string): boolean {
  return config.locales.includes(code);
}

export function hasPalette(id: string): boolean {
  return config.palettes.includes(id);
}
```

### 6.3 Consumption Rules

1. **Every** file that currently reads from `themes.ts`, `locales.ts`, `palettes.ts`, or `themeRegistry.ts` must first filter through `config-loader.ts`.
2. No registry function (`getEnabledThemes()`, `getEnabledLocales()`, etc.) may return entries not present in `config.themes` / `config.locales` / `config.palettes`.
3. `config-loader.ts` validates at import time — a malformed config crashes the build with a clear error message, not a runtime mystery.
4. The config object is frozen and immutable. No subsystem may mutate it.

### 6.4 Before/After

**Before (themes.ts):**
```typescript
export function getEnabledThemes(): ThemeDefinition[] {
  return themes.filter((theme) => theme.enabled); // enabled is always true
}
```

**After (themes.ts):**
```typescript
import { config } from './config-loader';

export function getEnabledThemes(): ThemeDefinition[] {
  return themes.filter((theme) => config.themes.includes(theme.id));
}
```

This single pattern, applied to every registry, eliminates the entire class of "runtime ignores config" bugs.

---

## 7. Unified Theme Registry Model

### 7.1 Problem Statement

Theme information is currently split across three files:

| File | Contains | Used By |
|------|----------|---------|
| `themes.ts` | id, name, color, icon, sections, enabled, premium, description | Runtime (theme metadata) |
| `themeRegistry.ts` | barrel, sections[], css[], header[], footer[], ui[], scripts[], tokens[], npmDeps[] | CLI only (file pruning) |
| `themePresets.ts` | landingSections[] per theme | Runtime (section rendering order) |

Adding a theme requires editing all three files plus creating the barrel file, section components, CSS files, and header/footer components — touching 7+ files minimum.

### 7.2 Proposed Design: Self-Describing Theme Manifest

Merge all three files into a single `ThemeManifest` type per theme. Each theme is a single object that fully describes itself:

```typescript
// src/config/theme-manifest.ts

export interface ThemeManifest {
  // Identity (from themes.ts)
  id: string;
  name: string;
  icon: string;
  color: string;            // Tailwind gradient classes
  description: string;
  premium: boolean;

  // Layout (from themePresets.ts)
  landingSections: SectionKey[];

  // Header resolution
  headerVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // File manifest (from themeRegistry.ts — CLI only, tree-shaken in prod)
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
```

**Each theme declares everything about itself in one place:**

```typescript
export const liquidManifest: ThemeManifest = {
  id: 'liquid',
  name: 'Liquid',
  icon: '💧',
  color: 'from-blue-500 to-cyan-400',
  description: 'Fluid, organic design with smooth animations',
  premium: false,
  headerVersion: 1,
  landingSections: ['Hero', 'About', 'Features', 'Portfolio', 'Pricing', 'Testimonial', 'FAQ', 'CTA', 'Contact'],
  files: {
    barrel: 'src/components/sections/themes/liquid.ts',
    sections: [ /* ... */ ],
    css: [ /* ... */ ],
    header: ['src/components/layout/header/HeaderLiquid.astro'],
    footer: ['src/components/sections/footer/FooterLiquid.astro'],
    ui: ['src/components/ui/liquid/LiquidSectionTag.astro'],
    scripts: [],
    tokens: ['src/styles/tokens/liquid.css'],
    npmDeps: [],
  },
};
```

### 7.3 Unified Registry

```typescript
// src/config/themes.ts (v2)

import { config } from './config-loader';
import type { ThemeManifest } from './theme-manifest';

// Import individual manifests
import { liquidManifest } from './manifests/liquid';
import { glassManifest }  from './manifests/glass';
// ... etc

const allThemes: ThemeManifest[] = [
  liquidManifest, glassManifest, neoManifest,
  luxuryManifest, minimalManifest, auroraManifest,
];

/** Themes enabled in this project (config-gated) */
export function getEnabledThemes(): ThemeManifest[] {
  return allThemes.filter(t => config.themes.includes(t.id));
}

/** Get manifest for a specific theme */
export function getTheme(id: string): ThemeManifest | undefined {
  return allThemes.find(t => t.id === id);
}

/** Get the header version for a theme */
export function getHeaderVersion(themeId: string): number {
  return getTheme(themeId)?.headerVersion ?? 3;
}
```

### 7.4 Impact

| Metric | Before (v1) | After (v2) |
|--------|-------------|------------|
| Files to edit when adding a theme | 7+ | 1 manifest + component files |
| Runtime files reading theme data | 3 (uncoordinated) | 1 (gated) |
| Risk of metadata desync | High | Zero (single object) |
| CLI and runtime reading different definitions | Yes | No (same manifest, tree-shaken `files` field) |

---

## 8. Explicit Routing Model Specification

### 8.1 Problem Statement

The system has no formal concept of routing modes. Whether a user gets a demo index, a theme-picker index, or a single-theme-at-root experience depends on which files the CLI happens to leave behind. Section anchor links hardcode `/{theme}#section` patterns that break in single-theme mode because the theme page doesn't exist as a named route.

### 8.2 Mode Definitions

v2.0 formally defines three routing modes, derived from config:

```typescript
type RoutingMode = 'single-theme' | 'multi-theme' | 'demo';
```

| Mode | Condition | Index Page | Theme Pages | Nav Behavior |
|------|-----------|-----------|-------------|-------------|
| `single-theme` | `config.themes.length === 1` | Theme's sections render at `/` | None (no `/{theme}` route) | Section scrolls use `/#section` |
| `multi-theme` | `config.themes.length > 1` | Theme picker / showcase | `/{theme}` for each | Home dropdown shows enabled themes |
| `demo` | All 6 themes + all features | Full showcase with stats/gallery | All `/{theme}` routes | Full navigation |

### 8.3 Route Generation

```typescript
// src/pages/[...lang]/index.astro (v2)

import { config, isSingleTheme, primaryTheme } from '../../config/config-loader';

export async function getStaticPaths() {
  // ... locale paths
}

// Mode-aware rendering:
if (isSingleTheme) {
  // Render primary theme's sections directly at /
  // Use the theme's own header/footer
  // Section anchors are /#about, /#services, etc.
} else {
  // Render theme picker / showcase index
  // Use HeaderDefault
  // Links go to /{theme}
}
```

```typescript
// src/pages/[...lang]/[theme].astro (v2)

export async function getStaticPaths() {
  const themes = getEnabledThemes();
  // In single-theme mode, this page is NOT generated
  // (the single theme renders at index instead)
  if (isSingleTheme) return [];
  // ... generate paths for enabled themes only
}
```

### 8.4 Section Anchor Resolution

Anchors must be mode-aware:

```typescript
// src/config/navigation.ts (v2)

function getSectionHref(section: string, themeId: string): string {
  if (isSingleTheme) {
    return `/#${section}`;        // Scrolls on index
  }
  return `/${themeId}#${section}`; // Navigates to theme page
}
```

### 8.5 Index Page Strategy

| Mode | What Renders at `/` |
|------|-------------------|
| `single-theme` | `ThemePage` component with the single theme's Header, sections, Footer |
| `multi-theme` | `MultiThemeIndex` — a theme-picker page listing enabled themes with preview cards |
| `demo` | `DemoIndex` — the current HeroHome + TemplateShowcase + StatsStrip showcase (only when all 6 themes present) |

The CLI generates the appropriate `index.astro` from an EJS template based on the mode at scaffold time. The runtime also respects mode at build time via config-loader.

---

## 9. Navigation System Redesign

### 9.1 Problem Statement

Navigation has multiple structural issues:

1. `getLandingPages()` calls `getThemeIds()` from `themeRegistry.ts`, which returns all 6 themes regardless of config.
2. `buildMinimalNavLinks()` hardcodes `'/minimal'` as `themeBase`.
3. `buildLuxuryNavLinks()` hardcodes `'/luxury'` as `themeBase`.
4. Section anchors use `/{theme}#section` which breaks in single-theme mode.
5. Footers hardcode links to `/blog` and `/docs` without checking feature enablement.
6. The Home dropdown always renders when `getThemeIds().length > 1` (always true).

### 9.2 Proposed Design

**Unified nav builder that is mode-aware, feature-aware, and config-gated:**

```typescript
// src/config/navigation.ts (v2)

import { config, isSingleTheme, hasFeature } from './config-loader';
import { getEnabledThemes } from './themes';

export function buildNavLinks(
  t: TranslationFn,
  currentThemeId: string
): NavLink[] {
  const links: NavLink[] = [];

  // Home dropdown — only in multi-theme mode
  if (!isSingleTheme) {
    links.push({
      label: t('nav.home'),
      icon: navIcons.home,
      children: getEnabledThemes().map(theme => ({
        href: `/${theme.id}`,
        label: t(`nav.theme${capitalize(theme.id)}`) || theme.name,
        icon: theme.icon,
      })),
    });
  }

  // Section scroll links — mode-aware anchors
  const base = isSingleTheme ? '' : `/${currentThemeId}`;
  const sections = ['about', 'services', 'portfolio', 'pricing', 'faq', 'contact'];
  for (const section of sections) {
    links.push({
      href: `${base}#${section}`,
      label: t(`nav.${section}`),
      icon: navIcons[section],
    });
  }

  // Feature-conditional page links
  if (hasFeature('blog')) {
    links.push({ href: '/blog', label: t('nav.blog'), icon: navIcons.resources });
  }
  if (hasFeature('docs')) {
    links.push({ href: '/docs', label: t('nav.docs'), icon: navIcons.resources });
  }

  return links;
}
```

**Key changes:**
- No more separate `buildThemeNavLinks`, `buildMinimalNavLinks`, `buildLuxuryNavLinks`, `buildDefaultNavLinks` with different hardcoded base paths.
- One `buildNavLinks()` function that takes the current theme ID and derives everything from config.
- Theme-specific nav rendering (Luxury sidebar, Minimal simple list) is handled by the header *component*, not by generating different nav data.

### 9.3 Footer Redesign

All footer variants must be feature-gated. Instead of hardcoding links to `/blog` and `/docs`:

```astro
---
import { hasFeature } from '../../config/config-loader';
---

{hasFeature('blog') && (
  <li><LocalizedLink href="/blog">{t('footer.links.blog')}</LocalizedLink></li>
)}
{hasFeature('docs') && (
  <li><LocalizedLink href="/docs">{t('footer.links.docs')}</LocalizedLink></li>
)}
```

This pattern applies to all 6 footer variants (`FooterLiquid`, `FooterGlass`, `FooterNeo`, `FooterLuxury`, `FooterMinimal`, `FooterAurora`).

---

## 10. Palette System Redesign

### 10.1 Problem Statement

The palette system has three critical defects:

1. **Scoping**: CSS variables are scoped to `[data-theme="azure"]`, `[data-theme="nordic"]`, etc. If the `data-theme` attribute doesn't match any palette's CSS selector, all variables are undefined, producing black/white rendering.

2. **Coupling**: `BaseLayout.astro:37` hardcodes `activeTheme = currentHeader === 2 ? 'nordic' : 'azure'`. This couples palette selection to header version rather than treating palette as an independent choice.

3. **Default resolution**: There's no mechanism to ensure the user's `defaultPalette` from config is the active palette on first load. The layout forces `'azure'` regardless of config.

### 10.2 Proposed Design

**Palette as an independent, first-class system:**

#### 10.2.1 CSS Variable Injection Strategy

Move away from `[data-theme="..."]` selectors. Instead:

```css
/* src/styles/palettes/_root.css (v2) */

/* Default palette variables injected at :root */
:root {
  /* These are overridden by the active palette */
  --p: 215 30% 96%;
  --s: 215 25% 91%;
  --a: 215 90% 43%;
  /* ... all palette variables with sensible defaults */
}

/* Palette overrides via data-palette attribute */
[data-palette="azure"]     { /* ... */ }
[data-palette="nordic"]    { /* ... */ }
[data-palette="abyss"]     { /* ... */ }
/* ... */
```

**Key change**: Rename `data-theme` to `data-palette`. The word "theme" in AstroGlass means "design family" (liquid, glass, neo...), not "color scheme." Using `data-theme` for palettes conflates two independent axes. The `data-palette` attribute explicitly names what it controls.

#### 10.2.2 Default Palette from Config

```astro
---
// BaseLayout.astro (v2)
import { config } from '../config/config-loader';

const defaultPalette = config.defaultPalette;
---

<html lang={locale} data-palette={defaultPalette}>
```

No more hardcoding `'azure'` or `'nordic'`. The config's `defaultPalette` is always respected.

#### 10.2.3 Palette Switcher Reads Config

The palette switcher dropdown only shows palettes present in `config.palettes`:

```typescript
import { config } from '../config/config-loader';
import { palettes } from '../config/palettes';

const enabledPalettes = palettes.filter(p => config.palettes.includes(p.id));
```

#### 10.2.4 Root-Level Fallback

Even if `data-palette` is somehow unset, `:root` provides default values so no variable is ever undefined. This eliminates the black-screen failure mode entirely.

---

## 11. Feature Gating Strategy

### 11.1 Problem Statement

Features (blog, docs, dashboard, react) are optional, but only the CLI prunes files. Runtime code assumes features exist:
- Footer components hardcode `/blog` and `/docs` links
- Navigation may link to feature pages that don't exist
- The index page imports components from feature directories that may have been deleted

### 11.2 Proposed Design: Layered Gating

Feature gating operates at three layers:

#### Layer 1: Config Gate (build-time)

```typescript
// src/config/config-loader.ts
export function hasFeature(feature: string): boolean {
  return config.features.includes(feature);
}
```

Every component that references a feature checks this before rendering.

#### Layer 2: Route Gate (static path generation)

```typescript
// src/pages/[...lang]/blog/index.astro
import { hasFeature } from '../../../config/config-loader';

export async function getStaticPaths() {
  if (!hasFeature('blog')) return [];
  // ... generate blog routes
}
```

If `blog` is not enabled, Astro generates zero blog routes. No 404s, no broken links.

#### Layer 3: Component Gate (render-time)

```astro
---
import { hasFeature } from '../../config/config-loader';
---

{hasFeature('blog') && (
  <a href="/blog">Blog</a>
)}
```

This is defense-in-depth. Even if a route somehow exists, components won't link to disabled features.

### 11.3 Feature Registry

```typescript
// src/config/features.ts

export interface FeatureDefinition {
  id: string;
  name: string;
  routes: string[];         // Route patterns this feature owns
  navLinks: NavLinkDef[];   // Nav entries this feature contributes
  dependencies: string[];   // npm packages only this feature needs
}

export const featureRegistry: FeatureDefinition[] = [
  {
    id: 'blog',
    name: 'Blog',
    routes: ['blog/index', 'blog/[slug]', 'blog/rss.xml', 'blog/tag/[tag]'],
    navLinks: [{ href: '/blog', labelKey: 'nav.blog' }],
    dependencies: [],
  },
  {
    id: 'docs',
    name: 'Documentation',
    routes: ['docs/index', 'docs/[...slug]'],
    navLinks: [{ href: '/docs', labelKey: 'nav.docs' }],
    dependencies: [],
  },
  // ...
];
```

Navigation and footer link generation queries this registry filtered by `config.features`.

---

## 12. Locale System Redesign

### 12.1 Problem Statement

`locales.ts` defines 7 locales all with `enabled: true`. The CLI prunes locale JSON files but never updates the registry. `getEnabledLocaleCodes()` returns all 7 codes. Astro's i18n config generates routes for all 7 languages. For pruned locales, translation files don't exist — the `i18n.ts` utility silently falls back to the key string, producing raw translation keys in the UI (e.g., `"hero.title"` rendered as visible text).

### 12.2 Proposed Design

#### 12.2.1 Config-Gated Locale Registry

```typescript
// src/config/locales.ts (v2)

import { config } from './config-loader';

export function getEnabledLocales(): LocaleConfig[] {
  return localesConfig.filter(locale => config.locales.includes(locale.code));
}

export function getEnabledLocaleCodes(): string[] {
  return getEnabledLocales().map(l => l.code);
}
```

Now `getEnabledLocaleCodes()` returns only what config declares. Astro generates routes only for those locales.

#### 12.2.2 Translation Fallback Strategy

```typescript
// src/utils/i18n.ts (v2)

export function useTranslations(locale: string) {
  return function t(key: string): string {
    // 1. Try requested locale
    const value = getTranslation(locale, key);
    if (value) return value;

    // 2. Fall back to default locale (en)
    const fallback = getTranslation(defaultLocale, key);
    if (fallback) return fallback;

    // 3. Dev warning + return key
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing: ${locale}/${key}`);
    }
    return key;
  };
}
```

#### 12.2.3 Astro i18n Config Integration

```javascript
// astro.config.mjs (v2)
import { getEnabledLocaleCodes, defaultLocale } from './src/config/locales';

export default defineConfig({
  i18n: {
    defaultLocale,
    locales: getEnabledLocaleCodes(), // Now config-gated
  },
});
```

---

## 13. CLI Architecture Redesign

### 13.1 Current Architecture

The CLI scaffold flow is:

1. Download full template from Git
2. Prune unselected themes (delete files per `themeRegistry`)
3. Prune unselected palettes (delete CSS files)
4. Prune unselected locales (delete JSON directories)
5. Prune unselected features (delete feature directories)
6. Prune deploy target files
7. Generate hub files from EJS templates (BaseLayout, index, package.json, etc.)
8. Write `astroglass.config.json`
9. Cleanup

**Critical gap**: Step 7 generates files from EJS templates, but these templates don't always encode config-awareness. `BaseLayout.astro.ejs` is partially parameterized but still produces code with hardcoded assumptions (e.g., importing all 6 headers).

### 13.2 Proposed Redesign

#### 13.2.1 CLI Flow (v2)

```
1. Prompt user for selections
2. Download template
3. Write astroglass.config.json FIRST
4. Prune files (themes, palettes, locales, features, deploy)
5. Generate hub files from EJS templates (now config-aware)
6. Validate generated project (astro check)
7. Cleanup
```

**Key change**: Config is written before pruning and generation, not after. This means EJS templates can read config during generation.

#### 13.2.2 EJS Template Redesign

Templates should produce code that is config-aware at runtime, not just pruning-aware at scaffold time:

**BaseLayout.astro.ejs (v2):**
```astro
---
import { config } from '../config/config-loader';
import { getTheme, getHeaderVersion } from '../config/themes';

// Dynamic header import based on config
const headerComponents = {
  1: () => import('../components/layout/header/HeaderLiquid.astro'),
  2: () => import('../components/layout/header/HeaderGlass.astro'),
  // ...
};
---
```

#### 13.2.3 Post-Scaffold Validation

The CLI should run `astro check` on the generated project before declaring success:

```typescript
// scaffold/validate.ts (v2)

export async function validateScaffold(projectPath: string): Promise<ValidationResult> {
  const checks = [
    checkConfigExists(projectPath),
    checkRequiredFilesExist(projectPath),
    checkNoOrphanImports(projectPath),
    checkAstroBuild(projectPath),
  ];
  return Promise.all(checks);
}
```

#### 13.2.4 `add` / `remove` Commands

The existing `add` and `remove` CLI subcommands must update `astroglass.config.json` **and** run incremental pruning/restoration. Since the runtime now reads config, updating config is sufficient for runtime behavior. But file pruning is still needed for bundle size.

```
npx astroglass add theme aurora
  → Updates config.themes to include 'aurora'
  → Restores aurora files from template (or warns if not available)

npx astroglass remove feature docs
  → Updates config.features to remove 'docs'
  → Deletes docs-related files
  → Runtime automatically stops generating docs routes
```

---

## 14. CI/CD & GitHub Pages Preview Matrix Design

### 14.1 Problem Statement

Current CI validates only:
- `astro check` (type checking)
- `pnpm build` exit code (build success)
- CLI test matrix generates combinations but only checks scaffold + build, not visual output

AstroGlass is a **visual product**. A build can succeed while producing:
- Black/white pages (undefined CSS variables)
- Broken navigation (pointing to non-existent routes)
- Missing sections (components silently skipped)
- Incorrect layouts (wrong header for theme)

None of these failures produce a non-zero exit code.

### 14.2 Proposed Design: Preview Matrix

#### 14.2.1 Test Combination Matrix

Define a representative subset of the combinatorial space:

```yaml
# .github/workflows/preview-matrix.yml

strategy:
  matrix:
    include:
      # Single-theme, minimal config
      - name: "single-liquid-en"
        themes: "liquid"
        palettes: "azure"
        locales: "en"
        features: ""

      # Single-theme, dark palette
      - name: "single-glass-dark"
        themes: "glass"
        palettes: "abyss"
        locales: "en"
        features: "blog"

      # Multi-theme, standard
      - name: "multi-standard"
        themes: "liquid,glass,neo"
        palettes: "azure,abyss,rose"
        locales: "en,ru"
        features: "blog,docs"

      # Full demo (all features)
      - name: "full-demo"
        themes: "liquid,glass,neo,luxury,minimal,aurora"
        palettes: "azure,solaris,evergreen,rose,monochrome,nordic,aquatica,abyss,neonoir,synthwave"
        locales: "en,ru"
        features: "blog,docs,dashboard,react"

      # Premium theme, single
      - name: "single-luxury"
        themes: "luxury"
        palettes: "abyss,synthwave"
        locales: "en"
        features: ""

      # Edge case: single theme + all features
      - name: "single-aurora-full"
        themes: "aurora"
        palettes: "azure,neonoir"
        locales: "en,ja"
        features: "blog,docs,dashboard"
```

#### 14.2.2 Pipeline Steps

```yaml
jobs:
  scaffold-and-deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix: # ... as above
      fail-fast: false

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup
        # pnpm, node, install

      - name: Build CLI
        run: pnpm --filter create-astroglass build

      - name: Scaffold project
        run: |
          node packages/create-astroglass/dist/index.mjs \
            --project-dir ./preview-${{ matrix.name }} \
            --themes "${{ matrix.themes }}" \
            --palettes "${{ matrix.palettes }}" \
            --locales "${{ matrix.locales }}" \
            --features "${{ matrix.features }}" \
            --deploy-target static \
            --non-interactive

      - name: Build scaffolded project
        working-directory: ./preview-${{ matrix.name }}
        run: |
          pnpm install
          pnpm build

      - name: Capture screenshots
        uses: browser-actions/setup-chrome@latest
        # Use Playwright or Puppeteer to capture key pages:
        # - Index page
        # - Each theme page (if multi-theme)
        # - Blog index (if enabled)
        # - 404 page

      - name: Upload preview artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./preview-${{ matrix.name }}/dist

  deploy-previews:
    needs: scaffold-and-deploy
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

#### 14.2.3 Visual Regression Detection

For each matrix entry, capture screenshots of key pages using Playwright:

```typescript
// ci/screenshot-capture.ts

const pages = [
  { name: 'index', path: '/' },
  { name: 'theme-1', path: `/${config.themes[0]}` },
  { name: '404', path: '/nonexistent' },
];

if (hasFeature('blog')) {
  pages.push({ name: 'blog', path: '/blog' });
}

for (const page of pages) {
  await browser.goto(`http://localhost:4321${page.path}`);
  await browser.screenshot({ path: `screenshots/${matrix.name}-${page.name}.png` });
}
```

Screenshots are uploaded as artifacts. On PRs, a diff against the `main` branch screenshots can be generated using `pixelmatch` or similar:

```yaml
      - name: Compare screenshots
        if: github.event_name == 'pull_request'
        run: node ci/compare-screenshots.js --baseline main --current ${{ github.sha }}
```

#### 14.2.4 Preview URL Structure

Deploy each matrix entry to a subdirectory on GitHub Pages:

```
https://<org>.github.io/astroglass-previews/
├── single-liquid-en/
├── single-glass-dark/
├── multi-standard/
├── full-demo/
├── single-luxury/
└── single-aurora-full/
```

A summary comment is posted on the PR with links:

```markdown
## Preview Deployments

| Config | Status | Preview |
|--------|--------|---------|
| single-liquid-en | ✅ Built | [Preview](https://...previews/single-liquid-en/) |
| single-glass-dark | ✅ Built | [Preview](https://...previews/single-glass-dark/) |
| multi-standard | ✅ Built | [Preview](https://...previews/multi-standard/) |
| ... | | |
```

---

## 15. Migration Plan

### Phase 1: Config Hydration Layer (Foundation)

**Scope**: Create config-loader, gate all registries, fix the root cause.

**Steps**:
1. Create `src/config/config-loader.ts` with Zod validation
2. Modify `themes.ts` — `getEnabledThemes()` filters by `config.themes`
3. Modify `locales.ts` — `getEnabledLocales()` filters by `config.locales`
4. Modify `palettes.ts` — add `getEnabledPalettes()` filtered by `config.palettes`
5. Modify `navigation.ts` — replace `getThemeIds()` call with config-gated version, remove local `hasFeature`/`isMultiTheme` in favor of config-loader exports
6. Update `astro.config.mjs` to use config-gated locale codes

**Outcome**: Runtime respects config. The entire class of "runtime ignores CLI choices" bugs is eliminated.

**Breaking changes**: None. The config file already exists; this phase just reads it.

### Phase 2: Palette System & Layout Fix

**Scope**: Fix the palette black-screen bug, decouple palette from header version.

**Steps**:
1. Rename `data-theme` attribute to `data-palette` across all CSS files
2. Add `:root` fallback variables so no palette variable is ever undefined
3. Modify `BaseLayout.astro` to read `config.defaultPalette` instead of hardcoding `'azure'`/`'nordic'`
4. Remove the `currentHeader === 2 ? 'nordic' : 'azure'` override
5. Update palette switcher to read from `config.palettes`
6. Update all `[data-theme="..."]` selectors in palette CSS files to `[data-palette="..."]`

**Outcome**: Palettes work independently. No more black screens. Default palette respects config.

**Breaking changes**: `data-theme` attribute renamed to `data-palette`. Any user CSS targeting `[data-theme]` must update.

### Phase 3: Unified Theme Manifest & Routing Model

**Scope**: Merge three theme files, formalize routing modes.

**Steps**:
1. Create `src/config/manifests/` directory with one file per theme
2. Merge `themePresets.ts` `landingSections` into each manifest
3. Merge `themeRegistry.ts` `files` into each manifest (with tree-shaking annotation)
4. Add `headerVersion` to each manifest
5. Delete `themePresets.ts` and `themeRegistry.ts`
6. Implement mode detection: `single-theme` | `multi-theme` | `demo`
7. Modify `index.astro` for mode-aware rendering
8. Modify `[theme].astro` to return empty paths in single-theme mode
9. Fix section anchor generation to be mode-aware

**Outcome**: One file per theme. Routing modes are explicit. Section links work in all modes.

**Breaking changes**: Theme file structure reorganized. CLI `themeRegistry` import paths change.

### Phase 4: Navigation, Feature Gating & Locale Cleanup

**Scope**: Unified nav builder, feature-gated components, locale runtime fix.

**Steps**:
1. Replace 4 separate nav builder functions with unified `buildNavLinks()`
2. Add `hasFeature()` checks to all 6 footer variants
3. Add route-level feature gates (`getStaticPaths` returns `[]` for disabled features)
4. Fix `NotFoundPage.astro` to resolve the correct header from theme context
5. Create theme context propagation (layout injects theme ID into all children)
6. Apply locale config gate to `astro.config.mjs` i18n config

**Outcome**: Navigation is mode-aware. Features are properly gated. 404 uses correct header.

**Breaking changes**: Nav builder function signatures change. Components importing nav builders directly must update.

### Phase 5: CI/CD Preview Matrix & CLI Hardening

**Scope**: Visual verification pipeline, CLI validation, post-scaffold checks.

**Steps**:
1. Create `.github/workflows/preview-matrix.yml`
2. Add non-interactive mode to CLI (`--non-interactive` flag)
3. Define 6-8 representative matrix combinations
4. Implement Playwright screenshot capture script
5. Implement `pixelmatch`-based visual diff for PR comparisons
6. Deploy preview matrix to GitHub Pages
7. Add PR comment bot with preview links and screenshot diffs
8. Add post-scaffold `astro check` step to CLI

**Outcome**: Every PR gets visual previews of representative configurations. Regressions are caught before merge.

**Breaking changes**: None (additive CI infrastructure).

---

## 16. Risk Analysis

### High Risk

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Renaming `data-theme` to `data-palette`** breaks user customizations | Users with custom CSS targeting `[data-theme]` will see broken styles | Document in migration guide; provide codemod script; keep `[data-theme]` as deprecated alias for 1 release cycle |
| **Unified manifest restructuring** could introduce regressions | Theme components may not resolve correctly during migration | Implement behind feature flag; test each theme individually; maintain v1 compatibility shim |
| **CI preview matrix** may exceed GitHub Actions minutes | 6+ scaffold+build+screenshot jobs per PR | Use `fail-fast: false` with caching; only run on label or path filter; use smaller representative set |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Config validation** rejects existing valid configs | Users with existing projects can't upgrade | Schema is additive; unknown fields are ignored; missing fields get defaults |
| **Mode detection** misclassifies edge cases | Wrong index page or nav rendered | Explicit mode enum with exhaustive switch; integration tests for each mode |
| **Tree-shaking** of `files` manifest field may fail | Larger bundle includes CLI-only data | Use conditional import; move `files` to separate submodule |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Zod dependency** adds bundle size | Minimal (~3KB gzipped) | Already available via `astro/zod`; zero additional dependency |
| **EJS template changes** in CLI | Scaffold output changes | Existing projects unaffected; only new scaffolds |

---

## 17. Backward Compatibility Strategy

### 17.1 Config Schema Versioning

`astroglass.config.json` already has a `version` field. v2.0 bumps this to `"2.0.0"`:

```json
{
  "version": "2.0.0",
  "themes": ["liquid"],
  "palettes": ["azure"],
  "locales": ["en"],
  "features": ["blog"],
  "deployTarget": "static",
  "defaultPalette": "azure"
}
```

The config-loader accepts both `"1.0.0"` and `"2.0.0"` schemas with automatic migration:

```typescript
if (config.version === '1.0.0') {
  // v1 configs are valid v2 configs (same shape)
  // Just update the version marker
  config.version = '2.0.0';
}
```

### 17.2 `data-theme` → `data-palette` Transition

For one release cycle (v2.0 through v2.1), both attributes are supported:

```css
/* Temporary compatibility — remove in v2.2 */
[data-theme="azure"], [data-palette="azure"] {
  /* ... */
}
```

The runtime sets `data-palette` as the primary attribute. A deprecation warning is logged if the runtime detects `data-theme` being used in user stylesheets.

### 17.3 CLI `repair` Command

The existing `astroglass repair` command is enhanced to migrate v1 projects:

```
npx astroglass repair
  → Detects v1 config
  → Validates current file system state
  → Updates config to v2 schema
  → Renames data-theme to data-palette in user CSS files
  → Reports migration status
```

### 17.4 Existing Project Compatibility

Existing v1 projects that don't upgrade continue to work as-is. The v2 config-loader's Zod schema is a superset of v1. No fields are removed, only behavior changes.

---

## 18. Long-Term Scalability Considerations

### 18.1 Theme Marketplace

The unified theme manifest model directly enables a theme marketplace:

```typescript
// Future: themes can be loaded from npm packages
import { liquidManifest } from '@astroglass/theme-liquid';
import { customManifest } from 'astroglass-theme-corporate';
```

Each manifest is self-describing and self-contained. No central registry needs updating when community themes are added.

### 18.2 Section Composition

The current model requires every theme to implement all 9 sections. v2's explicit preset model allows partial themes:

```typescript
// A theme that only implements Hero, About, and Contact
export const landingManifest: ThemeManifest = {
  id: 'landing',
  landingSections: ['Hero', 'About', 'Contact'],
  // Missing sections are silently skipped (already works via null-filtering)
};
```

### 18.3 Config-as-Code

With a validated config schema, future tooling can programmatically generate configs:

```typescript
// Programmatic config generation for A/B testing
const configs = generateConfigMatrix({
  themes: [['liquid'], ['glass'], ['liquid', 'glass']],
  palettes: [['azure'], ['abyss']],
  features: [[], ['blog'], ['blog', 'docs']],
});
```

This directly feeds into the CI preview matrix.

### 18.4 Theme Composition / Inheritance

Long-term, themes could inherit from base themes:

```typescript
export const corporateManifest: ThemeManifest = {
  extends: 'minimal',
  id: 'corporate',
  name: 'Corporate',
  // Override only Hero and Pricing
  sectionOverrides: {
    Hero: CorporateHero,
    Pricing: CorporatePricing,
  },
};
```

The unified manifest model makes this possible because all theme data is in one typed object.

### 18.5 Runtime Config Hot-Reload (Development)

In development mode, the config-loader could watch `astroglass.config.json` for changes and trigger Astro's HMR:

```typescript
if (import.meta.env.DEV) {
  // Watch config file and trigger reload on change
  import.meta.hot?.accept('./config-loader', () => {
    console.log('[astroglass] Config changed — reloading');
  });
}
```

This enables a workflow where developers edit `astroglass.config.json` directly and see changes without restarting the dev server.

### 18.6 Scaling to 20+ Themes

The current model of importing all theme barrel files in `[theme].astro` doesn't scale:

```typescript
// v1: Static imports of all themes
import * as LiquidSections from '../../components/sections/themes/liquid';
import * as GlassSections  from '../../components/sections/themes/glass';
// ... 6 lines, one per theme
```

v2 should use dynamic imports keyed by theme ID:

```typescript
// v2: Dynamic import based on current route
const themeModule = await import(`../../components/sections/themes/${themeId}`);
```

Astro's static analysis handles `import()` with template literals at build time, generating code-split bundles per theme. This scales to any number of themes without growing the static import block.

---

## Appendix A: File Inventory — What Changes Per Phase

### Phase 1 (Config Hydration)
| Action | File |
|--------|------|
| Create | `src/config/config-loader.ts` |
| Modify | `src/config/themes.ts` |
| Modify | `src/config/locales.ts` |
| Modify | `src/config/palettes.ts` |
| Modify | `src/config/navigation.ts` |
| Modify | `astro.config.mjs` |

### Phase 2 (Palette)
| Action | File |
|--------|------|
| Modify | `src/styles/palettes/*.css` (10 files) |
| Modify | `src/styles/palettes/_root.css` |
| Modify | `src/layouts/BaseLayout.astro` |
| Modify | Palette switcher component |

### Phase 3 (Theme Manifest & Routing)
| Action | File |
|--------|------|
| Create | `src/config/manifests/*.ts` (6 files) |
| Delete | `src/config/themePresets.ts` |
| Delete | `src/config/themeRegistry.ts` |
| Modify | `src/config/themes.ts` |
| Modify | `src/pages/[...lang]/index.astro` |
| Modify | `src/pages/[...lang]/[theme].astro` |

### Phase 4 (Nav, Features, Locale)
| Action | File |
|--------|------|
| Modify | `src/config/navigation.ts` |
| Modify | `src/components/sections/footer/Footer*.astro` (6 files) |
| Modify | `src/components/pages/NotFoundPage.astro` |
| Modify | `src/pages/[...lang]/blog/*.astro` |
| Modify | `src/pages/[...lang]/docs/*.astro` |

### Phase 5 (CI/CD)
| Action | File |
|--------|------|
| Create | `.github/workflows/preview-matrix.yml` |
| Create | `ci/screenshot-capture.ts` |
| Create | `ci/compare-screenshots.js` |
| Modify | `packages/create-astroglass/src/index.ts` (non-interactive flag) |
| Modify | `packages/create-astroglass/src/scaffold/index.ts` (post-validate) |

---

## Appendix B: Decision Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|----------------------|
| Use `astro/zod` for config validation | Zero new dependencies; Astro already ships it; same schema language as content collections | JSON Schema (requires separate validator), TypeScript narrowing only (no runtime validation) |
| Rename `data-theme` to `data-palette` | Eliminates semantic confusion between theme (design family) and palette (color scheme) | Keep `data-theme` with documentation (confusing), use `data-color-scheme` (too generic) |
| Merge 3 theme files into unified manifest | Reduces coupling surface; makes themes self-describing; enables marketplace | Keep separate files with shared IDs (status quo with band-aids), single mega-file (too large) |
| Deploy previews to GitHub Pages | Free, integrated with GitHub Actions, no external service needed | Netlify previews (additional service), Cloudflare Pages (provider-specific), Vercel (provider-specific) |
| Use Playwright for screenshots | Already an Astro ecosystem tool; headless Chrome; cross-platform | Puppeteer (less maintained), Cypress (heavier), manual review (doesn't scale) |
| 5-phase migration | Each phase is independently deployable and testable; de-risks the effort | Big-bang rewrite (high risk), 2-phase (each phase too large) |

---

*End of RFC-002*

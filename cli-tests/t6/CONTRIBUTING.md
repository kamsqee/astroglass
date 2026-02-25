# Contributing to AstroGlass

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20 (see `.nvmrc`)
- [pnpm](https://pnpm.io/) >= 8

### Setup

```bash
# Clone the repo
git clone https://github.com/kamsqee/astroglass.git
cd astroglass

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The site will be available at `http://localhost:4321`.

## Development Workflow

### Available Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build + search index |
| `pnpm check` | Astro type checking |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check formatting without writing |

### Before Submitting a PR

1. Run `pnpm check` — must pass with no errors
2. Run `pnpm lint` — fix any warnings in files you touched
3. Run `pnpm format` — ensure consistent formatting
4. Run `pnpm build` — confirm the production build succeeds

## Project Structure

```
src/
├── components/       # UI components, organized by section and theme
│   ├── sections/     # Section components (hero, about, pricing, etc.)
│   ├── ui/           # Shared UI primitives (button, card, tabs, etc.)
│   └── layout/       # Layout wrappers (headers, footers)
├── config/           # Central configuration (themes, locales, navigation)
├── content/          # MDX content collections (docs, blog)
├── layouts/          # Astro page layouts
├── lib/              # Utility libraries (search, schemas)
├── locales/          # i18n translation JSON files
├── pages/            # File-based routing
├── styles/           # CSS (global + per-component)
└── utils/            # Helper functions
```

## Architecture Conventions

### Adding a Theme

1. Create a barrel file at `src/components/sections/themes/{theme}.ts`
2. Add a preset in `src/config/themePresets.ts`
3. Register the theme in `src/config/themes.ts`
4. Add the theme module to the `themeModules` map in `src/pages/[...lang]/[theme].astro`

### Adding a Locale

1. Add an entry to `localesConfig` in `src/config/locales.ts`
2. Create JSON files in `src/locales/{code}/` matching the existing structure
3. The locale will be automatically available throughout the app

### Adding a Section

1. Create the component at `src/components/sections/{section}/{SectionThemeName}.astro`
2. Export it from the theme barrel file
3. Add its key to the theme's preset in `src/config/themePresets.ts`

## Coding Standards

- **Components**: Use `.astro` for server-rendered components, `.tsx` only for interactive React islands
- **Styling**: Use CSS files in `src/styles/components/` — avoid inline `<style>` blocks in Astro components
- **i18n**: All user-facing strings must use the `useTranslations()` function, never hardcode text
- **Types**: Use TypeScript strict mode. Prefer interfaces over `any`
- **Naming**: CamelCase for components (`HeroLiquid.astro`), kebab-case for CSS files (`_header.css`)

## Submitting Changes

1. Fork the repo and create a branch from `main`
2. Make your changes following the conventions above
3. Write a clear PR description explaining **what** and **why**
4. Ensure CI passes (type check + lint + build)

## Reporting Bugs

Use the [Bug Report](https://github.com/kamsqee/astroglass/issues/new?template=bug_report.md) issue template. Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser and OS info
- Screenshots if applicable

## Requesting Features

Use the [Feature Request](https://github.com/kamsqee/astroglass/issues/new?template=feature_request.md) issue template. Describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

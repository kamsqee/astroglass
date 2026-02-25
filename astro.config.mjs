// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import { defaultLocale, getEnabledLocaleCodes } from './src/config/locales';
import { adapter, output } from './src/config/providers/active-provider';

import react from '@astrojs/react';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  output,
  adapter,
  integrations: [
    expressiveCode({
      themes: ['dracula', 'github-light'],
      themeCssSelector: (theme, context) => {
        // Dark themes - High contrast Dracula
        if (theme.name === 'dracula') {
          return '[data-theme="abyss"], [data-theme="neonoir"], [data-theme="synthwave"]';
        }
        // Light themes - Default Github Light
        // Explicitly listing them ensures no specificity conflicts with the dark theme
        return '[data-theme="azure"], [data-theme="solaris"], [data-theme="nordic"], [data-theme="evergreen"], [data-theme="rose"], [data-theme="aquatica"], [data-theme="monochrome"]';
      },
      styleOverrides: {
        borderColor: 'hsl(var(--bc) / 0.1)',
        borderRadius: '0.75rem',
        frames: {
          frameBoxShadowCssValue: 'none',
          editorActiveTabBorderColor: 'transparent',
          editorTabBarBorderColor: 'hsl(var(--bc) / 0.1)',
          editorActiveTabIndicatorHeight: '2px',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabIndicatorBottomColor: 'hsl(var(--a))',
        },
        uiFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
    }),
    mdx(), 
    react()
  ],
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['valibot']
    }
  },
  i18n: {
    defaultLocale,
    locales: getEnabledLocaleCodes(),
  },
});
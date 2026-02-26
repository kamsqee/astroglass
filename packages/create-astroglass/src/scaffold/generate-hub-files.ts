/**
 * Generate Hub Files — render EJS templates into the scaffolded project
 */
import { join, dirname } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';
import type { UserChoices } from '../index.js';
import {
  AVAILABLE_PALETTES,
  AVAILABLE_THEMES,
} from '../prompts/shared.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../templates');

/** Mapping of header version numbers to component names.
 *  headerComponent must match the import alias created in BaseLayout.astro.ejs */
const HEADER_MAP: Record<string, { headerComponent: string; version: number }> = {
  liquid:  { headerComponent: 'Header',         version: 1 },
  glass:   { headerComponent: 'HeaderGlass',    version: 2 },
  neo:     { headerComponent: 'HeaderNeo',      version: 3 },
  luxury:  { headerComponent: 'HeaderLuxury',   version: 4 },
  minimal: { headerComponent: 'HeaderMinimal',  version: 5 },
  aurora:  { headerComponent: 'HeaderAurora',   version: 6 },
};

interface HubResult {
  generated: number;
}

export async function generateHubFiles(
  projectPath: string,
  choices: UserChoices,
  dryRun: boolean
): Promise<HubResult> {
  let generated = 0;

  // Build template data
  const themes = choices.themes.map(id => ({
    id,
    ...HEADER_MAP[id],
  }));

  const darkPalettes = choices.palettes.filter(id =>
    AVAILABLE_PALETTES.find(p => p.id === id)?.category === 'dark'
  );
  const lightPalettes = choices.palettes.filter(id => {
    const info = AVAILABLE_PALETTES.find(p => p.id === id);
    return info?.category === 'light' || info?.category === 'colorful';
  });

  // Full palette definitions for palettes.ts template
  const paletteDefs = choices.palettes.map(id => {
    const info = AVAILABLE_PALETTES.find(p => p.id === id);
    // Palette accent/bg colors (from the actual palette config)
    const PALETTE_COLORS: Record<string, { accentHex: string; bgHex: string }> = {
      azure:     { accentHex: '#3B82F6', bgHex: '#FFFFFF' },
      solaris:   { accentHex: '#F59E0B', bgHex: '#FFF7ED' },
      evergreen: { accentHex: '#10B981', bgHex: '#ECFDF5' },
      rose:      { accentHex: '#F43F5E', bgHex: '#FFF1F2' },
      monochrome:{ accentHex: '#6B7280', bgHex: '#F9FAFB' },
      nordic:    { accentHex: '#06B6D4', bgHex: '#F0FDFA' },
      aquatica:  { accentHex: '#0EA5E9', bgHex: '#F0F9FF' },
      abyss:     { accentHex: '#6366F1', bgHex: '#0F172A' },
      neonoir:   { accentHex: '#EC4899', bgHex: '#18181B' },
      synthwave: { accentHex: '#8B5CF6', bgHex: '#2E1065' },
    };

    const colors = PALETTE_COLORS[id] || { accentHex: '#3B82F6', bgHex: '#FFFFFF' };
    const PALETTE_ICONS: Record<string, string> = {
      azure: '☀️', solaris: '🌅', evergreen: '🌿', rose: '🌸',
      monochrome: '⚪', nordic: '❄️', aquatica: '🐚',
      abyss: '🌙', neonoir: '🎧', synthwave: '🎹',
    };

    return {
      id,
      icon: PALETTE_ICONS[id] || '🎨',
      category: info?.category ?? 'light',
      ...colors,
    };
  });

  const templateData = {
    themes,
    palettes: choices.palettes,
    paletteDefs,
    locales: choices.locales,
    features: choices.features,
    deployTarget: choices.deployTarget,
    defaultPalette: choices.defaultPalette,
    defaultHeaderVersion: HEADER_MAP[choices.themes[0]]?.version ?? 1,
    hasGlass: choices.themes.includes('glass'),
    darkPalettes,
    lightPalettes,
    projectName: projectPath.split('/').pop() || 'my-astroglass',
  };

  // Templates to render
  const TEMPLATE_MAP: Record<string, string> = {
    'BaseLayout.astro.ejs':    'src/layouts/BaseLayout.astro',
    'theme-page.astro.ejs':    'src/pages/[...lang]/[theme].astro',
    'portfolio.astro.ejs':     'src/pages/[...lang]/[theme]/portfolio.astro',
    'global.css.ejs':          'src/styles/global.css',
    '_themes.css.ejs':         'src/styles/_themes.css',
    'astro.config.mjs.ejs':    'astro.config.mjs',
    'package.json.ejs':        'package.json',
    'active-provider.ts.ejs':  'src/config/providers/active-provider.ts',
    'palettes.ts.ejs':         'src/config/palettes.ts',
    'README.md.ejs':           'README.md',
  };

  for (const [template, output] of Object.entries(TEMPLATE_MAP)) {
    const templatePath = join(TEMPLATES_DIR, template);
    const outputPath = join(projectPath, output);

    if (dryRun) {
      console.log(`  [dry-run] Would generate: ${output}`);
      generated++;
      continue;
    }

    try {
      const templateContent = await readFile(templatePath, 'utf-8');
      const rendered = ejs.render(templateContent, templateData);
      await writeFile(outputPath, rendered, 'utf-8');
      generated++;
    } catch (err) {
      console.error(`  ⚠ Failed to generate ${output}:`, err);
    }
  }

  return { generated };
}

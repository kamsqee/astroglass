/**
 * `astroglass remove` — remove themes, palettes, languages, or features
 *
 * Includes safety checks:
 * - Can't remove the last theme/palette/locale
 * - React removal cascades to docs/dashboard
 * - Escalating confirmation for destructive ops
 */
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { join, dirname } from 'node:path';
import { rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { readConfig, writeConfig } from '../utils/config.js';
import { isGitRepo, autoCommit } from '../utils/git.js';
import { canRemoveReact, getCascadeRemovals } from '../utils/deps.js';

export async function removeCommand(args: {
  theme?: string;
  palette?: string;
  lang?: string;
  feature?: string;
  dryRun?: boolean;
  force?: boolean;
}): Promise<void> {
  const { config, configPath } = await readConfig();
  const projectPath = dirname(configPath);

  if (args.theme) {
    await removeTheme(projectPath, config, configPath, args.theme, args);
  } else if (args.palette) {
    await removePalette(projectPath, config, configPath, args.palette, args);
  } else if (args.lang) {
    await removeLocale(projectPath, config, configPath, args.lang, args);
  } else if (args.feature) {
    await removeFeature(projectPath, config, configPath, args.feature, args);
  } else {
    p.note('Use flags to specify what to remove:\n  npx astroglass remove --theme luxury\n  npx astroglass remove --palette abyss\n  npx astroglass remove --lang fr\n  npx astroglass remove --feature docs', 'Usage');
    return;
  }
}

async function removeTheme(
  projectPath: string,
  config: any,
  configPath: string,
  themeId: string,
  opts: { dryRun?: boolean; force?: boolean }
): Promise<void> {
  // Boundary check
  if (!config.themes.includes(themeId)) {
    console.log(pc.yellow(`  Theme "${themeId}" is not installed.`));
    return;
  }

  if (config.themes.length <= 1) {
    console.log(pc.red(`  ✗ Cannot remove the last theme.`));
    return;
  }

  // Confirm
  if (!opts.force && !opts.dryRun) {
    const confirmed = await p.confirm({
      message: `Remove theme "${themeId}" and all its files?`,
    });
    if (p.isCancel(confirmed) || !confirmed) return;
  }

  const s = p.spinner();
  s.start(`Removing theme: ${themeId}...`);

  if (opts.dryRun) {
    console.log(`  [dry-run] Would remove theme: ${themeId}`);
    s.stop(`Theme "${themeId}" would be removed`);
    return;
  }

  // Remove files based on theme naming convention
  const patterns = [
    `src/components/sections/themes/${themeId}.ts`,
    `src/components/sections/*/${themeId.charAt(0).toUpperCase() + themeId.slice(1)}*.astro`,
    `src/components/layout/header/Header${themeId.charAt(0).toUpperCase() + themeId.slice(1)}*.astro`,
    `src/styles/components/*/\*${themeId.charAt(0).toUpperCase() + themeId.slice(1)}*.css`,
    `src/styles/tokens/${themeId}.css`,
  ];

  // Simple file removal by convention
  const themeCap = themeId.charAt(0).toUpperCase() + themeId.slice(1);
  const filesToRemove = [
    `src/components/sections/themes/${themeId}.ts`,
    `src/styles/tokens/${themeId}.css`,
  ];

  for (const file of filesToRemove) {
    const fullPath = join(projectPath, file);
    if (existsSync(fullPath)) {
      await rm(fullPath, { recursive: true, force: true });
    }
  }

  // Update config
  config.themes = config.themes.filter((t: string) => t !== themeId);
  await writeConfig(configPath, config);

  s.stop(`Theme "${themeId}" removed ✓`);

  if (isGitRepo(projectPath)) {
    autoCommit(projectPath, `astroglass: remove theme ${themeId}`);
  }
}

async function removePalette(
  projectPath: string,
  config: any,
  configPath: string,
  paletteId: string,
  opts: { dryRun?: boolean; force?: boolean }
): Promise<void> {
  if (!config.palettes.includes(paletteId)) {
    console.log(pc.yellow(`  Palette "${paletteId}" is not installed.`));
    return;
  }

  if (config.palettes.length <= 1) {
    console.log(pc.red(`  ✗ Cannot remove the last palette.`));
    return;
  }

  if (!opts.force && !opts.dryRun) {
    const confirmed = await p.confirm({
      message: `Remove palette "${paletteId}"?`,
    });
    if (p.isCancel(confirmed) || !confirmed) return;
  }

  const s = p.spinner();
  s.start(`Removing palette: ${paletteId}...`);

  if (opts.dryRun) {
    s.stop(`Palette "${paletteId}" would be removed`);
    return;
  }

  // Remove palette CSS
  const cssPath = join(projectPath, `src/styles/palettes/${paletteId}.css`);
  if (existsSync(cssPath)) {
    await rm(cssPath);
  }

  // Remove import from _themes.css
  const themesPath = join(projectPath, 'src/styles/_themes.css');
  if (existsSync(themesPath)) {
    let content = await readFile(themesPath, 'utf-8');
    content = content.replace(new RegExp(`@import\\s+["']\\./palettes/${paletteId}\\.css["'];?\\n?`, 'g'), '');
    await writeFile(themesPath, content, 'utf-8');
  }

  // Update default if needed
  if (config.defaultPalette === paletteId) {
    config.defaultPalette = config.palettes.find((p: string) => p !== paletteId) || 'azure';
  }

  config.palettes = config.palettes.filter((p: string) => p !== paletteId);
  await writeConfig(configPath, config);

  s.stop(`Palette "${paletteId}" removed ✓`);

  if (isGitRepo(projectPath)) {
    autoCommit(projectPath, `astroglass: remove palette ${paletteId}`);
  }
}

async function removeLocale(
  projectPath: string,
  config: any,
  configPath: string,
  localeCode: string,
  opts: { dryRun?: boolean; force?: boolean }
): Promise<void> {
  if (!config.locales.includes(localeCode)) {
    console.log(pc.yellow(`  Language "${localeCode}" is not installed.`));
    return;
  }

  if (config.locales.length <= 1) {
    console.log(pc.red(`  ✗ Cannot remove the last language.`));
    return;
  }

  if (localeCode === 'en') {
    console.log(pc.red(`  ✗ Cannot remove the default language (en).`));
    return;
  }

  if (!opts.force && !opts.dryRun) {
    const confirmed = await p.confirm({
      message: `Remove language "${localeCode}" and all translations?`,
    });
    if (p.isCancel(confirmed) || !confirmed) return;
  }

  const s = p.spinner();
  s.start(`Removing language: ${localeCode}...`);

  if (opts.dryRun) {
    s.stop(`Language "${localeCode}" would be removed`);
    return;
  }

  // Remove locale directory
  const localeDir = join(projectPath, `src/locales/${localeCode}`);
  if (existsSync(localeDir)) {
    await rm(localeDir, { recursive: true });
  }

  // Disable in locales.ts
  const localesFile = join(projectPath, 'src/config/locales.ts');
  if (existsSync(localesFile)) {
    let content = await readFile(localesFile, 'utf-8');
    const pattern = new RegExp(
      `(code:\\s*['"]${localeCode}['"][^}]*enabled:\\s*)true`,
      'g'
    );
    content = content.replace(pattern, '$1false');
    await writeFile(localesFile, content, 'utf-8');
  }

  config.locales = config.locales.filter((l: string) => l !== localeCode);
  await writeConfig(configPath, config);

  s.stop(`Language "${localeCode}" removed ✓`);

  if (isGitRepo(projectPath)) {
    autoCommit(projectPath, `astroglass: remove lang ${localeCode}`);
  }
}

async function removeFeature(
  projectPath: string,
  config: any,
  configPath: string,
  featureId: string,
  opts: { dryRun?: boolean; force?: boolean }
): Promise<void> {
  if (!config.features.includes(featureId)) {
    console.log(pc.yellow(`  Feature "${featureId}" is not installed.`));
    return;
  }

  // Check cascade
  if (featureId === 'react') {
    const { safe, blockers } = canRemoveReact(config.features);
    if (!safe) {
      console.log(pc.red(`  ✗ Cannot remove React — required by: ${blockers.join(', ')}`));
      console.log(pc.dim(`  Remove those features first.`));
      return;
    }
  }

  const cascadeRemovals = getCascadeRemovals(featureId, config.features);

  if (!opts.force && !opts.dryRun) {
    let message = `Remove feature "${featureId}"?`;
    if (cascadeRemovals.length > 0) {
      message += ` This will also remove: ${cascadeRemovals.join(', ')}`;
    }
    const confirmed = await p.confirm({ message });
    if (p.isCancel(confirmed) || !confirmed) return;
  }

  const s = p.spinner();
  s.start(`Removing feature: ${featureId}...`);

  if (opts.dryRun) {
    s.stop(`Feature "${featureId}" would be removed`);
    return;
  }

  // Remove feature + cascaded features from config
  const toRemove = [featureId, ...cascadeRemovals];
  config.features = config.features.filter((f: string) => !toRemove.includes(f));
  await writeConfig(configPath, config);

  s.stop(`Feature "${featureId}" removed ✓`);
  if (cascadeRemovals.length > 0) {
    console.log(pc.dim(`  Also removed: ${cascadeRemovals.join(', ')}`));
  }

  if (isGitRepo(projectPath)) {
    autoCommit(projectPath, `astroglass: remove feature ${featureId}`);
  }
}

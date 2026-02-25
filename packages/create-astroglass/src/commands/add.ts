/**
 * `astroglass add` — add themes, palettes, languages, or features
 */
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { join, dirname } from 'node:path';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { readConfig, writeConfig } from '../utils/config.js';
import { isGitRepo, hasUncommittedChanges, autoCommit } from '../utils/git.js';
import { getRequiredDeps } from '../utils/deps.js';

export async function addCommand(args: {
  theme?: string;
  palette?: string;
  lang?: string;
  feature?: string;
  dryRun?: boolean;
}): Promise<void> {
  const { config, configPath } = await readConfig();
  const projectPath = dirname(configPath);

  // Determine what to add
  if (args.theme) {
    await addTheme(projectPath, config, args.theme, args.dryRun);
  } else if (args.palette) {
    await addPalette(projectPath, config, args.palette, args.dryRun);
  } else if (args.lang) {
    await addLocale(projectPath, config, args.lang, args.dryRun);
  } else if (args.feature) {
    await addFeature(projectPath, config, args.feature, args.dryRun);
  } else {
    // Interactive mode — ask what to add
    const type = await p.select({
      message: 'What would you like to add?',
      options: [
        { value: 'theme', label: '🎨 Theme' },
        { value: 'palette', label: '🎭 Palette' },
        { value: 'lang', label: '🌐 Language' },
        { value: 'feature', label: '⚡ Feature' },
      ],
    });

    if (p.isCancel(type)) return;

    // TODO: Show available options based on type
    p.note('Interactive add coming soon — use flags for now:\n  npx astroglass add --theme luxury\n  npx astroglass add --palette abyss\n  npx astroglass add --lang fr\n  npx astroglass add --feature docs', 'Usage');
    return;
  }

  // Update config
  if (!args.dryRun) {
    await writeConfig(configPath, config);

    // Auto-commit if git repo
    if (isGitRepo(projectPath)) {
      const what = args.theme ? `theme: ${args.theme}` :
                   args.palette ? `palette: ${args.palette}` :
                   args.lang ? `lang: ${args.lang}` :
                   `feature: ${args.feature}`;
      autoCommit(projectPath, `astroglass: add ${what}`);
    }
  }
}

async function addTheme(
  projectPath: string,
  config: any,
  themeId: string,
  dryRun?: boolean
): Promise<void> {
  if (config.themes.includes(themeId)) {
    console.log(pc.yellow(`  Theme "${themeId}" is already installed.`));
    return;
  }

  const s = p.spinner();
  s.start(`Adding theme: ${themeId}...`);

  // The theme files need to be downloaded from the template repo
  // For now, we note that the add command requires the template repo as a source
  if (dryRun) {
    console.log(`  [dry-run] Would add theme: ${themeId}`);
    s.stop(`Theme "${themeId}" would be added`);
    return;
  }

  // TODO: Download theme files from template repo via giget
  // For now, add to config so the intent is recorded
  config.themes.push(themeId);
  s.stop(`Theme "${themeId}" added to config ✓`);
  console.log(pc.dim(`  Note: Run 'pnpm build' to verify the new theme works.`));
}

async function addPalette(
  projectPath: string,
  config: any,
  paletteId: string,
  dryRun?: boolean
): Promise<void> {
  if (config.palettes.includes(paletteId)) {
    console.log(pc.yellow(`  Palette "${paletteId}" is already installed.`));
    return;
  }

  const s = p.spinner();
  s.start(`Adding palette: ${paletteId}...`);

  if (dryRun) {
    console.log(`  [dry-run] Would add palette: ${paletteId}`);
    s.stop(`Palette "${paletteId}" would be added`);
    return;
  }

  // Add import to _themes.css
  const themesPath = join(projectPath, 'src/styles/_themes.css');
  if (existsSync(themesPath)) {
    let content = await readFile(themesPath, 'utf-8');
    const importLine = `@import "./palettes/${paletteId}.css";`;
    if (!content.includes(importLine)) {
      content = content.trimEnd() + '\n' + importLine + '\n';
      await writeFile(themesPath, content, 'utf-8');
    }
  }

  config.palettes.push(paletteId);
  s.stop(`Palette "${paletteId}" added ✓`);
}

async function addLocale(
  projectPath: string,
  config: any,
  localeCode: string,
  dryRun?: boolean
): Promise<void> {
  if (config.locales.includes(localeCode)) {
    console.log(pc.yellow(`  Language "${localeCode}" is already installed.`));
    return;
  }

  const s = p.spinner();
  s.start(`Adding language: ${localeCode}...`);

  if (dryRun) {
    console.log(`  [dry-run] Would add language: ${localeCode}`);
    s.stop(`Language "${localeCode}" would be added`);
    return;
  }

  // Enable the locale in locales.ts
  const localesFile = join(projectPath, 'src/config/locales.ts');
  if (existsSync(localesFile)) {
    let content = await readFile(localesFile, 'utf-8');
    const pattern = new RegExp(
      `(code:\\s*['"]${localeCode}['"][^}]*enabled:\\s*)false`,
      'g'
    );
    content = content.replace(pattern, '$1true');
    await writeFile(localesFile, content, 'utf-8');
  }

  config.locales.push(localeCode);
  s.stop(`Language "${localeCode}" added ✓`);
}

async function addFeature(
  projectPath: string,
  config: any,
  featureId: string,
  dryRun?: boolean
): Promise<void> {
  if (config.features.includes(featureId)) {
    console.log(pc.yellow(`  Feature "${featureId}" is already installed.`));
    return;
  }

  const s = p.spinner();
  s.start(`Adding feature: ${featureId}...`);

  // Check required deps
  const reqDeps = getRequiredDeps(featureId);
  if (reqDeps.length > 0) {
    p.note(`Required packages: ${reqDeps.join(', ')}`, 'Dependencies');
  }

  if (dryRun) {
    console.log(`  [dry-run] Would add feature: ${featureId}`);
    s.stop(`Feature "${featureId}" would be added`);
    return;
  }

  // Add react dependency if needed
  if (reqDeps.includes('react') && !config.features.includes('react')) {
    config.features.push('react');
  }

  config.features.push(featureId);
  s.stop(`Feature "${featureId}" added to config ✓`);
  console.log(pc.dim(`  Run 'pnpm install' to install new dependencies.`));
}

/**
 * Scaffolding Engine — orchestrates the full scaffold flow
 */
import * as p from '@clack/prompts';
import type { UserChoices } from '../index.js';
import { downloadTemplate } from './download.js';
import { pruneThemes } from './prune-themes.js';
import { prunePalettes } from './prune-palettes.js';
import { pruneLocales } from './prune-locales.js';
import { pruneFeatures } from './prune-features.js';
import { generateHubFiles } from './generate-hub-files.js';
import { generateConfig } from './generate-config.js';
import { cleanup } from './cleanup.js';

export interface ScaffoldOptions {
  dryRun: boolean;
}

export interface ScaffoldResult {
  filesRemoved: number;
  filesGenerated: number;
  totalFiles: number;
  duration: number;
}

export async function scaffold(
  choices: UserChoices,
  options: ScaffoldOptions
): Promise<ScaffoldResult> {
  const start = Date.now();
  let filesRemoved = 0;
  let filesGenerated = 0;

  const s = p.spinner();

  // Step 1: Download template
  s.start('Downloading Astroglass template...');
  const projectPath = await downloadTemplate(choices.projectDir, options.dryRun);
  s.stop('Template downloaded ✓');

  // Step 2: Prune themes
  s.start('Removing unselected themes...');
  const themeResult = await pruneThemes(projectPath, choices.themes, options.dryRun);
  filesRemoved += themeResult.removed;
  s.stop(`Pruned ${themeResult.removed} theme files ✓`);

  // Step 3: Prune palettes
  s.start('Removing unselected palettes...');
  const paletteResult = await prunePalettes(projectPath, choices.palettes, options.dryRun);
  filesRemoved += paletteResult.removed;
  s.stop(`Pruned ${paletteResult.removed} palette files ✓`);

  // Step 4: Prune locales
  if (choices.locales.length < 7) {
    s.start('Removing unselected languages...');
    const localeResult = await pruneLocales(projectPath, choices.locales, options.dryRun);
    filesRemoved += localeResult.removed;
    s.stop(`Pruned ${localeResult.removed} locale files ✓`);
  }

  // Step 5: Prune features
  s.start('Removing unselected features...');
  const featureResult = await pruneFeatures(projectPath, choices.features, options.dryRun);
  filesRemoved += featureResult.removed;
  s.stop(`Pruned ${featureResult.removed} feature files ✓`);

  // Step 6: Generate hub files from EJS templates
  s.start('Generating configuration files...');
  const hubResult = await generateHubFiles(projectPath, choices, options.dryRun);
  filesGenerated += hubResult.generated;
  s.stop(`Generated ${hubResult.generated} config files ✓`);

  // Step 7: Write astroglass.config.json
  s.start('Writing project config...');
  await generateConfig(projectPath, choices, options.dryRun);
  filesGenerated += 1;
  s.stop('Project config written ✓');

  // Step 8: Cleanup
  s.start('Cleaning up...');
  await cleanup(projectPath, options.dryRun);
  s.stop('Cleanup complete ✓');

  const duration = Date.now() - start;

  return {
    filesRemoved,
    filesGenerated,
    totalFiles: 0, // Will be counted post-scaffold
    duration,
  };
}

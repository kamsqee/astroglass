/**
 * Generate Config — write astroglass.config.json for post-init management
 */
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { UserChoices } from '../index.js';

export interface AstroglassConfig {
  version: string;
  themes: string[];
  palettes: string[];
  locales: string[];
  features: string[];
  deployTarget: string;
  defaultPalette: string;
  createdAt: string;
}

export async function generateConfig(
  projectPath: string,
  choices: UserChoices,
  dryRun: boolean
): Promise<void> {
  const config: AstroglassConfig = {
    version: '1.0.0',
    themes: choices.themes,
    palettes: choices.palettes,
    locales: choices.locales,
    features: choices.features,
    deployTarget: choices.deployTarget,
    defaultPalette: choices.defaultPalette,
    createdAt: new Date().toISOString(),
  };

  const outputPath = join(projectPath, 'astroglass.config.json');

  if (dryRun) {
    console.log(`  [dry-run] Would write: astroglass.config.json`);
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  await writeFile(outputPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

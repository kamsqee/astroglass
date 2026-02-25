/**
 * Config Utility — read/write/validate astroglass.config.json
 */
import { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

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

const CONFIG_FILENAME = 'astroglass.config.json';

/**
 * Find and read the project config, searching upward from cwd
 */
export async function readConfig(cwd?: string): Promise<{ config: AstroglassConfig; configPath: string }> {
  const dir = cwd || process.cwd();
  const configPath = join(dir, CONFIG_FILENAME);

  if (!existsSync(configPath)) {
    throw new Error(
      `No ${CONFIG_FILENAME} found in ${dir}. Are you in an Astroglass project?`
    );
  }

  const raw = await readFile(configPath, 'utf-8');
  const config: AstroglassConfig = JSON.parse(raw);

  return { config, configPath };
}

/**
 * Write updated config back to disk
 */
export async function writeConfig(
  configPath: string,
  config: AstroglassConfig
): Promise<void> {
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/**
 * Validate config against filesystem
 */
export function validateConfig(
  projectPath: string,
  config: AstroglassConfig
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check theme barrel files exist
  for (const theme of config.themes) {
    const barrel = join(projectPath, `src/components/sections/themes/${theme}.ts`);
    if (!existsSync(barrel)) {
      issues.push(`Theme "${theme}" barrel file missing: ${barrel}`);
    }
  }

  // Check palette CSS files exist
  for (const palette of config.palettes) {
    const css = join(projectPath, `src/styles/palettes/${palette}.css`);
    if (!existsSync(css)) {
      issues.push(`Palette "${palette}" CSS file missing: ${css}`);
    }
  }

  // Check locale directories exist
  for (const locale of config.locales) {
    const dir = join(projectPath, `src/locales/${locale}`);
    if (!existsSync(dir)) {
      issues.push(`Locale "${locale}" directory missing: ${dir}`);
    }
  }

  return { valid: issues.length === 0, issues };
}

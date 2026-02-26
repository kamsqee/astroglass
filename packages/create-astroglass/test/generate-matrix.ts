/**
 * Test Matrix Generator
 *
 * Reads CLI option definitions from shared.ts and generates
 * a comprehensive test matrix covering all themes, features,
 * deploy targets, and presets.
 *
 * Run: npx tsx test/generate-matrix.ts
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AVAILABLE_THEMES,
  AVAILABLE_FEATURES,
  DEPLOY_TARGETS,
  PRESETS,
  resolveFeatureDeps,
} from '../src/prompts/shared.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TestCase {
  id: string;
  category: 'preset' | 'solo-theme' | 'feature-isolation' | 'deploy-target';
  themes: string[];
  palettes: string[];
  locales: string[];
  features: string[];
  deployTarget: string;
}

function generateMatrix(): TestCase[] {
  const tests: TestCase[] = [];

  // ─── 1. Every preset ───
  for (const [id, preset] of Object.entries(PRESETS)) {
    tests.push({
      id: `preset-${id}`,
      category: 'preset',
      themes: preset.themes,
      palettes: preset.palettes,
      locales: preset.locales,
      features: preset.features,
      deployTarget: preset.deployTarget,
    });
  }

  // Themes that import React UI components (ui/button, ui/card, etc.)
  const REACT_REQUIRED_THEMES = ['glass', 'minimal'];

  AVAILABLE_THEMES.forEach((theme, i) => {
    const deploy = DEPLOY_TARGETS[i % DEPLOY_TARGETS.length].value;
    const features = REACT_REQUIRED_THEMES.includes(theme.id) ? ['react'] : [];
    tests.push({
      id: `solo-${theme.id}`,
      category: 'solo-theme',
      themes: [theme.id],
      palettes: ['azure'],
      locales: ['en'],
      features,
      deployTarget: deploy,
    });
  });

  // ─── 3. Every feature in isolation ───
  AVAILABLE_FEATURES.forEach((feat, i) => {
    const theme = AVAILABLE_THEMES[i % AVAILABLE_THEMES.length].id;
    const deploy = DEPLOY_TARGETS[i % DEPLOY_TARGETS.length].value;
    const features = resolveFeatureDeps([feat.id]);

    tests.push({
      id: `feat-${feat.id}`,
      category: 'feature-isolation',
      themes: [theme],
      palettes: ['abyss'],
      locales: ['en'],
      features,
      deployTarget: deploy,
    });
  });

  // ─── 4. Every deploy target with a standard feature set ───
  for (const target of DEPLOY_TARGETS) {
    tests.push({
      id: `deploy-${target.value}`,
      category: 'deploy-target',
      themes: ['liquid', 'glass'],
      palettes: ['azure', 'abyss'],
      locales: ['en'],
      features: ['blog', 'docs', 'react'],
      deployTarget: target.value,
    });
  }

  return tests;
}

// ─── Main ───
const matrix = generateMatrix();
const outPath = join(__dirname, 'matrix.json');
writeFileSync(outPath, JSON.stringify(matrix, null, 2) + '\n');

console.log(`Generated ${matrix.length} test cases → test/matrix.json`);
console.log('');
for (const t of matrix) {
  const feats = t.features.length ? t.features.join(',') : 'none';
  console.log(`  ${t.id.padEnd(22)} themes=${t.themes.join(',')}  features=${feats}  deploy=${t.deployTarget}`);
}

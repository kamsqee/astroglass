/**
 * Custom Flow — Full control over every option
 */
import * as p from '@clack/prompts';
import type { UserChoices } from '../index.js';
import {
  AVAILABLE_THEMES,
  AVAILABLE_PALETTES,
  AVAILABLE_LOCALES,
  AVAILABLE_FEATURES,
  DEPLOY_TARGETS,
  resolveFeatureDeps,
} from './shared.js';

export async function runCustomFlow(dirArg?: string): Promise<UserChoices> {
  // 1. Project directory
  const projectDir = dirArg || await p.text({
    message: 'Where should we create your project?',
    placeholder: './my-astroglass',
    defaultValue: './my-astroglass',
    validate: (value) => {
      if (!value) return 'Please enter a directory path';
    },
  });

  if (p.isCancel(projectDir)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // 2. Pick themes (multi-select)
  const themes = await p.multiselect({
    message: 'Select themes to include (Space to toggle, Enter to confirm):',
    options: AVAILABLE_THEMES.map(t => ({
      value: t.id,
      label: t.label,
      hint: t.hint,
    })),
    initialValues: ['liquid'],
    required: true,
  });

  if (p.isCancel(themes)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // 3. Pick palettes (multi-select)
  const palettes = await p.multiselect({
    message: 'Select color palettes (Space to toggle, Enter to confirm):',
    options: AVAILABLE_PALETTES.map(pal => ({
      value: pal.id,
      label: pal.label,
      hint: pal.category,
    })),
    initialValues: ['azure'],
    required: true,
  });

  if (p.isCancel(palettes)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // 4. Default palette
  const defaultPalette = await p.select({
    message: 'Default palette (shown on first load):',
    options: (palettes as string[]).map(id => {
      const info = AVAILABLE_PALETTES.find(pal => pal.id === id);
      return { value: id, label: info?.label ?? id };
    }),
  });

  if (p.isCancel(defaultPalette)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // 5. Languages
  const locales = await p.multiselect({
    message: 'Select languages (Space to toggle, Enter to confirm):',
    options: AVAILABLE_LOCALES.map(l => ({
      value: l.code,
      label: l.label,
    })),
    initialValues: ['en'],
    required: true,
  });

  if (p.isCancel(locales)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // 6. Features — ask if they want any first
  const wantFeatures = await p.confirm({
    message: 'Include extra features (blog, docs, dashboard)?',
    initialValue: false,
  });

  if (p.isCancel(wantFeatures)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  let features: string[] = [];
  if (wantFeatures) {
    const selected = await p.multiselect({
      message: 'Select features (Space to toggle, Enter to confirm):',
      options: AVAILABLE_FEATURES.map(f => ({
        value: f.id,
        label: f.label,
        hint: f.hint,
      })),
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }
    features = selected as string[];
  }

  // 7. Deploy target
  const deploy = await p.select({
    message: 'Deploy target:',
    options: DEPLOY_TARGETS.map(d => ({
      value: d.value,
      label: d.label,
      hint: d.hint,
    })),
  });

  if (p.isCancel(deploy)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const resolvedFeatures = resolveFeatureDeps(features);

  return {
    projectDir: projectDir as string,
    themes: themes as string[],
    palettes: palettes as string[],
    locales: locales as string[],
    features: resolvedFeatures,
    deployTarget: deploy as string,
    defaultPalette: defaultPalette as string,
  };
}

/**
 * Preset Flow — choose a preset, optionally customize it
 */
import * as p from '@clack/prompts';
import type { UserChoices } from '../index.js';
import { PRESETS, resolveFeatureDeps } from './shared.js';

export async function runPresetFlow(
  dirArg?: string,
  presetArg?: string,
  args?: Record<string, unknown>
): Promise<UserChoices> {
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

  // 2. Choose preset
  let presetId = presetArg;

  if (!presetId || !PRESETS[presetId]) {
    const selected = await p.select({
      message: 'Choose a preset:',
      options: Object.entries(PRESETS).map(([id, preset]) => ({
        value: id,
        label: `${preset.name}`,
        hint: preset.description,
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    presetId = selected as string;
  }

  const preset = PRESETS[presetId];

  // Show what's included
  p.note(
    [
      `Themes:   ${preset.themes.join(', ')}`,
      `Palettes: ${preset.palettes.join(', ')}`,
      `Locales:  ${preset.locales.join(', ')}`,
      `Features: ${preset.features.length > 0 ? preset.features.join(', ') : 'none'}`,
      `Deploy:   ${preset.deployTarget}`,
    ].join('\n'),
    `📦 ${preset.name} Preset`
  );

  // 3. Ask if they want to customize
  const customize = await p.confirm({
    message: 'Want to customize this preset?',
    initialValue: false,
  });

  if (p.isCancel(customize)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  if (customize) {
    // Let them add/remove locales and deploy target
    const locales = await p.multiselect({
      message: 'Adjust languages?',
      options: [
        { value: 'en', label: '🇬🇧 English' },
        { value: 'ru', label: '🇷🇺 Русский' },
        { value: 'es', label: '🇪🇸 Español' },
        { value: 'fr', label: '🇫🇷 Français' },
        { value: 'zh', label: '🇨🇳 中文' },
        { value: 'ja', label: '🇯🇵 日本語' },
        { value: 'kk', label: '🇰🇿 Қазақша' },
      ],
      initialValues: preset.locales,
      required: true,
    });

    if (p.isCancel(locales)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    const deploy = await p.select({
      message: 'Deploy target:',
      options: [
        { value: 'cloudflare', label: '☁️ Cloudflare Pages' },
        { value: 'vercel',     label: '▲ Vercel' },
        { value: 'netlify',    label: '◈ Netlify' },
        { value: 'static',     label: '📁 Static' },
      ],
    });

    if (p.isCancel(deploy)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    return {
      projectDir: projectDir as string,
      themes: preset.themes,
      palettes: preset.palettes,
      locales: locales as string[],
      features: resolveFeatureDeps(preset.features),
      deployTarget: deploy as string,
      defaultPalette: preset.palettes[0],
    };
  }

  return {
    projectDir: projectDir as string,
    themes: preset.themes,
    palettes: preset.palettes,
    locales: preset.locales,
    features: resolveFeatureDeps(preset.features),
    deployTarget: preset.deployTarget,
    defaultPalette: preset.palettes[0],
  };
}

#!/usr/bin/env node
/**
 * create-astroglass — CLI entry point
 *
 * Usage:
 *   create-astroglass [dir] [options]       Scaffold a new project
 *   create-astroglass status [--validate]   Show project config
 *   create-astroglass add --theme liquid    Add a component
 *   create-astroglass remove --theme neo    Remove a component
 *   create-astroglass repair                Fix config issues
 */

import { defineCommand, runMain } from 'citty';
import { showBanner } from './prompts/banner.js';
import { runQuickStart } from './prompts/quick-start.js';
import { runCustomFlow } from './prompts/custom.js';
import { runPresetFlow } from './prompts/preset.js';
import { scaffold } from './scaffold/index.js';
import { showSummary } from './summary.js';
import { statusCommand } from './commands/status.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { repairCommand } from './commands/repair.js';
import * as p from '@clack/prompts';

export interface UserChoices {
  projectDir: string;
  themes: string[];
  palettes: string[];
  locales: string[];
  features: string[];
  deployTarget: string;
  defaultPalette: string;
}

// ─── Manual subcommand routing ───
// We route manually because citty's subCommands API conflicts with positional dir args:
// when subCommands is set, citty treats the first positional arg as a command name.
const SUB_COMMANDS = ['status', 'add', 'remove', 'repair'] as const;
const firstArg = process.argv[2];

if (firstArg && SUB_COMMANDS.includes(firstArg as any)) {
  const subCmd = firstArg as (typeof SUB_COMMANDS)[number];
  const subArgv = process.argv.slice(3);

  const parseFlag = (name: string): string | undefined => {
    const idx = subArgv.indexOf(`--${name}`);
    if (idx === -1) return undefined;
    return subArgv[idx + 1];
  };
  const hasFlag = (name: string): boolean => subArgv.includes(`--${name}`);

  switch (subCmd) {
    case 'status':
      statusCommand({ validate: hasFlag('validate') });
      break;
    case 'add':
      addCommand({
        theme: parseFlag('theme'),
        palette: parseFlag('palette'),
        lang: parseFlag('lang'),
        feature: parseFlag('feature'),
        dryRun: hasFlag('dry-run'),
      });
      break;
    case 'remove':
      removeCommand({
        theme: parseFlag('theme'),
        palette: parseFlag('palette'),
        lang: parseFlag('lang'),
        feature: parseFlag('feature'),
        force: hasFlag('force'),
        dryRun: hasFlag('dry-run'),
      });
      break;
    case 'repair':
      repairCommand({ fix: hasFlag('fix'), dryRun: hasFlag('dry-run') });
      break;
  }
} else {
  // ─── Init flow — citty handles flags + positional dir ───
  const initCommand = defineCommand({
    meta: {
      name: 'create-astroglass',
      version: '1.0.0',
      description: 'Scaffold a new Astroglass project',
    },
    args: {
      dir: {
        type: 'positional',
        description: 'Project directory',
        required: false,
      },
      preset: {
        type: 'string',
        description: 'Use a preset (minimal, standard, full)',
      },
      theme: {
        type: 'string',
        description: 'Comma-separated theme ids',
      },
      features: {
        type: 'string',
        description: 'Comma-separated feature ids',
      },
      'no-features': {
        type: 'boolean',
        description: 'Disable all optional features',
        default: false,
      },
      locales: {
        type: 'string',
        description: 'Comma-separated locale codes',
      },
      palettes: {
        type: 'string',
        description: 'Comma-separated palette ids',
      },
      deploy: {
        type: 'string',
        description: 'Deploy target',
        default: 'cloudflare',
      },
      yes: {
        type: 'boolean',
        description: 'Skip confirmation prompts',
        default: false,
      },
      'dry-run': {
        type: 'boolean',
        description: 'Show what would be done',
        default: false,
      },
    },
    async run({ args }) {
      showBanner();

      let choices: UserChoices;

      if (args.preset) {
        choices = await runPresetFlow(args.dir, args.preset, args);
      } else if (args.theme) {
        choices = {
          projectDir: args.dir || './my-astroglass',
          themes: args.theme.split(',').map(s => s.trim()),
          palettes: args.palettes?.split(',') ?? ['azure'],
          locales: args.locales?.split(',') ?? ['en'],
          features: args['no-features'] ? [] : (args.features?.split(',').map(s => s.trim()) ?? []),
          deployTarget: args.deploy ?? 'cloudflare',
          defaultPalette: args.palettes?.split(',')[0] ?? 'azure',
        };
      } else {
        p.intro('Let\'s create your Astroglass project!');

        const mode = await p.select({
          message: 'How would you like to get started?',
          options: [
            { value: 'quick', label: '⚡ Quick Start', hint: '5 questions, done in 30 seconds' },
            { value: 'preset', label: '📦 Use a Preset', hint: 'Minimal, Standard, or Full' },
            { value: 'custom', label: '🎨 Custom', hint: 'Pick themes per section' },
          ],
        });

        if (p.isCancel(mode)) {
          p.cancel('Setup cancelled.');
          process.exit(0);
        }

        switch (mode) {
          case 'quick':
            choices = await runQuickStart(args.dir);
            break;
          case 'preset':
            choices = await runPresetFlow(args.dir, undefined, args);
            break;
          case 'custom':
            choices = await runCustomFlow(args.dir);
            break;
          default:
            choices = await runQuickStart(args.dir);
        }
      }

      if (!args.yes && !args['dry-run']) {
        const confirmed = await p.confirm({
          message: 'Ready to scaffold your project?',
        });

        if (p.isCancel(confirmed) || !confirmed) {
          p.cancel('Setup cancelled.');
          process.exit(0);
        }
      }

      const result = await scaffold(choices, {
        dryRun: args['dry-run'] ?? false,
      });

      showSummary(choices, result);
    },
  });

  runMain(initCommand);
}

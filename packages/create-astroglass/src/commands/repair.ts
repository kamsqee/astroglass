/**
 * `astroglass repair` — validate config vs filesystem and offer auto-fix
 */
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readConfig, writeConfig, validateConfig } from '../utils/config.js';

export async function repairCommand(options: {
  fix?: boolean;
  dryRun?: boolean;
}): Promise<void> {
  try {
    const { config, configPath } = await readConfig();
    const projectPath = dirname(configPath);

    console.log('');
    console.log(pc.bold('  Astroglass Repair'));
    console.log(pc.dim('  ─'.repeat(25)));
    console.log('');

    const { valid, issues } = validateConfig(projectPath, config);

    if (valid) {
      console.log(pc.green('  ✓ No issues found — project is consistent.'));
      console.log('');
      return;
    }

    console.log(pc.yellow(`  Found ${issues.length} issue(s):`));
    console.log('');
    for (const issue of issues) {
      console.log(`  ${pc.red('!')} ${issue}`);
    }
    console.log('');

    // Offer to auto-fix
    if (!options.fix && !options.dryRun) {
      const fix = await p.confirm({
        message: 'Auto-fix by removing missing items from config?',
      });

      if (p.isCancel(fix) || !fix) {
        console.log(pc.dim('  No changes made.'));
        return;
      }
    }

    const s = p.spinner();
    s.start('Repairing config...');

    // Remove themes that don't have barrel files
    config.themes = config.themes.filter((theme: string) => {
      const barrel = join(projectPath, `src/components/sections/themes/${theme}.ts`);
      return existsSync(barrel);
    });

    // Remove palettes that don't have CSS files
    config.palettes = config.palettes.filter((palette: string) => {
      const css = join(projectPath, `src/styles/palettes/${palette}.css`);
      return existsSync(css);
    });

    // Remove locales that don't have directories
    config.locales = config.locales.filter((locale: string) => {
      const dir = join(projectPath, `src/locales/${locale}`);
      return existsSync(dir);
    });

    // Fix default palette
    if (!config.palettes.includes(config.defaultPalette)) {
      config.defaultPalette = config.palettes[0] || 'azure';
    }

    // Ensure at least one of each
    if (config.themes.length === 0) {
      console.log(pc.red('  ✗ No valid themes found. Cannot repair automatically.'));
      s.stop('Repair failed');
      return;
    }
    if (config.palettes.length === 0) {
      console.log(pc.red('  ✗ No valid palettes found. Cannot repair automatically.'));
      s.stop('Repair failed');
      return;
    }
    if (config.locales.length === 0) {
      config.locales = ['en']; // Fallback to English
    }

    if (options.dryRun) {
      s.stop('Repair preview complete');
      console.log('');
      console.log(pc.dim('  [dry-run] Would update config to:'));
      console.log(`  Themes:   ${config.themes.join(', ')}`);
      console.log(`  Palettes: ${config.palettes.join(', ')}`);
      console.log(`  Locales:  ${config.locales.join(', ')}`);
      return;
    }

    await writeConfig(configPath, config);
    s.stop('Config repaired ✓');

    // Re-validate
    const recheck = validateConfig(projectPath, config);
    if (recheck.valid) {
      console.log(pc.green('  ✓ All issues resolved.'));
    } else {
      console.log(pc.yellow(`  ${recheck.issues.length} issue(s) remain — may need manual fix.`));
    }
    console.log('');
  } catch (err: any) {
    console.error(pc.red(`  ✗ ${err.message}`));
    process.exit(1);
  }
}

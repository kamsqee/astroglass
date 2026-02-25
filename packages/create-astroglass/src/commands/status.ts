/**
 * `astroglass status` — show current project configuration
 */
import pc from 'picocolors';
import { readConfig, validateConfig } from '../utils/config.js';
import { dirname } from 'node:path';

export async function statusCommand(options: { validate?: boolean }): Promise<void> {
  try {
    const { config, configPath } = await readConfig();
    const projectPath = dirname(configPath);

    console.log('');
    console.log(pc.bold('  Astroglass Project Status'));
    console.log(pc.dim('  ─'.repeat(25)));
    console.log('');

    console.log(`  ${pc.bold('Version:')}     ${config.version}`);
    console.log(`  ${pc.bold('Created:')}     ${new Date(config.createdAt).toLocaleDateString()}`);
    console.log('');

    // Themes
    console.log(`  ${pc.bold('Themes')} (${config.themes.length}/6)`);
    for (const theme of config.themes) {
      console.log(`    ${pc.green('●')} ${theme}`);
    }
    console.log('');

    // Palettes
    console.log(`  ${pc.bold('Palettes')} (${config.palettes.length}/10)`);
    for (const palette of config.palettes) {
      console.log(`    ${pc.cyan('◆')} ${palette}`);
    }
    console.log('');

    // Locales
    console.log(`  ${pc.bold('Languages')} (${config.locales.length}/7)`);
    for (const locale of config.locales) {
      console.log(`    ${pc.yellow('○')} ${locale}`);
    }
    console.log('');

    // Features
    console.log(`  ${pc.bold('Features')} (${config.features.length}/4)`);
    if (config.features.length > 0) {
      for (const feature of config.features) {
        console.log(`    ${pc.magenta('◇')} ${feature}`);
      }
    } else {
      console.log(`    ${pc.dim('none')}`);
    }
    console.log('');

    // Deploy target
    console.log(`  ${pc.bold('Deploy:')}      ${config.deployTarget}`);
    console.log(`  ${pc.bold('Default:')}     ${config.defaultPalette}`);
    console.log('');

    // Validation
    if (options.validate) {
      console.log(pc.dim('  ─'.repeat(25)));
      console.log(`  ${pc.bold('Validation')}`);
      console.log('');

      const { valid, issues } = validateConfig(projectPath, config);

      if (valid) {
        console.log(`  ${pc.green('✓')} All files present and config is consistent`);
      } else {
        console.log(`  ${pc.red('✗')} Found ${issues.length} issue(s):`);
        for (const issue of issues) {
          console.log(`    ${pc.red('!')} ${issue}`);
        }
        console.log('');
        console.log(pc.dim(`  Run ${pc.cyan('npx astroglass repair')} to fix issues`));
      }
      console.log('');
    }
  } catch (err: any) {
    console.error(pc.red(`  ✗ ${err.message}`));
    process.exit(1);
  }
}

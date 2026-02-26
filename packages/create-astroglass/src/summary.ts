/**
 * Summary — display a styled summary card after scaffolding
 */
import pc from 'picocolors';
import type { UserChoices } from './index.js';
import type { ScaffoldResult } from './scaffold/index.js';

export function showSummary(
  choices: UserChoices,
  result: ScaffoldResult
): void {
  const seconds = (result.duration / 1000).toFixed(1);

  console.log('');
  console.log(pc.green('  ✓ Project scaffolded successfully!'));
  console.log('');

  // Box-style summary
  const lines = [
    `${pc.bold('Directory:')}   ${choices.projectDir}`,
    `${pc.bold('Themes:')}      ${choices.themes.join(', ')}`,
    `${pc.bold('Palettes:')}    ${choices.palettes.join(', ')}`,
    `${pc.bold('Languages:')}   ${choices.locales.join(', ')}`,
    `${pc.bold('Features:')}    ${choices.features.length > 0 ? choices.features.join(', ') : 'none'}`,
    `${pc.bold('Deploy:')}      ${choices.deployTarget}`,
    '',
    pc.dim(`${result.filesRemoved} files pruned · ${result.filesGenerated} files generated · ${seconds}s`),
  ];

  const maxLen = 60;
  const top = '╭' + '─'.repeat(maxLen) + '╮';
  const bottom = '╰' + '─'.repeat(maxLen) + '╯';

  console.log(pc.dim(top));
  for (const line of lines) {
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
    const pad = maxLen - stripped.length;
    console.log(pc.dim('│') + ' ' + line + ' '.repeat(Math.max(0, pad - 1)) + pc.dim('│'));
  }
  console.log(pc.dim(bottom));

  // Post-scaffold check warning
  if (result.checkPassed === false) {
    console.log('');
    console.log(pc.yellow('  ⚠ astro check reported errors. Run `npx astro check` after install to investigate.'));
  }

  // Next steps
  console.log('');
  console.log(pc.bold('  Next steps:'));
  console.log('');
  console.log(`  ${pc.cyan('cd')} ${choices.projectDir}`);
  console.log(`  ${pc.cyan('pnpm install')}`);
  console.log(`  ${pc.cyan('pnpm dev')}`);
  console.log('');

  // Hints for extensibility
  console.log(pc.dim('  Want to add more themes or features later?'));
  console.log(pc.dim(`  ${pc.cyan('npx astroglass add --theme luxury')}`));
  console.log(pc.dim(`  ${pc.cyan('npx astroglass add docs')}`));
  console.log('');
}

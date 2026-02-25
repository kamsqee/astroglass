/**
 * Test Reporter
 *
 * Reads test/results/{id}/*.status files and generates
 * a summary table in markdown and console output.
 *
 * Run: npx tsx test/report.ts
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, 'results');
const MATRIX_PATH = join(__dirname, 'matrix.json');

interface TestCase {
  id: string;
  category: string;
  themes: string[];
  features: string[];
  deployTarget: string;
}

function readStatus(id: string, stage: string): string {
  const path = join(RESULTS_DIR, id, `${stage}.status`);
  if (!existsSync(path)) return '—';
  return readFileSync(path, 'utf8').trim();
}

function readErrorSnippet(id: string, stage: string): string {
  const logPath = join(RESULTS_DIR, id, `${stage}.log`);
  if (!existsSync(logPath)) return '';
  const log = readFileSync(logPath, 'utf8');
  const errorLines = log.split('\n').filter(l =>
    l.includes('ERROR') || l.includes('error') || l.includes('could not be resolved') || l.includes('FAIL')
  );
  return errorLines.slice(0, 3).join(' | ');
}

function icon(status: string): string {
  if (status === 'PASS') return '✅';
  if (status === 'FAIL') return '❌';
  if (status === 'SKIP') return '⊘';
  return '—';
}

// ─── Main ───
if (!existsSync(RESULTS_DIR)) {
  console.error('No results found. Run test/run-tests.sh first.');
  process.exit(1);
}

const matrix: TestCase[] = JSON.parse(readFileSync(MATRIX_PATH, 'utf8'));
const stages = ['scaffold', 'install', 'build'];

// Console output
console.log('');
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                    CLI TEST RESULTS                             ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

let totalPass = 0;
let totalFail = 0;
let totalSkip = 0;

const mdLines: string[] = [
  '# CLI Test Results',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '| Test ID | Themes | Features | Deploy | Scaffold | Install | Build | Errors |',
  '|---------|--------|----------|--------|----------|---------|-------|--------|',
];

for (const test of matrix) {
  const scaffold = readStatus(test.id, 'scaffold');
  const install = readStatus(test.id, 'install');
  const build = readStatus(test.id, 'build');

  const overall = build === 'PASS' ? 'PASS' : (scaffold === 'FAIL' || install === 'FAIL' || build === 'FAIL') ? 'FAIL' : 'SKIP';
  if (overall === 'PASS') totalPass++;
  else if (overall === 'FAIL') totalFail++;
  else totalSkip++;

  // Find error snippet for failed stage
  let errorSnippet = '';
  for (const stage of stages) {
    if (readStatus(test.id, stage) === 'FAIL') {
      errorSnippet = readErrorSnippet(test.id, stage);
      break;
    }
  }

  const themes = test.themes.join(',');
  const features = test.features.length ? test.features.join(',') : 'none';
  const line = `  ${icon(overall)} ${test.id.padEnd(22)} ${icon(scaffold)} ${icon(install)} ${icon(build)}  ${themes} | ${features} | ${test.deployTarget}`;
  console.log(line);

  mdLines.push(
    `| ${test.id} | ${themes} | ${features} | ${test.deployTarget} | ${icon(scaffold)} | ${icon(install)} | ${icon(build)} | ${errorSnippet ? errorSnippet.substring(0, 60) : '—' } |`
  );
}

console.log('');
console.log(`  Total: ${matrix.length}  Pass: ${totalPass}  Fail: ${totalFail}  Skip: ${totalSkip}`);
console.log('');

// Write markdown summary
mdLines.push('', `**Total: ${matrix.length} | Pass: ${totalPass} | Fail: ${totalFail} | Skip: ${totalSkip}**`);
const summaryPath = join(RESULTS_DIR, 'summary.md');
writeFileSync(summaryPath, mdLines.join('\n') + '\n');
console.log(`  Summary written to: test/results/summary.md`);

// Exit with failure if any test failed
if (totalFail > 0) {
  process.exit(1);
}

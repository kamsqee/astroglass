/**
 * Visual Diff — pixelmatch-based screenshot comparison
 *
 * Compares current screenshots against baseline screenshots
 * and produces diff images + a JSON report for PR comments.
 *
 * Usage:
 *   node ci/compare-screenshots.js \
 *     --current  /path/to/current-screenshots/ \
 *     --baseline /path/to/baseline-screenshots/ \
 *     --output   /path/to/diff-output/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, cpSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseArgs } from 'node:util';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// ─── CLI args ────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    current:  { type: 'string' },
    baseline: { type: 'string' },
    output:   { type: 'string' },
    threshold: { type: 'string', default: '0.1' },
  },
});

if (!args.current || !args.baseline || !args.output) {
  console.error('Usage: --current <path> --baseline <path> --output <path> [--threshold <0-1>]');
  process.exit(1);
}

const CURRENT_DIR  = args.current;
const BASELINE_DIR = args.baseline;
const OUTPUT_DIR   = args.output;
const THRESHOLD    = parseFloat(args.threshold);

mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Collect PNG files recursively ───────────────────────────

function collectPNGs(dir, prefix = '') {
  const files = [];
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...collectPNGs(fullPath, relPath));
    } else if (entry.name.endsWith('.png')) {
      files.push({ path: fullPath, rel: relPath });
    }
  }
  return files;
}

// ─── Compare two PNG files ──────────────────────────────────

function comparePNGs(currentPath, baselinePath, diffPath) {
  const currentBuf  = PNG.sync.read(readFileSync(currentPath));
  const baselineBuf = PNG.sync.read(readFileSync(baselinePath));

  // If dimensions differ, mark as changed
  if (currentBuf.width !== baselineBuf.width || currentBuf.height !== baselineBuf.height) {
    // Copy current as diff for visual reference
    cpSync(currentPath, diffPath);
    const totalPixels = Math.max(
      currentBuf.width * currentBuf.height,
      baselineBuf.width * baselineBuf.height
    );
    return { diffPixels: totalPixels, totalPixels, sizeChanged: true };
  }

  const { width, height } = currentBuf;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    currentBuf.data,
    baselineBuf.data,
    diff.data,
    width,
    height,
    { threshold: THRESHOLD, includeAA: false }
  );

  // Write diff image if there are differences
  if (diffPixels > 0) {
    writeFileSync(diffPath, PNG.sync.write(diff));
  }

  return { diffPixels, totalPixels: width * height, sizeChanged: false };
}

// ─── Main ───────────────────────────────────────────────────

const currentFiles  = collectPNGs(CURRENT_DIR);
const baselineFiles = collectPNGs(BASELINE_DIR);

// Build baseline lookup
const baselineMap = new Map();
for (const f of baselineFiles) {
  baselineMap.set(f.rel, f.path);
}

const results = [];
let hasChanges = false;

console.log(`Comparing ${currentFiles.length} current screenshots against ${baselineFiles.length} baselines...\n`);

// Group by config ID (directory name inside screenshots-*)
const configGroups = new Map();
for (const file of currentFiles) {
  // rel path is like: screenshots-single-liquid/index--desktop.png
  const parts = file.rel.split('/');
  const configDir = parts.length > 1 ? parts[0] : 'default';
  const fileName  = parts.length > 1 ? parts.slice(1).join('/') : parts[0];

  if (!configGroups.has(configDir)) {
    configGroups.set(configDir, []);
  }
  configGroups.get(configDir).push({ ...file, configDir, fileName });
}

for (const [configDir, files] of configGroups) {
  const configId = configDir.replace(/^screenshots-/, '');
  let totalDiff = 0;
  let pageCount = 0;
  let newCount = 0;

  const diffDir = join(OUTPUT_DIR, configDir);
  mkdirSync(diffDir, { recursive: true });

  for (const file of files) {
    const baselinePath = baselineMap.get(file.rel);
    pageCount++;

    if (!baselinePath) {
      // New screenshot — no baseline to compare
      newCount++;
      totalDiff = -1; // Signal "new"
      continue;
    }

    const diffPath = join(diffDir, `diff-${file.fileName}`);

    try {
      const result = comparePNGs(file.path, baselinePath, diffPath);
      if (result.diffPixels > 0) {
        totalDiff += result.diffPixels;
        hasChanges = true;
        const pct = ((result.diffPixels / result.totalPixels) * 100).toFixed(2);
        console.log(`  ⚠️  ${file.rel}: ${result.diffPixels} pixels differ (${pct}%)`);
      } else {
        console.log(`  ✅ ${file.rel}: match`);
      }
    } catch (err) {
      console.warn(`  ❌ ${file.rel}: comparison failed — ${err.message}`);
      totalDiff += 1;
    }
  }

  const diffPercent = totalDiff > 0
    ? ((totalDiff / (1440 * 900 * pageCount)) * 100).toFixed(2)
    : '0.00';

  results.push({
    id: configId,
    pages: pageCount,
    diffPixels: newCount === pageCount ? -1 : totalDiff,
    diffPercent: newCount === pageCount ? 'N/A' : diffPercent,
    isNew: newCount === pageCount,
  });
}

// Write report JSON
const report = {
  timestamp: new Date().toISOString(),
  threshold: THRESHOLD,
  totalConfigs: results.length,
  hasChanges,
  results,
};

const reportPath = join(OUTPUT_DIR, 'report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(`\n── Report ──`);
console.log(`Configs compared: ${results.length}`);
console.log(`Visual changes:   ${hasChanges ? 'YES' : 'None'}`);
console.log(`Report saved:     ${reportPath}`);

// Exit non-zero if there are unexpected changes (but not for new baselines)
if (hasChanges) {
  console.log('\n⚠️  Visual differences detected. Review diff images in artifacts.');
  process.exit(1);
}

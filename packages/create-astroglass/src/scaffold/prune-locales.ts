/**
 * Prune Locales — remove unselected locale directories
 */
import { join } from 'node:path';
import { rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const ALL_LOCALES = ['en', 'ru', 'es', 'fr', 'zh', 'ja', 'kk'];

export async function pruneLocales(
  projectPath: string,
  selectedLocales: string[],
  dryRun: boolean
): Promise<{ removed: number }> {
  const unselected = ALL_LOCALES.filter(l => !selectedLocales.includes(l));
  let removed = 0;

  // Remove unselected locale translation directories
  for (const locale of unselected) {
    const localeDir = join(projectPath, `src/locales/${locale}`);

    if (dryRun) {
      console.log(`  [dry-run] Would remove: src/locales/${locale}/`);
      removed++;
      continue;
    }

    try {
      if (existsSync(localeDir)) {
        await rm(localeDir, { recursive: true });
        removed++;
      }
    } catch {
      // Directory doesn't exist
    }

    // Also remove locale-specific content directories
    const contentDirs = [
      `src/content/blog/${locale}`,
      `src/content/docs/${locale}`,
    ];

    for (const dir of contentDirs) {
      const fullPath = join(projectPath, dir);
      if (dryRun) {
        console.log(`  [dry-run] Would remove: ${dir}`);
        continue;
      }
      try {
        if (existsSync(fullPath)) {
          await rm(fullPath, { recursive: true });
          removed++;
        }
      } catch {
        // Directory doesn't exist
      }
    }
  }

  // Patch locales.ts to only enable selected locales
  const localesFile = join(projectPath, 'src/config/locales.ts');
  if (!dryRun && existsSync(localesFile)) {
    let content = await readFile(localesFile, 'utf-8');

    // Disable unselected locales by setting enabled: false
    for (const locale of unselected) {
      // Match patterns like: { code: 'ru', ..., enabled: true }
      const pattern = new RegExp(
        `(code:\\s*['"]${locale}['"][^}]*enabled:\\s*)true`,
        'g'
      );
      content = content.replace(pattern, '$1false');
    }

    await writeFile(localesFile, content, 'utf-8');
  }

  return { removed };
}

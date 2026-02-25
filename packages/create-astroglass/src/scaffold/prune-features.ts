/**
 * Prune Features — remove blog, docs, dashboard files per module manifests
 */
import { join, dirname } from 'node:path';
import { rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ModuleManifest {
  name: string;
  files: string[];
  localeFiles?: string[];
  packages: string[];
}

const ALL_FEATURES = ['blog', 'docs', 'dashboard'];

export async function pruneFeatures(
  projectPath: string,
  selectedFeatures: string[],
  dryRun: boolean
): Promise<{ removed: number }> {
  const unselected = ALL_FEATURES.filter(f => !selectedFeatures.includes(f));
  let removed = 0;

  for (const feature of unselected) {
    // Load module manifest
    const manifestPath = join(__dirname, '../../modules', `${feature}.json`);

    if (!existsSync(manifestPath)) continue;

    const manifest: ModuleManifest = JSON.parse(
      await readFile(manifestPath, 'utf-8')
    );

    // Remove listed files
    for (const file of manifest.files) {
      const fullPath = join(projectPath, file);

      if (dryRun) {
        console.log(`  [dry-run] Would remove: ${file}`);
        removed++;
        continue;
      }

      try {
        if (existsSync(fullPath)) {
          await rm(fullPath, { recursive: true, force: true });
          removed++;
        }
      } catch {
        // File doesn't exist
      }
    }

    // Handle glob patterns for locale files
    if (manifest.localeFiles) {
      for (const pattern of manifest.localeFiles) {
        const matches = await fg(pattern, { cwd: projectPath });
        for (const match of matches) {
          const fullPath = join(projectPath, match);

          if (dryRun) {
            console.log(`  [dry-run] Would remove: ${match}`);
            removed++;
            continue;
          }

          try {
            await rm(fullPath, { force: true });
            removed++;
          } catch {
            // File doesn't exist
          }
        }
      }
    }
  }

  return { removed };
}

/**
 * Prune Deploy — remove deploy-target-specific files that don't match
 * the selected deploy target.
 */
import { join } from 'node:path';
import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

/** Files to remove when the deploy target is NOT the specified key */
const DEPLOY_FILES: Record<string, string[]> = {
  cloudflare: [
    'wrangler.jsonc',
  ],
};

export async function pruneDeploy(
  projectPath: string,
  selectedTarget: string,
  dryRun: boolean
): Promise<{ removed: number }> {
  let removed = 0;

  for (const [target, files] of Object.entries(DEPLOY_FILES)) {
    // Skip if this IS the selected target
    if (target === selectedTarget) continue;

    for (const file of files) {
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
        // File already removed or doesn't exist
      }
    }
  }

  return { removed };
}

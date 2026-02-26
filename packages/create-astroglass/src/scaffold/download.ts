/**
 * Download — fetch the Astroglass template from GitHub via giget
 *
 * For CI / local testing, set ASTROGLASS_TEMPLATE_DIR to a local checkout
 * of the repo and the template will be copied from there instead of
 * downloading from GitHub. This ensures tests always build against
 * the current commit rather than a potentially stale remote cache.
 */
import { downloadTemplate as gigetDownload } from 'giget';
import { resolve } from 'node:path';
import { cp, mkdir } from 'node:fs/promises';

export async function downloadTemplate(
  projectDir: string,
  dryRun: boolean
): Promise<string> {
  const targetPath = resolve(process.cwd(), projectDir);
  const localTemplate = process.env.ASTROGLASS_TEMPLATE_DIR;

  if (dryRun) {
    console.log(`  [dry-run] Would download template to: ${targetPath}`);
    return targetPath;
  }

  if (localTemplate) {
    // Local mode — copy from the checkout directory (CI / tests)
    const srcPath = resolve(localTemplate);
    await mkdir(targetPath, { recursive: true });
    await cp(srcPath, targetPath, {
      recursive: true,
      filter: (src) => {
        // Skip directories that shouldn't be copied into scaffolded projects
        const rel = src.slice(srcPath.length);
        if (rel.startsWith('/node_modules')) return false;
        if (rel.startsWith('/.git')) return false;
        if (rel.startsWith('/dist')) return false;
        if (rel.startsWith('/packages')) return false;
        if (rel.startsWith('/cli-tests')) return false;
        if (rel.startsWith('/cli-test-report')) return false;
        if (rel.startsWith('/ci')) return false;
        if (rel.startsWith('/.claude')) return false;
        return true;
      },
    });
    return targetPath;
  }

  const { dir } = await gigetDownload('github:kamsqee/astroglass', {
    dir: targetPath,
    force: false,
    forceClean: false,
  });

  return dir;
}

/**
 * Download — fetch the Astroglass template from GitHub via giget
 *
 * For CI / local testing, set ASTROGLASS_TEMPLATE_DIR to a local checkout
 * of the repo and the template will be copied from there instead of
 * downloading from GitHub. This ensures tests always build against
 * the current commit rather than a potentially stale remote cache.
 */
import { downloadTemplate as gigetDownload } from 'giget';
import { resolve, join } from 'node:path';
import { cp, mkdir, rename, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

/** Paths to exclude when copying a local checkout as a template. */
const EXCLUDE_PREFIXES = [
  '/node_modules',
  '/.git',
  '/dist',
  '/packages',
  '/cli-tests',
  '/cli-test-report',
  '/ci',
  '/.claude',
  '/current problems and audits',
  '/RFC-',
];

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
    // Local mode — copy from the checkout directory (CI / tests).
    // We copy to a temp directory first, then rename into place, because
    // the target may be a subdirectory of the source (e.g. test workspace
    // inside the repo root) and Node's cp() rejects that with EINVAL.
    const srcPath = resolve(localTemplate);
    const tmpDir = await mkdtemp(join(tmpdir(), 'astroglass-'));

    try {
      await cp(srcPath, tmpDir, {
        recursive: true,
        filter: (src) => {
          const rel = src.slice(srcPath.length);
          return !EXCLUDE_PREFIXES.some((p) => rel.startsWith(p));
        },
      });

      await mkdir(resolve(targetPath, '..'), { recursive: true });
      await rename(tmpDir, targetPath);
    } catch (err) {
      // Clean up temp dir on failure
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
      throw err;
    }

    return targetPath;
  }

  const { dir } = await gigetDownload('github:kamsqee/astroglass', {
    dir: targetPath,
    force: false,
    forceClean: false,
  });

  return dir;
}

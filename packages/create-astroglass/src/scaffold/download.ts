/**
 * Download — fetch the Astroglass template from GitHub via giget
 */
import { downloadTemplate as gigetDownload } from 'giget';
import { resolve } from 'node:path';

export async function downloadTemplate(
  projectDir: string,
  dryRun: boolean
): Promise<string> {
  const targetPath = resolve(process.cwd(), projectDir);

  if (dryRun) {
    console.log(`  [dry-run] Would download template to: ${targetPath}`);
    return targetPath;
  }

  const { dir } = await gigetDownload('github:kamsqee/astroglass', {
    dir: targetPath,
    force: false,
    forceClean: false,
  });

  return dir;
}

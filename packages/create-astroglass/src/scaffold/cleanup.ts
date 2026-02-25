/**
 * Cleanup — remove empty directories, temp files, CLI-only files
 */
import { join } from 'node:path';
import { rm, readdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import fg from 'fast-glob';

export async function cleanup(
  projectPath: string,
  dryRun: boolean
): Promise<void> {
  // 1. Remove .DS_Store files
  const dsStoreFiles = await fg('**/.DS_Store', {
    cwd: projectPath,
    dot: true,
  });

  for (const file of dsStoreFiles) {
    const fullPath = join(projectPath, file);
    if (dryRun) {
      console.log(`  [dry-run] Would remove: ${file}`);
    } else {
      await rm(fullPath, { force: true });
    }
  }

  // 2. Remove the CLI templates/modules from the scaffolded project
  // (they came from the downloaded repo but aren't needed in the user's project)
  const cliDirs = [
    'packages/create-astroglass',
  ];

  for (const dir of cliDirs) {
    const fullPath = join(projectPath, dir);
    if (existsSync(fullPath)) {
      if (dryRun) {
        console.log(`  [dry-run] Would remove: ${dir}`);
      } else {
        await rm(fullPath, { recursive: true, force: true });
      }
    }
  }

  // 3. Remove themeRegistry.ts (CLI-only, not needed at runtime)
  const registryFile = join(projectPath, 'src/config/themeRegistry.ts');
  if (existsSync(registryFile)) {
    if (dryRun) {
      console.log(`  [dry-run] Would remove: src/config/themeRegistry.ts`);
    } else {
      await rm(registryFile, { force: true });
    }
  }

  // 4. Clean empty directories recursively
  await removeEmptyDirs(projectPath, dryRun);
}

async function removeEmptyDirs(dir: string, dryRun: boolean): Promise<boolean> {
  if (!existsSync(dir)) return true;

  const stat = statSync(dir);
  if (!stat.isDirectory()) return false;

  let entries = await readdir(dir);

  // Recurse first
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const childStat = statSync(fullPath);
    if (childStat.isDirectory()) {
      await removeEmptyDirs(fullPath, dryRun);
    }
  }

  // Re-check if directory is now empty
  entries = await readdir(dir);
  if (entries.length === 0) {
    if (dryRun) {
      console.log(`  [dry-run] Would remove empty dir: ${dir}`);
    } else {
      await rm(dir, { recursive: true });
    }
    return true;
  }

  return false;
}

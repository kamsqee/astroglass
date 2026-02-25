/**
 * Git Utility — auto-commit, detect uncommitted changes, undo
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Check if the project is a git repository
 */
export function isGitRepo(projectPath: string): boolean {
  return existsSync(join(projectPath, '.git'));
}

/**
 * Check for uncommitted changes
 */
export function hasUncommittedChanges(projectPath: string): boolean {
  try {
    const result = execSync('git status --porcelain', {
      cwd: projectPath,
      encoding: 'utf-8',
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Auto-commit changes with a descriptive message
 */
export function autoCommit(projectPath: string, message: string): boolean {
  try {
    execSync('git add -A', { cwd: projectPath, stdio: 'pipe' });
    execSync(`git commit -m "${message}"`, { cwd: projectPath, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Undo the last commit (soft reset)
 */
export function undoLastCommit(projectPath: string): boolean {
  try {
    execSync('git reset --soft HEAD~1', { cwd: projectPath, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

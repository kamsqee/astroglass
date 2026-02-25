/**
 * ASCII Banner — shown at CLI launch
 */
import pc from 'picocolors';

const BANNER = `
    _        _                   _                
   / \\   ___| |_ _ __ ___   __ _| | __ _ ___ ___ 
  / _ \\ / __| __| '__/ _ \\ / _\` | |/ _\` / __/ __|
 / ___ \\\\__ \\ |_| | | (_) | (_| | | (_| \\__ \\__ \\
/_/   \\_\\___/\\__|_|  \\___/ \\__, |_|\\__,_|___/___/
                           |___/                  
`;

export function showBanner(): void {
  console.log(pc.cyan(BANNER));
  console.log(pc.dim(`  v1.0.0 — Premium Astro Template Scaffolding\n`));
}

/**
 * Deps Utility — dependency resolution and cascade logic
 */

/** Features that require React */
const REACT_DEPENDENTS = ['docs', 'dashboard'];

/**
 * Check if React can be safely removed (no features depend on it)
 */
export function canRemoveReact(currentFeatures: string[]): {
  safe: boolean;
  blockers: string[];
} {
  const blockers = currentFeatures.filter(f => REACT_DEPENDENTS.includes(f));
  return { safe: blockers.length === 0, blockers };
}

/**
 * Get features that would be cascade-removed with a given feature
 */
export function getCascadeRemovals(
  feature: string,
  currentFeatures: string[]
): string[] {
  if (feature === 'react') {
    return currentFeatures.filter(f => REACT_DEPENDENTS.includes(f));
  }
  return [];
}

/**
 * Check if adding a feature requires additional dependencies
 */
export function getRequiredDeps(feature: string): string[] {
  switch (feature) {
    case 'docs':
      return ['react', 'fuse.js', 'astro-expressive-code', '@astrojs/mdx'];
    case 'blog':
      return ['@astrojs/mdx'];
    case 'dashboard':
      return ['react', 'recharts'];
    case 'react':
      return ['@astrojs/react', 'react', 'react-dom'];
    default:
      return [];
  }
}

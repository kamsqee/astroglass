/**
 * Search Index Generator for Fuse.js
 * Generates separate search indexes for each locale from MDX content.
 * Run with: node scripts/generate-search-index.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const contentDir = path.join(rootDir, 'src', 'content', 'docs');
const outputDir = path.join(rootDir, 'public', 'search');

// Section metadata for grouping
const SECTIONS = {
  'getting-started': { title: 'Getting Started', icon: '⚡', order: 1 },
  '01-getting-started': { title: 'Getting Started', icon: '⚡', order: 1 },
  'components': { title: 'Components', icon: '🧩', order: 2 },
  '02-components': { title: 'Components', icon: '🧩', order: 2 },
  'core-concepts': { title: 'Core Concepts', icon: '📚', order: 3 },
  '03-core-concepts': { title: 'Core Concepts', icon: '📚', order: 3 },
  'themes': { title: 'Themes', icon: '🎨', order: 4 },
  '03-themes': { title: 'Themes', icon: '🎨', order: 4 },
  'deployment': { title: 'Deployment', icon: '🚀', order: 5 },
  '04-deployment': { title: 'Deployment', icon: '🚀', order: 5 },
};

/**
 * Parse frontmatter from MDX content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const frontmatter = {};
  match[1].split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  });
  
  return frontmatter;
}

/**
 * Extract headings from MDX content
 */
function extractHeadings(content) {
  const headings = [];
  const regex = /^##\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push(match[1].trim());
  }
  return headings;
}

/**
 * Strip MDX/Markdown syntax for plain text content
 */
function stripMarkdown(content) {
  return content
    // Remove frontmatter
    .replace(/^---[\s\S]*?---/, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove import/export statements
    .replace(/^(import|export)\s+.*$/gm, '')
    // Remove headers markup but keep text
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get section info from file path
 */
function getSectionInfo(filePath) {
  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (SECTIONS[part]) {
      return SECTIONS[part];
    }
  }
  return { title: 'Documentation', icon: '📄', order: 99 };
}

/**
 * Generate URL from file path
 */
function generateUrl(locale, filePath, baseContentDir) {
  const relativePath = path.relative(baseContentDir, filePath);
  // Remove .mdx extension and convert to URL
  let urlPath = relativePath
    .replace(/\.mdx$/, '')
    .replace(/\\/g, '/');
  
  // Handle index files
  if (urlPath.endsWith('/index')) {
    urlPath = urlPath.replace(/\/index$/, '');
  }
  
  // Build full URL
  if (locale === 'en') {
    return `/docs/${urlPath}`;
  }
  return `/${locale}/docs/${urlPath}`;
}

/**
 * Recursively get all MDX files in a directory
 */
function getMdxFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Generate search index for a specific locale
 */
function generateLocaleIndex(locale) {
  const localeDir = path.join(contentDir, locale);
  const files = getMdxFiles(localeDir);
  const index = [];
  
  console.log(`  Found ${files.length} MDX files for ${locale}`);
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      const headings = extractHeadings(content);
      const plainContent = stripMarkdown(content);
      const section = getSectionInfo(filePath);
      const url = generateUrl(locale, filePath, localeDir);
      
      index.push({
        url,
        locale,
        title: frontmatter.title || path.basename(filePath, '.mdx'),
        description: frontmatter.description || '',
        section: section.title,
        sectionIcon: section.icon,
        sectionOrder: section.order,
        headings,
        content: plainContent.slice(0, 2000), // Limit content size
        order: parseInt(frontmatter.order) || 99
      });
    } catch (error) {
      console.error(`  Error processing ${filePath}:`, error.message);
    }
  }
  
  // Sort by section order, then by document order
  index.sort((a, b) => {
    if (a.sectionOrder !== b.sectionOrder) {
      return a.sectionOrder - b.sectionOrder;
    }
    return a.order - b.order;
  });
  
  return index;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Generating Fuse.js search indexes...\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get available locales
  const locales = fs.readdirSync(contentDir).filter(entry => {
    const fullPath = path.join(contentDir, entry);
    return fs.statSync(fullPath).isDirectory();
  });
  
  console.log(`📁 Found locales: ${locales.join(', ')}\n`);
  
  // Generate index for each locale
  for (const locale of locales) {
    console.log(`📝 Processing ${locale}...`);
    const index = generateLocaleIndex(locale);
    
    const outputPath = path.join(outputDir, `${locale}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
    
    console.log(`  ✅ Generated ${outputPath} (${index.length} entries)\n`);
  }
  
  console.log('✨ Search index generation complete!');
}

main();

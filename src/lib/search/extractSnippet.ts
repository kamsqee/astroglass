/**
 * extractSnippet.ts
 * Extracts a snippet of text around the matched search terms with highlighting.
 */

export function extractSnippet(content: string, query: string, maxLength: number = 80): string {
  if (!content) return '';
  
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  
  // Find first matching word position
  let matchPos = -1;
  for (const word of words) {
    const pos = lowerContent.indexOf(word);
    if (pos !== -1) {
      matchPos = pos;
      break;
    }
  }
  
  if (matchPos === -1) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
  }
  
  // Extract snippet around match with some buffer
  // We want the match to be roughly in the middle if possible
  const buffer = 30;
  const start = Math.max(0, matchPos - buffer);
  const end = Math.min(content.length, matchPos + maxLength - buffer);
  
  let snippet = content.slice(start, end);
  
  // Add ellipses
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  // Highlight matching words with <mark> tags
  // We used to do this with regex replace, but preserving case is nicer if we just wrap the known matches
  // However, simpler approach for now to match exactly what we had:
  words.forEach(word => {
    if (word.length < 2) return;
    // Escape special regex chars
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedWord})`, 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');
  });
  
  return snippet;
}

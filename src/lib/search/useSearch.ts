import { useState, useRef, useCallback } from 'react';
import Fuse, { type FuseResult } from 'fuse.js';

export interface SearchResult {
  url: string;
  locale: string;
  title: string;
  description: string;
  section: string;
  sectionIcon: string;
  sectionOrder: number;
  content: string;
  headings: string[];
}

export interface UseSearchOptions {
  locale: string;
}

export function useSearch({ locale }: UseSearchOptions) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [results, setResults] = useState<FuseResult<SearchResult>[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const fuseRef = useRef<Fuse<SearchResult> | null>(null);
  const indexRef = useRef<SearchResult[] | null>(null);

  // Initialize Fuse and fetch index
  const initSearch = useCallback(async () => {
    if (fuseRef.current) return;
    
    setStatus('loading');
    try {
      const response = await fetch(`/search/${locale}.json`);
      if (!response.ok) throw new Error(`Failed to load search index for ${locale}`);
      
      const data: SearchResult[] = await response.json();
      indexRef.current = data;
      
      fuseRef.current = new Fuse(data, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'headings', weight: 0.25 },
          { name: 'description', weight: 0.15 },
          { name: 'content', weight: 0.1 }
        ],
        threshold: 0.4,
        distance: 1000,
        ignoreLocation: true,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2
      });
      
      setStatus('ready');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [locale]);

  // Perform search
  const search = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    if (!fuseRef.current) {
      // If triggered before init, try init (but usually we init on open)
      initSearch().then(() => {
        if (fuseRef.current) search(query); // Retry
      });
      return;
    }

    const searchResults = fuseRef.current.search(query, { limit: 10 });
    setResults(searchResults);
    
    // "Did You Mean?" Logic
    // If no results, try a looser search to find suggestions
    if (searchResults.length === 0 && indexRef.current) {
      const looseFuse = new Fuse(indexRef.current, {
        keys: ['title'],
        threshold: 0.6,
        distance: 200,
        includeScore: true
      });
      
      const looseResults = looseFuse.search(query);
      const newSuggestions = looseResults
        .filter(r => (r.score || 1) > 0.3) // Filter out very poor matches
        .slice(0, 3)
        .map(r => r.item.title);
        
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [initSearch]);

  return {
    status,
    results,
    suggestions,
    initSearch,
    search
  };
}

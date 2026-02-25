import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useSearch, type SearchResult } from '../../../lib/search/useSearch';
import { useRecentSearches } from '../../../lib/search/useRecentSearches';
import { extractSnippet } from '../../../lib/search/extractSnippet';

declare global {
  interface Window {
    __SEARCH_OPEN__?: boolean;
  }
}

interface SearchLabels {
  placeholder: string;
  noResults: string;
  recentSearches: string;
  quickLinks: string;
  gettingStarted: string;
  components: string;
  themes: string;
  clear: string;
  didYouMean: string;
  loading: string;
  footerSearch: string;
  footerNavigate: string;
  footerSelect: string;
  remove: string;
  esc: string;
}

// ... imports

interface Props {
  locale: string;
  labels: SearchLabels;
  sectionLabels?: Record<string, string>;
}

export default function SearchDialog({ locale, labels, sectionLabels = {} }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { status, results, suggestions, search, initSearch } = useSearch({ locale });
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

  // Helper to get localized section label
  const getSectionLabel = (original: string) => {
    // Try exact match
    if (sectionLabels[original]) return sectionLabels[original];
    
    // Try lowercased dashed (e.g. index returns "components-ui")
    const key = original.toLowerCase().replace(/\s+/g, '-');
    if (sectionLabels[key]) return sectionLabels[key];
    
    // Fallback: Check if we can reverse-map "Marketing Sections" -> "components-sections" -> "Ru Label"
    // (This is brittle, simplifying: Assume index returns recognizable keys OR English titles that match keys)
    
    // If original is "Marketing Sections" (English title), and we are in RU, 
    // we might have a key "components-sections".
    // For now, return original if no match.
    return original;
  };

  // Listen for Open Events
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName) || ''))) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('open-search', onOpen);
    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('open-search', onOpen);
      window.removeEventListener('keydown', onKeydown);
    };

  }, [open]);

  // Check global state on mount (in case clicked before hydration)
  useEffect(() => {
    if (window.__SEARCH_OPEN__) {
      setOpen(true);
    }
  }, []);

  // Sync state to global window object
  useEffect(() => {
    if (open) {
      window.__SEARCH_OPEN__ = true;
    } else {
      window.__SEARCH_OPEN__ = false;
    }
  }, [open]);

  // Lock body scroll and init search
  useEffect(() => {
    if (open) {
      initSearch();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open, initSearch]);

  const handleSelect = useCallback((item: SearchResult) => {
    addRecentSearch(query);
    setOpen(false);
    
    // Add q param
    const url = new URL(item.url, window.location.origin);
    url.searchParams.set('q', query);
    
    window.location.href = url.toString();
  }, [query, addRecentSearch]);

  const handleRecentSelect = (q: string) => {
    setQuery(q);
    search(q);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[15vh] sm:pt-[12%] bg-[hsl(var(--b1)/0.8)] backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={() => setOpen(false)} // Explicit click outside handler
    >
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(var(--bc)/0.08)] bg-[hsl(var(--b1)/0.95)] shadow-2xl ring-1 ring-[hsl(var(--a)/0.1)] animate-in fade-in zoom-in-95 duration-200 search-dialog-root backdrop-blur-xl"
        style={{
          boxShadow: '0 0 0 1px hsl(var(--a)/0.05), 0 20px 50px -12px hsl(var(--shadow-color)/0.5)'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent close on content click
      >
        <Command shouldFilter={false} label="Global Search">
          {/* Search Header - Polished Border & Focus State */}
          <div className="search-input-wrapper flex items-center border-b border-[hsl(var(--bc)/0.06)] px-4 py-4 bg-[hsl(var(--bc)/0.02)] transition-colors relative">
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--a)/0.5)] to-transparent opacity-0 transition-opacity duration-300 has-[:focus]:opacity-100"></div>
            <svg className="mr-3 h-5 w-5 text-[hsl(var(--a))] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Command.Input
              value={query}
              onValueChange={(q: string) => {
                setQuery(q);
                search(q);
              }}
              placeholder={labels.placeholder}
              className="flex-1 bg-transparent text-[16px] font-medium text-[hsl(var(--bc))] placeholder-[hsl(var(--bc)/0.4)] outline-none border-none shadow-none selection:bg-[hsl(var(--a)/0.2)] selection:text-[hsl(var(--bc))] caret-[hsl(var(--a))]"
              autoFocus
            />
            <button 
              onClick={() => setOpen(false)}
              className="ml-2 hidden sm:inline-block rounded-lg border border-[hsl(var(--bc)/0.1)] bg-[hsl(var(--bc)/0.05)] px-2 py-1 text-[10px] font-bold text-[hsl(var(--bc)/0.5)] shadow-sm hover:bg-[hsl(var(--bc)/0.1)] hover:text-[hsl(var(--bc))] transition-colors"
            >
              {labels.esc}
            </button>
          </div>

          {/* Results List */}
          <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-3 scroll-py-3 bg-transparent">
            {status === 'loading' && (
               <div className="py-12 text-center text-sm text-[hsl(var(--bc)/0.4)] animate-pulse">{labels.loading}</div>
            )}

            {status === 'ready' && !query && (
              <>
                {recentSearches.length > 0 && (
                  <Command.Group heading={labels.recentSearches} className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--bc)/0.4)]">
                    <div className="mb-2 flex justify-end pr-2">
                       <button onClick={clearRecentSearches} className="text-[hsl(var(--bc)/0.4)] hover:text-red-400 transition-colors">{labels.clear}</button>
                    </div>
                    {recentSearches.map((q) => (
                      <div key={q} className="group relative flex items-center">
                        <Command.Item
                          onSelect={() => handleRecentSelect(q)}
                          className="flex-1 flex cursor-default select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium normal-case text-[hsl(var(--bc)/0.7)] aria-selected:bg-[hsl(var(--bc)/0.05)] aria-selected:text-[hsl(var(--bc))]"
                        >
                          <span className="opacity-40">🕒</span>
                          {q}
                        </Command.Item>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(q);
                          }}
                          className="absolute right-2 p-1.5 text-[hsl(var(--bc)/0.3)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-[hsl(var(--bc)/0.05)]"
                          title={labels.remove}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </Command.Group>
                )}
                
                <div className="mt-2 px-2 pb-4">
                   <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--bc)/0.4)]">{labels.quickLinks}</h3>
                   <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <QuickLink href={`/${locale === 'en' ? 'docs' : locale + '/docs'}/getting-started`} icon="⚡" label={labels.gettingStarted} />
                      <QuickLink href={`/${locale === 'en' ? 'docs' : locale + '/docs'}`} icon="🧩" label={labels.components} />
                      <QuickLink href={`/${locale === 'en' ? 'docs' : locale + '/docs'}/themes`} icon="🎨" label={labels.themes} />
                   </div>
                </div>
              </>
            )}

            <Command.Empty className="py-16 text-center">
              <div className="mb-4 text-5xl opacity-20 grayscale filter">🔍</div>
              <p className="text-sm font-medium text-[hsl(var(--bc)/0.6)]">{labels.noResults}</p>
              {suggestions.length > 0 && (
                 <div className="mt-6 flex flex-col items-center gap-3">
                   <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--bc)/0.4)]">{labels.didYouMean}</span>
                   <div className="flex gap-2">
                     {suggestions.map(s => (
                       <button 
                         key={s}
                         onClick={() => handleRecentSelect(s)}
                         className="rounded-full border border-[hsl(var(--bc)/0.1)] bg-[hsl(var(--bc)/0.03)] px-3 py-1.5 text-xs font-medium text-[hsl(var(--a))] hover:bg-[hsl(var(--a)/0.1)] hover:border-[hsl(var(--a)/0.2)] transition-colors"
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                 </div>
              )}
            </Command.Empty>

            {results.map(({ item }) => (
              <Command.Item
                key={item.url}
                value={item.title + ' ' + item.description} 
                onSelect={() => handleSelect(item)}
                className="group relative flex cursor-default select-none items-start gap-4 rounded-xl p-3.5 text-sm text-[hsl(var(--bc)/0.7)] transition-all border border-transparent aria-selected:bg-[hsl(var(--a)/0.08)] aria-selected:text-[hsl(var(--bc))] aria-selected:border-[hsl(var(--a)/0.15)] my-1"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--bc)/0.04)] text-lg transition-colors group-aria-selected:bg-[hsl(var(--a)/0.2)] group-aria-selected:text-[hsl(var(--a))] group-aria-selected:shadow-lg group-aria-selected:shadow-[hsl(var(--a)/0.2)]">
                  {item.sectionIcon}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[hsl(var(--bc))] group-aria-selected:text-[hsl(var(--a))] transition-colors">{item.title}</span>
                    <span className="rounded-md bg-[hsl(var(--bc)/0.04)] px-1.5 py-0.5 text-[10px] font-bold text-[hsl(var(--bc)/0.4)] border border-[hsl(var(--bc)/0.05)] group-aria-selected:border-[hsl(var(--a)/0.3)] group-aria-selected:text-[hsl(var(--a)/0.8)] group-aria-selected:bg-[hsl(var(--a)/0.1)] transition-colors">
                      {getSectionLabel(item.section)}
                    </span>
                  </div>
                  <p 
                    className="line-clamp-2 text-xs leading-relaxed text-[hsl(var(--bc)/0.6)] group-aria-selected:text-[hsl(var(--bc)/0.8)] transition-colors"
                    dangerouslySetInnerHTML={{ __html: extractSnippet(item.content || item.description, query) }} 
                  />
                </div>
                <svg className="h-5 w-5 self-center text-[hsl(var(--a))] opacity-0 transition-all -translate-x-2 group-aria-selected:opacity-100 group-aria-selected:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Command.Item>
            ))}
          </Command.List>
          
          {/* Footer */}
          <div className="flex h-10 items-center justify-between border-t border-[hsl(var(--bc)/0.06)] bg-[hsl(var(--bc)/0.02)] px-4 text-[10px] font-medium text-[hsl(var(--bc)/0.4)]">
             <span>{results.length > 0 ? `${results.length} results` : labels.footerSearch}</span>
             <div className="flex gap-4">
               <span className="flex items-center gap-1.5"><kbd className="rounded-md border border-[hsl(var(--bc)/0.1)] bg-[hsl(var(--bc)/0.05)] px-1.5 py-0.5 font-sans">↑↓</kbd> {labels.footerNavigate}</span>
               <span className="flex items-center gap-1.5"><kbd className="rounded-md border border-[hsl(var(--bc)/0.1)] bg-[hsl(var(--bc)/0.05)] px-1.5 py-0.5 font-sans">↵</kbd> {labels.footerSelect}</span>
             </div>
          </div>
        </Command>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string, icon: string, label: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-2 rounded-2xl border border-[hsl(var(--bc)/0.08)] bg-[hsl(var(--bc)/0.02)] p-4 text-center hover:border-[hsl(var(--a)/0.3)] hover:bg-[hsl(var(--a)/0.05)] hover:text-[hsl(var(--a))] transition-all group">
       <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
       <span className="text-xs font-semibold text-[hsl(var(--bc)/0.7)] group-hover:text-[hsl(var(--a))]">{label}</span>
    </a>
  );
}

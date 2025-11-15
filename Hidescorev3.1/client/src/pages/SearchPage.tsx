import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "@/components/ui/ContentCard";
import type { Movie, Series } from "@shared/schema";

function parseQuery(q: string) {
  // Support quoted phrases and tokens like:
  // platform:Netflix genre:Drama year:2020 title:"dark knight" actor:batman type:movie
  // Values can include | to mean OR, e.g. genre:Drama|Comedy
  const rawTokens: string[] = [];
  const re = /"([^"]+)"|'([^']+)'|([^\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(q)) !== null) {
    rawTokens.push(m[1] || m[2] || m[3]);
  }

  const filters: any = { terms: [] };
  for (const tRaw of rawTokens) {
    const t = tRaw.trim();
    if (!t) continue;
    const idx = t.indexOf(":");
    if (idx > 0) {
      const key = t.slice(0, idx).toLowerCase();
      const val = t.slice(idx + 1);
      // allow OR values separated by |
      const parts = val.split("|").map((s) => s.trim()).filter(Boolean);
      if (!filters[key]) filters[key] = [];
      filters[key].push(...parts);
    } else {
      filters.terms.push(t);
    }
  }
  return filters;
}

export default function SearchPage() {
  const [location] = useLocation();
  
  // Parse query parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q') || '';
  
  // Also try parsing from location (fallback)
  const locationParams = new URLSearchParams(location.split('?')[1] || '');
  const qFromLocation = locationParams.get('q') || '';
  
  // Use whichever has a value
  const searchQuery = q || qFromLocation;
  
  console.log('SearchPage - location:', location);
  console.log('SearchPage - window.location.search:', window.location.search);
  console.log('SearchPage - searchQuery:', searchQuery);

  const { data: movies, isLoading: mLoading } = useQuery<Movie[]>({ queryKey: ['/api/movies'] });
  const { data: series, isLoading: sLoading } = useQuery<Series[]>({ queryKey: ['/api/series'] });

  const isLoading = mLoading || sLoading;
  
  console.log('SearchPage - movies count:', movies?.length || 0);
  console.log('SearchPage - series count:', series?.length || 0);

  const filtered = useMemo(() => {
    const all: (Movie | Series)[] = [...(movies || []), ...(series || [])];
    console.log('Filtered - all items:', all.length, 'searchQuery:', searchQuery);
    
    if (!all.length || !searchQuery.trim()) {
      console.log('Filtered - returning empty: all.length=', all.length, 'searchQuery.trim()=', searchQuery.trim());
      return [];
    }
    
    const filters = parseQuery(searchQuery);
    console.log('Filtered - parsed filters:', filters);

    // scoring: prefer exact title matches, then startsWith, then includes
    const scored = all
      .map((item) => {
        let score = 0;
        const title = (item.title || '').toLowerCase().trim();
        const description = (item.description || '').toLowerCase();
        const director = ((item as any).director || (item as any).creator || '').toLowerCase();
        const cast = ((item.cast || []) as string[]).join(' ').toLowerCase();
        const genres = (item.genre || []).map(g => g.toLowerCase());
        const platforms = (item.platform || []).map(p => p.toLowerCase());

        // explicit filters - if any fail, exclude with score -Infinity
        if (filters.platform && filters.platform.length > 0) {
          const matches = filters.platform.some((p: string) => 
            platforms.some(pp => pp === p.toLowerCase() || pp.includes(p.toLowerCase()) || p.toLowerCase().includes(pp))
          );
          if (!matches) return { item, score: -Infinity };
          // boost score if platform matches exactly
          score += 15;
        }
        if (filters.genre && filters.genre.length > 0) {
          const matches = filters.genre.some((g: string) => 
            genres.some(gg => gg === g.toLowerCase() || gg.includes(g.toLowerCase()) || g.toLowerCase().includes(gg))
          );
          if (!matches) return { item, score: -Infinity };
          // boost score if genre matches
          score += 10;
        }
        if (filters.year && filters.year.length > 0) {
          const matches = filters.year.some((y: string) => {
            const year = parseInt(y, 10);
            if (isNaN(year)) return false;
            return item.releaseYear === year || 
                   (item.releaseYear >= year - 1 && item.releaseYear <= year + 1); // allow ±1 year
          });
          if (!matches) return { item, score: -Infinity };
          score += 5;
        }
        if (filters.type && filters.type.length > 0) {
          const itemType = 'director' in item ? 'movie' : 'series';
          const tmatch = filters.type.some((t: string) => {
            const typeLower = t.toLowerCase();
            return typeLower === itemType || 
                   (typeLower === 'pelicula' && itemType === 'movie') ||
                   (typeLower === 'serie' && itemType === 'series');
          });
          if (!tmatch) return { item, score: -Infinity };
        }
        if (filters.title && filters.title.length > 0) {
          const matches = filters.title.some((s: string) => {
            const searchTerm = s.toLowerCase();
            return title.includes(searchTerm) || 
                   title.split(' ').some(word => word.startsWith(searchTerm));
          });
          if (!matches) return { item, score: -Infinity };
          score += 30; // boost for title filter match
        }
        if (filters.director && filters.director.length > 0) {
          const matches = filters.director.some((s: string) => {
            const searchTerm = s.toLowerCase();
            return director.includes(searchTerm) || 
                   director.split(' ').some(word => word.startsWith(searchTerm));
          });
          if (!matches) return { item, score: -Infinity };
          score += 12;
        }
        if (filters.actor && filters.actor.length > 0) {
          const matches = filters.actor.some((s: string) => {
            const searchTerm = s.toLowerCase();
            return cast.includes(searchTerm) || 
                   cast.split(' ').some(word => word.startsWith(searchTerm));
          });
          if (!matches) return { item, score: -Infinity };
          score += 8;
        }

        // plain terms - improved matching with emphasis on title
        if (filters.terms.length > 0) {
          // Join all terms for phrase matching
          const allTerms = filters.terms.join(' ').toLowerCase().trim();
          const titleLower = title.toLowerCase();
          
          // Exact title match (highest priority) - check if all terms match the title exactly
          if (titleLower === allTerms) {
            score += 200;
          }
          // Title starts with all terms
          else if (titleLower.startsWith(allTerms)) {
            score += 150;
          }
          // Title contains all terms as phrase
          else if (titleLower.includes(allTerms)) {
            score += 120;
          }
          // Title contains all terms (not necessarily together)
          else {
            const allTermsInTitle = filters.terms.every(term => titleLower.includes(term.toLowerCase()));
            if (allTermsInTitle) {
              score += 100;
            }
          }
          
          // Individual term matching for additional scoring
          for (const term of filters.terms) {
            const t = term.toLowerCase().trim();
            if (!t) continue;
            
            // Skip if already matched above
            if (titleLower.includes(t)) {
              // Additional scoring for word boundaries in title
              const titleWords = titleLower.split(/\s+/);
              const wordMatch = titleWords.some(word => {
                // Exact word match
                if (word === t) return true;
                // Word starts with term
                if (word.startsWith(t) && word.length > t.length) return true;
                // Term is a significant part of the word
                if (word.includes(t) && t.length >= 3) return true;
                return false;
              });
              
              if (wordMatch) {
                // Already scored above, but add bonus for word boundary match
                if (!titleLower.startsWith(t) && titleLower !== t) {
                  score += 15;
                }
              }
              continue; // Skip other checks for title matches
            }
            
            // Description contains term (lower priority than title)
            if (description.includes(t)) {
              score += 8;
            }
            
            // Director/Creator contains term
            if (director.includes(t)) {
              score += 12;
            }
            
            // Cast contains term
            const castWords = cast.split(/\s+/);
            if (castWords.some(word => word === t || word.startsWith(t))) {
              score += 6;
            } else if (cast.includes(t)) {
              score += 4;
            }
            
            // Genre/platform partial match (lowest priority)
            if (genres.some(g => g.includes(t) || t.includes(g))) {
              score += 3;
            }
            if (platforms.some(p => p.includes(t) || t.includes(p))) {
              score += 3;
            }
          }
        } else {
          // if no plain terms, give small base score so filters-only queries still return results
          score += 1;
        }

        // boost by rating if available (normalized)
        const rating = (item as any).averageRating || 0;
        if (rating > 0) {
          score += rating * 3; // increased weight for ratings
        }
        
        // boost by rating count (popularity)
        const ratingCount = (item as any).ratingCount || 0;
        if (ratingCount > 0) {
          score += Math.min(ratingCount / 10, 5); // cap at 5 points
        }

        return { item, score };
      })
      .filter((s) => s.score > -Infinity)
      .sort((a, b) => {
        // Primary sort by score
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Secondary sort by rating
        const ratingA = (a.item as any).averageRating || 0;
        const ratingB = (b.item as any).averageRating || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        // Tertiary sort by rating count
        return ((b.item as any).ratingCount || 0) - ((a.item as any).ratingCount || 0);
      });

    const results = scored.map((s) => s.item);
    console.log('Filtered - results count:', results.length);
    return results;
  }, [movies, series, searchQuery]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">
          {searchQuery ? `Resultados de búsqueda: "${searchQuery}"` : 'Búsqueda'}
        </h1>

        {!searchQuery.trim() ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">Ingresa un término de búsqueda en la barra superior</p>
            <p className="text-sm">Ejemplo: "batman", "breaking bad", "inception"</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <p className="text-lg">Cargando resultados...</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              Se encontraron {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((item) => (
                <ContentCard key={item.id} content={{ ...item, type: 'director' in item ? 'movie' : 'series' } as any} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No se encontraron resultados para "{searchQuery}"</p>
            <p className="text-sm">Intenta con otros términos de búsqueda o verifica la ortografía</p>
            <p className="text-xs mt-4">Debug: Total items: {((movies || []).length + (series || []).length)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

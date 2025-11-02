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
  const params = new URLSearchParams(location.split('?')[1] || '');
  const q = params.get('q') || '';

  const { data: movies, isLoading: mLoading } = useQuery<Movie[]>({ queryKey: ['/api/movies'] });
  const { data: series, isLoading: sLoading } = useQuery<Series[]>({ queryKey: ['/api/series'] });

  const isLoading = mLoading || sLoading;

  const filtered = useMemo(() => {
    const all: (Movie | Series)[] = [...(movies || []), ...(series || [])];
    if (!all.length) return [];
    const filters = parseQuery(q);

    // scoring: prefer exact title matches, then startsWith, then includes
    const scored = all
      .map((item) => {
        let score = 0;
        const title = (item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const director = ((item as any).director || (item as any).creator || '').toLowerCase();
        const cast = ((item.cast || []) as string[]).join(' ').toLowerCase();

        // explicit filters - if any fail, exclude with score -Infinity
        if (filters.platform && filters.platform.length > 0) {
          const matches = filters.platform.some((p: string) => (item.platform || []).some(pp => pp.toLowerCase() === p.toLowerCase()));
          if (!matches) return { item, score: -Infinity };
        }
        if (filters.genre && filters.genre.length > 0) {
          const matches = filters.genre.some((g: string) => (item.genre || []).some(gg => gg.toLowerCase() === g.toLowerCase()));
          if (!matches) return { item, score: -Infinity };
        }
        if (filters.year && filters.year.length > 0) {
          const matches = filters.year.some((y: string) => String(item.releaseYear) === y);
          if (!matches) return { item, score: -Infinity };
        }
        if (filters.type && filters.type.length > 0) {
          const tmatch = filters.type.some((t: string) => t.toLowerCase() === ('title' in item ? 'movie' : 'series'));
          if (!tmatch) return { item, score: -Infinity };
        }
        if (filters.title && filters.title.length > 0) {
          const matches = filters.title.some((s: string) => title.includes(s.toLowerCase()));
          if (!matches) return { item, score: -Infinity };
        }
        if (filters.director && filters.director.length > 0) {
          const matches = filters.director.some((s: string) => director.includes(s.toLowerCase()));
          if (!matches) return { item, score: -Infinity };
        }
        if (filters.actor && filters.actor.length > 0) {
          const matches = filters.actor.some((s: string) => cast.includes(s.toLowerCase()));
          if (!matches) return { item, score: -Infinity };
        }

        // plain terms
        if (filters.terms.length > 0) {
          for (const term of filters.terms) {
            const t = term.toLowerCase();
            if (title === t) score += 100;
            else if (title.startsWith(t)) score += 50;
            else if (title.includes(t)) score += 20;

            if (description.includes(t)) score += 8;
            if (director.includes(t)) score += 12;
            if (cast.includes(t)) score += 6;
          }
        } else {
          // if no plain terms, give small base score so filters-only queries still return results
          score += 1;
        }

        // boost by rating if available
        if ((item as any).averageRating) {
          score += ((item as any).averageRating || 0) * 2;
        }

        return { item, score };
      })
      .filter((s) => s.score > -Infinity)
      .sort((a, b) => b.score - a.score || ((b.item as any).averageRating || 0) - ((a.item as any).averageRating || 0));

    return scored.map((s) => s.item);
  }, [movies, series, q]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Resultados de búsqueda{q ? `: "${q}"` : ''}</h1>

        {isLoading ? (
          <p>Cargando resultados...</p>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <ContentCard key={item.id} content={{ ...item, type: 'title' in item ? 'movie' : 'series' } as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No se encontraron resultados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

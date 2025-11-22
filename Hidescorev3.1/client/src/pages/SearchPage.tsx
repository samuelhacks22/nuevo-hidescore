
import { useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "@/components/ui/ContentCard";
import type { Movie, Series } from "@shared/schema";

export default function SearchPage() {
  const [location] = useLocation();
  const searchString = useSearch();

  // Parse query parameter from URL
  const urlParams = new URLSearchParams(searchString);
  const searchQuery = urlParams.get('q') || '';

  console.log('SearchPage - location:', location);
  console.log('SearchPage - searchString:', searchString);
  console.log('SearchPage - searchQuery:', searchQuery);

  const { data: movies, isLoading: mLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies', { search: searchQuery }]
  });
  const { data: series, isLoading: sLoading } = useQuery<Series[]>({
    queryKey: ['/api/series', { search: searchQuery }]
  });

  const isLoading = mLoading || sLoading;

  console.log('SearchPage - movies count:', movies?.length || 0);
  console.log('SearchPage - series count:', series?.length || 0);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const all: (Movie | Series)[] = [...(movies || []), ...(series || [])];
    return all;
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

import { useQuery } from "@tanstack/react-query";
import { Film, TrendingUp, Sparkles } from "lucide-react";
import { ContentCard } from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Movie, Series, Rating } from "@shared/schema";

interface ContentWithType extends Omit<Movie | Series, 'type'> {
  type: 'movie' | 'series';
}

export default function HomePage() {
  const { data: trendingMovies, isLoading: loadingMovies } = useQuery<Movie[]>({
    queryKey: ["/api/movies/trending"],
  });

  const { data: trendingSeries, isLoading: loadingSeries } = useQuery<Series[]>({
    queryKey: ["/api/series/trending"],
  });

  const { data: recommendations, isLoading: loadingRecs } = useQuery<ContentWithType[]>({
    queryKey: ["/api/recommendations"],
  });

  const { data: userRatings } = useQuery<Rating[]>({
    queryKey: ["/api/ratings/user"],
    enabled: false, // Solo buscar cuando el usuario está autenticado
  });

  const getUserRating = (contentId: string, type: 'movie' | 'series') => {
    return userRatings?.find(
      (r) => (type === 'movie' ? r.movieId : r.seriesId) === contentId
    )?.rating;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl" data-testid="text-hero-title">
              Descubre tu Próxima
              <span className="block text-primary mt-2">Película Favorita</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Califica, reseña y obtén recomendaciones personalizadas impulsadas por IA
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/movies">
              <Button size="lg" className="text-lg px-8" data-testid="button-browse-movies">
                <Film className="w-5 h-5 mr-2" />
                Explorar Películas
              </Button>
            </Link>
            <Link href="/series">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-browse-series">
                Explorar Series
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Trending Movies Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h2 className="font-heading font-bold text-3xl" data-testid="text-section-trending-movies">
                Películas en Tendencia
              </h2>
            </div>
            <Link href="/movies">
              <Button variant="ghost" data-testid="link-view-all-movies">
                Ver Todas
              </Button>
            </Link>
          </div>

          {loadingMovies ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingMovies?.slice(0, 8).map((movie) => (
                <ContentCard
                  key={movie.id}
                  content={{ ...movie, type: 'movie' }}
                  userRating={getUserRating(movie.id, 'movie')}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Series Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h2 className="font-heading font-bold text-3xl" data-testid="text-section-trending-series">
                Series en Tendencia
              </h2>
            </div>
            <Link href="/series">
              <Button variant="ghost" data-testid="link-view-all-series">
                Ver Todas
              </Button>
            </Link>
          </div>

          {loadingSeries ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingSeries?.slice(0, 8).map((series) => (
                <ContentCard
                  key={series.id}
                  content={{ ...series, type: 'series' }}
                  userRating={getUserRating(series.id, 'series')}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              <div>
                <h2 className="font-heading font-bold text-3xl" data-testid="text-section-recommendations">
                  Recomendado para Ti
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Impulsado por IA basado en tus calificaciones
                </p>
              </div>
            </div>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 8).map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  userRating={getUserRating(content.id, content.type)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">¡Califica algunas películas para obtener recomendaciones personalizadas!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

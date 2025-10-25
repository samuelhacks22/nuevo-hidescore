import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tv, SlidersHorizontal } from "lucide-react";
import { ContentCard } from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { Series, Rating } from "@shared/schema";

const GENRES = [
  "Acción", "Aventura", "Animación", "Comedia", "Crimen", "Documental",
  "Drama", "Fantasía", "Terror", "Misterio", "Romance", "Ciencia Ficción", "Suspenso"
];

const PLATFORMS = [
  "Netflix", "Amazon Prime", "Disney+", "HBO Max", "Hulu", "Apple TV+", "Paramount+"
];

export default function SeriesPage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2025]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);
  const [sortBy, setSortBy] = useState<string>("popularity");

  const { data: series, isLoading } = useQuery<Series[]>({
    queryKey: ["/api/series", { 
      genre: selectedGenre, 
      platform: selectedPlatform,
      yearFrom: yearRange[0],
      yearTo: yearRange[1],
      ratingFrom: ratingRange[0],
      ratingTo: ratingRange[1],
      sortBy 
    }],
  });

  const { data: userRatings } = useQuery<Rating[]>({
    queryKey: ["/api/ratings/user"],
    enabled: false, // Solo buscar cuando el usuario está autenticado
  });

  const getUserRating = (seriesId: string) => {
    return userRatings?.find((r) => r.seriesId === seriesId)?.rating;
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Tv className="w-10 h-10 text-primary" />
            <h1 className="font-heading font-bold text-4xl md:text-5xl" data-testid="text-page-title">
              Series
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Explora nuestra colección de series de TV
          </p>
        </div>

        {/* Filters - Same structure as MoviesPage */}
        <div className="mb-8 p-6 bg-card rounded-lg border border-card-border space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-xl">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Género</Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger data-testid="select-genre">
                  <SelectValue placeholder="Todos los Géneros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Géneros</SelectItem>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger data-testid="select-platform">
                  <SelectValue placeholder="Todas las Plataformas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Plataformas</SelectItem>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform.toLowerCase()}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordenar Por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularidad</SelectItem>
                  <SelectItem value="rating">Mejor Calificadas</SelectItem>
                  <SelectItem value="recent">Agregadas Recientemente</SelectItem>
                  <SelectItem value="year-desc">Año (Más Nuevas)</SelectItem>
                  <SelectItem value="year-asc">Año (Más Antiguas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedGenre("all");
                  setSelectedPlatform("all");
                  setYearRange([2000, 2025]);
                  setRatingRange([0, 5]);
                  setSortBy("popularity");
                }}
                className="w-full"
                data-testid="button-reset-filters"
              >
                Restablecer Filtros
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Año de Lanzamiento: {yearRange[0]} - {yearRange[1]}</Label>
            <Slider
              value={yearRange}
              onValueChange={(value) => setYearRange(value as [number, number])}
              min={2000}
              max={2025}
              step={1}
              className="w-full"
              data-testid="slider-year"
            />
          </div>

          <div className="space-y-4">
            <Label>Calificación Mínima: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)}</Label>
            <Slider
              value={ratingRange}
              onValueChange={(value) => setRatingRange(value as [number, number])}
              min={0}
              max={5}
              step={0.1}
              className="w-full"
              data-testid="slider-rating"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Cargando..." : `${series?.length || 0} series encontradas`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : series && series.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {series.map((s) => (
              <ContentCard
                key={s.id}
                content={{ ...s, type: 'series' }}
                userRating={getUserRating(s.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No se encontraron series que coincidan con tus filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

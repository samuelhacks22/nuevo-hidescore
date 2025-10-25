import { Compass, Film, Tv } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiscoverPage() {
  const categories = [
    {
      title: "Tendencias",
      description: "Mira lo que todos están viendo",
      icon: Film,
      href: "/movies",
      color: "text-primary",
    },
    {
      title: "Películas Mejor Calificadas",
      description: "Películas aclamadas por la crítica",
      icon: Film,
      href: "/movies?sort=rating",
      color: "text-accent",
    },
    {
      title: "Series Populares",
      description: "Series de TV para maratonear",
      icon: Tv,
      href: "/series?sort=popularity",
      color: "text-primary",
    },
    {
      title: "Nuevos Lanzamientos",
      description: "Contenido agregado recientemente",
      icon: Film,
      href: "/movies?sort=recent",
      color: "text-accent",
    },
  ];

  const genres = [
    "Acción", "Aventura", "Animación", "Comedia", "Crimen", "Documental",
    "Drama", "Fantasía", "Terror", "Misterio", "Romance", "Ciencia Ficción", "Suspenso"
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-10 h-10 text-primary" />
            <h1 className="font-heading font-bold text-4xl md:text-5xl" data-testid="text-page-title">
              Descubrir
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Explora colecciones seleccionadas y encuentra tu próximo favorito
          </p>
        </div>

        {/* Quick Categories */}
        <div className="mb-16">
          <h2 className="font-heading font-semibold text-2xl mb-6">Navegación Rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} href={category.href}>
                  <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 h-full">
                    <CardHeader>
                      <Icon className={`w-12 h-12 mb-4 ${category.color}`} />
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Browse by Genre */}
        <div>
          <h2 className="font-heading font-semibold text-2xl mb-6">Navegar por Género</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <Link key={genre} href={`/movies?genre=${genre.toLowerCase()}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <p className="font-heading font-semibold text-lg">{genre}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

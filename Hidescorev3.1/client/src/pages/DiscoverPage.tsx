import { Compass, Film, Tv } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiscoverPage() {
  const categories = [
    {
      title: "Trending Now",
      description: "See what everyone is watching",
      icon: Film,
      href: "/movies",
      color: "text-primary",
    },
    {
      title: "Top Rated Movies",
      description: "Critically acclaimed films",
      icon: Film,
      href: "/movies?sort=rating",
      color: "text-accent",
    },
    {
      title: "Popular Series",
      description: "Binge-worthy TV shows",
      icon: Tv,
      href: "/series?sort=popularity",
      color: "text-primary",
    },
    {
      title: "New Releases",
      description: "Recently added content",
      icon: Film,
      href: "/movies?sort=recent",
      color: "text-accent",
    },
  ];

  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-10 h-10 text-primary" />
            <h1 className="font-heading font-bold text-4xl md:text-5xl" data-testid="text-page-title">
              Discover
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Explore curated collections and find your next favorite
          </p>
        </div>

        {/* Quick Categories */}
        <div className="mb-16">
          <h2 className="font-heading font-semibold text-2xl mb-6">Quick Browse</h2>
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
          <h2 className="font-heading font-semibold text-2xl mb-6">Browse by Genre</h2>
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

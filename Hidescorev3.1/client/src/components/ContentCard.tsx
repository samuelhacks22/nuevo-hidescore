import { Link } from "wouter";
import { Film, Tv, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Movie, Series } from "@shared/schema";

interface ContentCardProps {
  content: (Movie | Series) & { type: 'movie' | 'series' };
  userRating?: number;
  className?: string;
}

export function ContentCard({ content, userRating, className }: ContentCardProps) {
  const isMovie = content.type === 'movie';
  const detailPath = `/${content.type}/${content.id}`;
  
  return (
    <Link href={detailPath}>
      <Card 
        className={cn(
          "group overflow-hidden border-0 bg-card hover-elevate transition-all duration-200 cursor-pointer",
          "hover:scale-[1.02]",
          className
        )}
        data-testid={`card-${content.type}-${content.id}`}
      >
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {content.posterUrl ? (
            <img
              src={content.posterUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isMovie ? (
                <Film className="w-16 h-16 text-muted-foreground" />
              ) : (
                <Tv className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          )}
          
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Rating */}
              {content.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-medium" data-testid="average-rating">
                    {content.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({content.ratingCount})
                  </span>
                </div>
              )}
              
              {/* Platforms */}
              {content.platform.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {content.platform.slice(0, 2).map((platform) => (
                    <Badge 
                      key={platform} 
                      variant="secondary" 
                      className="text-xs"
                      data-testid={`platform-${platform}`}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User rating indicator */}
          {userRating && (
            <div className="absolute top-2 right-2">
              <Badge 
                className="bg-accent text-accent-foreground border-0"
                data-testid="user-rating-badge"
              >
                <Star className="w-3 h-3 fill-current mr-1" />
                {userRating.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-heading font-semibold text-lg line-clamp-1" data-testid="content-title">
            {content.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span data-testid="release-year">{content.releaseYear}</span>
            <div className="flex items-center gap-1">
              {isMovie ? (
                <Film className="w-4 h-4" />
              ) : (
                <Tv className="w-4 h-4" />
              )}
              <span className="capitalize">{content.type}</span>
            </div>
          </div>

          {/* Genres */}
          {content.genre.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.genre.slice(0, 2).map((genre) => (
                <Badge 
                  key={genre} 
                  variant="outline" 
                  className="text-xs"
                  data-testid={`genre-${genre}`}
                >
                  {genre}
                </Badge>
              ))}
              {content.genre.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{content.genre.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

import { Link } from "wouter";
import { Film, Tv, Star } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
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
  const { user } = useAuth();
  const { toast } = useToast();

  const [rateOpen, setRateOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [localRating, setLocalRating] = useState<number>(0);
  const [localReview, setLocalReview] = useState<string>("");
  const [localComment, setLocalComment] = useState<string>("");

  const ratingMutation = useMutation({
    mutationFn: (data: { rating: number; review?: string }) =>
      apiRequest("POST", "/api/ratings", {
        userId: user?.id,
        movieId: isMovie ? content.id : undefined,
        seriesId: !isMovie ? content.id : undefined,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${isMovie ? 'movies' : 'series'}`, content.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/${isMovie ? 'movies' : 'series'}/${content.id}/ratings`] });
      toast({ title: "¡Calificación enviada!" });
      setRateOpen(false);
      setLocalRating(0);
      setLocalReview("");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest("POST", "/api/comments", {
        userId: user?.id,
        movieId: isMovie ? content.id : undefined,
        seriesId: !isMovie ? content.id : undefined,
        content: text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${isMovie ? 'movies' : 'series'}/${content.id}/comments`] });
      toast({ title: "Comentario publicado" });
      setCommentOpen(false);
      setLocalComment("");
    },
  });
  
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
              {(content.averageRating ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-medium" data-testid="average-rating">
                    {(content.averageRating ?? 0).toFixed(1)}
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

              {/* Quick actions: rate & comment (prevent link navigation on click) */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Dialog open={rateOpen} onOpenChange={(v) => { setRateOpen(v); if (v && !user) { setRateOpen(false); toast({ title: 'Debes iniciar sesión', description: 'Inicia sesión para dejar una calificación' }); } }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRateOpen(true); }}>
                      Calificar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Calificar {content.title}</DialogTitle>
                      <DialogDescription>Deja una calificación y una reseña opcional.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <StarRating rating={localRating} interactive onRatingChange={setLocalRating} />
                      <Textarea placeholder="Escribe una reseña (opcional)" value={localReview} onChange={(e) => setLocalReview(e.target.value)} />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setRateOpen(false); setLocalRating(0); setLocalReview(""); }}>
                          Cancelar
                        </Button>
                        <Button onClick={() => ratingMutation.mutate({ rating: localRating, review: localReview || undefined })} disabled={localRating === 0 || ratingMutation.isPending}>
                          {ratingMutation.isPending ? 'Enviando...' : 'Enviar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={commentOpen} onOpenChange={(v) => { setCommentOpen(v); if (v && !user) { setCommentOpen(false); toast({ title: 'Debes iniciar sesión', description: 'Inicia sesión para comentar' }); } }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCommentOpen(true); }}>
                      Comentar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Comentario en {content.title}</DialogTitle>
                      <DialogDescription>Comparte tu opinión sobre esta {isMovie ? 'película' : 'serie'}.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Textarea placeholder="Escribe tu comentario..." value={localComment} onChange={(e) => setLocalComment(e.target.value)} />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setCommentOpen(false); setLocalComment(""); }}>
                          Cancelar
                        </Button>
                        <Button onClick={() => commentMutation.mutate(localComment)} disabled={!localComment.trim() || commentMutation.isPending}>
                          {commentMutation.isPending ? 'Publicando...' : 'Publicar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
              <span className="capitalize">{content.type === 'movie' ? 'Película' : 'Serie'}</span>
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

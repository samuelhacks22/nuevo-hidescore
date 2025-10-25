import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Film, Tv, Calendar, DollarSign, Clock, Users, Globe, 
  MessageSquare, Star, TrendingUp, Edit, Trash2
} from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { ContentCard } from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Movie, Series, Rating, Comment } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function ContentDetailPage({ type }: { type: 'movie' | 'series' }) {
  const [, params] = useRoute(`/${type}/:id`);
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();

  const [userRating, setUserRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const endpoint = type === 'movie' ? '/api/movies' : '/api/series';
  
  const { data: content, isLoading } = useQuery<Movie | Series>({
    queryKey: [endpoint, id],
  });

  const { data: ratings } = useQuery<Rating[]>({
    queryKey: [`${endpoint}/${id}/ratings`],
    enabled: !!id,
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: [`${endpoint}/${id}/comments`],
    enabled: !!id,
  });

  const { data: similar } = useQuery<(Movie | Series)[]>({
    queryKey: [`${endpoint}/${id}/similar`],
    enabled: !!id,
  });

  const userRatingData = ratings?.find(r => r.userId === user?.id);

  const ratingMutation = useMutation({
    mutationFn: (data: { rating: number; review?: string }) => 
      apiRequest("POST", `/api/ratings`, {
        [type === 'movie' ? 'movieId' : 'seriesId']: id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint, id] });
      queryClient.invalidateQueries({ queryKey: [`${endpoint}/${id}/ratings`] });
      toast({ title: "¡Calificación enviada exitosamente!" });
      setUserRating(0);
      setReview("");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/comments`, {
        [type === 'movie' ? 'movieId' : 'seriesId']: id,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${endpoint}/${id}/comments`] });
      toast({ title: "¡Comentario publicado exitosamente!" });
      setComment("");
    },
  });

  const handleSubmitRating = () => {
    if (userRating > 0) {
      ratingMutation.mutate({ rating: userRating, review: review || undefined });
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      commentMutation.mutate(comment);
    }
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isMovie = type === 'movie';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Poster */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0">
              <div className="aspect-[2/3] bg-muted">
                {content.posterUrl ? (
                  <img
                    src={content.posterUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isMovie ? <Film className="w-24 h-24 text-muted-foreground" /> : <Tv className="w-24 h-24 text-muted-foreground" />}
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2" data-testid="average-rating">
                    {content.averageRating > 0 ? content.averageRating.toFixed(1) : 'N/D'}
                  </div>
                  <StarRating rating={content.averageRating} size="lg" className="justify-center mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {content.ratingCount} {content.ratingCount === 1 ? 'calificación' : 'calificaciones'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4" data-testid="content-title">
                {content.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="outline" className="text-base">
                  <Calendar className="w-4 h-4 mr-2" />
                  {content.releaseYear}
                  {!isMovie && 'endYear' in content && content.endYear && ` - ${content.endYear}`}
                </Badge>
                {isMovie && 'runtime' in content && content.runtime && (
                  <Badge variant="outline" className="text-base">
                    <Clock className="w-4 h-4 mr-2" />
                    {content.runtime} min
                  </Badge>
                )}
                {!isMovie && 'seasons' in content && (
                  <Badge variant="outline" className="text-base">
                    <Tv className="w-4 h-4 mr-2" />
                    {content.seasons} {content.seasons === 1 ? 'Temporada' : 'Temporadas'}
                  </Badge>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {content.genre.map((g) => (
                  <Badge key={g} className="bg-primary/20 text-primary border-primary/30">
                    {g}
                  </Badge>
                ))}
              </div>

              <p className="text-lg leading-relaxed text-foreground/90 mb-6">
                {content.description}
              </p>

              {/* Platforms */}
              {content.platform.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-2">
                    Disponible en
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {content.platform.map((p) => (
                      <Badge key={p} variant="secondary">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isMovie && 'director' in content && content.director && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Director</p>
                    <p className="font-medium">{content.director}</p>
                  </div>
                )}
                {!isMovie && 'creator' in content && content.creator && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Creador</p>
                    <p className="font-medium">{content.creator}</p>
                  </div>
                )}
                {content.cast.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Elenco</p>
                    <p className="font-medium">{content.cast.slice(0, 3).join(", ")}</p>
                  </div>
                )}
                {content.language && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Idioma</p>
                    <p className="font-medium">{content.language}</p>
                  </div>
                )}
                {content.country && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">País</p>
                    <p className="font-medium">{content.country}</p>
                  </div>
                )}
                {isMovie && 'budget' in content && content.budget && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Presupuesto</p>
                    <p className="font-medium">${parseFloat(content.budget).toLocaleString()}</p>
                  </div>
                )}
                {isMovie && 'revenue' in content && content.revenue && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ingresos</p>
                    <p className="font-medium">${parseFloat(content.revenue).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rate This Content */}
        {user && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>
                {userRatingData ? 'Tu Calificación' : `Califica est${type === 'movie' ? 'a' : 'e'} ${type}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRatingData ? (
                <div className="space-y-2">
                  <StarRating rating={userRatingData.rating} size="lg" />
                  {userRatingData.review && (
                    <p className="text-muted-foreground mt-2">{userRatingData.review}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <StarRating
                      rating={userRating}
                      interactive
                      onRatingChange={setUserRating}
                      size="lg"
                    />
                  </div>
                  <Textarea
                    placeholder="Escribe tu reseña (opcional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="min-h-24"
                    data-testid="input-review"
                  />
                  <Button
                    onClick={handleSubmitRating}
                    disabled={userRating === 0 || ratingMutation.isPending}
                    data-testid="button-submit-rating"
                  >
                    {ratingMutation.isPending ? "Enviando..." : "Enviar Calificación"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comentarios ({comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Comparte tus pensamientos..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-24"
                  data-testid="input-comment"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || commentMutation.isPending}
                  data-testid="button-submit-comment"
                >
                  {commentMutation.isPending ? "Publicando..." : "Publicar Comentario"}
                </Button>
              </div>
            )}

            <Separator />

            <div className="space-y-6">
              {comments && comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-4" data-testid={`comment-${c.id}`}>
                    <Avatar>
                      <AvatarFallback>
                        {c.userId?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Usuario</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-foreground/90">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aún no hay comentarios. ¡Sé el primero en compartir tus pensamientos!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Similar Content */}
        {similar && similar.length > 0 && (
          <div>
            <h2 className="font-heading font-bold text-3xl mb-6">{type === 'movie' ? 'Películas Similares' : 'Series Similares'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similar.slice(0, 4).map((item) => (
                <ContentCard
                  key={item.id}
                  content={{ ...item, type }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

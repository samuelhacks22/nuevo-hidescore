import { useQuery } from "@tanstack/react-query";
import { User, Star, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentCard } from "@/components/ContentCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import type { Rating, Comment, Movie, Series } from "@shared/schema";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userRatings } = useQuery<(Rating & { movie?: Movie; series?: Series })[]>({
    queryKey: ["/api/ratings/user", { userId: user?.id }],
    enabled: !!user,
  });

  const { data: userComments } = useQuery<Comment[]>({
    queryKey: ["/api/comments/user", { userId: user?.id }],
    enabled: !!user,
  });

  if (!user) {
    setLocation("/");
    return null;
  }

  const averageRating = userRatings && userRatings.length > 0
    ? userRatings.reduce((acc, r) => acc + r.rating, 0) / userRatings.length
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="text-4xl">
                  {user.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="font-heading font-bold text-4xl mb-2" data-testid="text-username">
                  {user.displayName}
                </h1>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                
                {user.isAdmin && (
                  <Badge className="bg-accent text-accent-foreground mb-4">
                    Admin
                  </Badge>
                )}

                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold" data-testid="stat-ratings-count">
                        {userRatings?.length || 0}
                      </p>
                      <p className="text-muted-foreground">Ratings</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold" data-testid="stat-comments-count">
                        {userComments?.length || 0}
                      </p>
                      <p className="text-muted-foreground">Comments</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <div>
                      <p className="font-semibold" data-testid="stat-average-rating">
                        {averageRating.toFixed(1)}
                      </p>
                      <p className="text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">Joined</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Ratings */}
        <div className="mb-12">
          <h2 className="font-heading font-bold text-3xl mb-6">Your Ratings</h2>
          {userRatings && userRatings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userRatings.map((rating) => {
                const content = rating.movie || rating.series;
                if (!content) return null;
                
                return (
                  <ContentCard
                    key={rating.id}
                    content={{
                      ...content,
                      type: rating.movie ? 'movie' : 'series',
                    }}
                    userRating={rating.rating}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">You haven't rated any content yet</p>
                <p className="text-sm mt-2">Start rating movies and series to see them here!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Comments */}
        <div>
          <h2 className="font-heading font-bold text-3xl mb-6">Your Comments</h2>
          {userComments && userComments.length > 0 ? (
            <div className="space-y-4">
              {userComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <p className="text-foreground/90 mb-2">{comment.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">You haven't posted any comments yet</p>
                <p className="text-sm mt-2">Share your thoughts on movies and series!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

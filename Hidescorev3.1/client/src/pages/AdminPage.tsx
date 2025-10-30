import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Film, Tv, Users, Plus, Trash2, BarChart3, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MovieDialog } from "@/components/admin/MovieDialog";
import { SeriesDialog } from "@/components/admin/SeriesDialog";
import { UserDialog } from "@/components/admin/UserDialog";
import type { Movie, Series, User } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();
  const [movieDialogOpen, setMovieDialogOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | undefined>();
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [seriesToEdit, setSeriesToEdit] = useState<Series | undefined>();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | undefined>();

  const { data: movies } = useQuery<Movie[]>({
    queryKey: ["/api/admin/movies"],
  });

  const { data: series } = useQuery<Series[]>({
    queryKey: ["/api/admin/series"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats } = useQuery<{
    totalMovies: number;
    totalSeries: number;
    totalUsers: number;
    totalRatings: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const deleteContentMutation = useMutation({
    mutationFn: ({ type, id }: { type: 'movie' | 'series'; id: string }) =>
      apiRequest("DELETE", `/api/admin/${type === 'movie' ? 'movies' : 'series'}/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Contenido eliminado exitosamente" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Usuario eliminado exitosamente" });
    },
  });

  type CreateMovieData = {
    title: string;
    description: string;
    releaseYear: number;
    genre: string[];
    platform: string[];
    cast: string[];
    posterUrl: string | null;
    director: string | null;
    runtime: number | null;
    language: string | null;
    country: string | null;
    budget: number | null;
    revenue: number | null;
  };

  type CreateSeriesData = {
    title: string;
    description: string;
    releaseYear: number;
    genre: string[];
    platform: string[];
    cast: string[];
    posterUrl: string | null;
    language: string | null;
    country: string | null;
    seasons: number;
    episodes: number;
    endYear: number | null;
    creator: string | null;
  };

  type CreateUserData = {
    email: string;
    displayName: string;
    rank: "user" | "admin";
  };

  const createMovieMutation = useMutation({
    mutationFn: (data: CreateMovieData) =>
      apiRequest("POST", "/api/admin/movies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Película creada exitosamente" });
      setMovieDialogOpen(false);
    },
  });

  const updateMovieMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMovieData> }) =>
      apiRequest("PUT", `/api/admin/movies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/movies"] });
      toast({ title: "Película actualizada exitosamente" });
      setMovieDialogOpen(false);
    },
  });

  const createSeriesMutation = useMutation({
    mutationFn: (data: CreateSeriesData) =>
      apiRequest("POST", "/api/admin/series", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Serie creada exitosamente" });
      setSeriesDialogOpen(false);
    },
  });

  const updateSeriesMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSeriesData> }) =>
      apiRequest("PUT", `/api/admin/series/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      toast({ title: "Serie actualizada exitosamente" });
      setSeriesDialogOpen(false);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserData) =>
      apiRequest("POST", "/api/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Usuario creado exitosamente" });
      setUserDialogOpen(false);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserData> }) =>
      apiRequest("PUT", `/api/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario actualizado exitosamente" });
      setUserDialogOpen(false);
    },
  });

  const handleDelete = (type: 'movie' | 'series' | 'user', id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este contenido?")) {
      if (type === 'user') {
        deleteUserMutation.mutate(id);
      } else {
        deleteContentMutation.mutate({ type, id });
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-10 h-10 text-primary" />
            <h1 className="font-heading font-bold text-4xl md:text-5xl" data-testid="text-page-title">
              Panel de Administración
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gestionar contenido y usuarios
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Películas</CardTitle>
              <Film className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-movies">
                {stats?.totalMovies || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Series</CardTitle>
              <Tv className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-series">
                {stats?.totalSeries || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-users">
                {stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Calificaciones</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-ratings">
                {stats?.totalRatings || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Management Tabs */}
        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="movies">Películas</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-semibold text-2xl">Gestionar Películas</h2>
              <Button 
                onClick={() => {
                  setMovieToEdit(undefined);
                  setMovieDialogOpen(true);
                }}
                data-testid="button-add-movie"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Película
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movies && movies.length > 0 ? (
                    movies.map((movie) => (
                      <TableRow key={movie.id} data-testid={`row-movie-${movie.id}`}>
                        <TableCell className="font-medium">{movie.title}</TableCell>
                        <TableCell>{movie.releaseYear}</TableCell>
                        <TableCell>
                          {movie.genre.slice(0, 2).map((g) => (
                            <Badge key={g} variant="outline" className="mr-1">
                              {g}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>{(movie.averageRating ?? 0).toFixed(1)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setMovieToEdit(movie);
                                setMovieDialogOpen(true);
                              }}
                              data-testid={`button-edit-movie-${movie.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete('movie', movie.id)}
                              data-testid={`button-delete-movie-${movie.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No se encontraron películas. ¡Añade tu primera película para empezar!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="series" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-semibold text-2xl">Gestionar Series</h2>
              <Button 
                onClick={() => {
                  setSeriesToEdit(undefined);
                  setSeriesDialogOpen(true);
                }}
                data-testid="button-add-series"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Serie
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Temporadas</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {series && series.length > 0 ? (
                    series.map((s) => (
                      <TableRow key={s.id} data-testid={`row-series-${s.id}`}>
                        <TableCell className="font-medium">{s.title}</TableCell>
                        <TableCell>{s.releaseYear}</TableCell>
                        <TableCell>{s.seasons}</TableCell>
                        <TableCell>
                          {s.genre.slice(0, 2).map((g) => (
                            <Badge key={g} variant="outline" className="mr-1">
                              {g}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>{(s.averageRating ?? 0).toFixed(1)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSeriesToEdit(s);
                                setSeriesDialogOpen(true);
                              }}
                              data-testid={`button-edit-series-${s.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete('series', s.id)}
                              data-testid={`button-delete-series-${s.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No se encontraron series. ¡Añade tu primera serie para empezar!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-semibold text-2xl">Gestionar Usuarios</h2>
              <Button 
                onClick={() => {
                  setUserToEdit(undefined);
                  setUserDialogOpen(true);
                }}
                data-testid="button-add-user"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Usuario
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Se Unió</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.displayName}</TableCell>
                        <TableCell>
                          {(() => {
                            const isAdmin = String(u.rank || '').toLowerCase() === 'admin' || String(u.rank) === '1';
                            return (
                              <Badge variant={isAdmin ? "default" : "secondary"}>
                                {isAdmin ? "Admin" : "Usuario"}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToEdit(u);
                                setUserDialogOpen(true);
                              }}
                              data-testid={`button-edit-user-${u.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete('user', u.id)}
                              data-testid={`button-delete-user-${u.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <MovieDialog 
        open={movieDialogOpen} 
        onOpenChange={setMovieDialogOpen} 
        onSubmit={async (data) => {
          const movieData = {
            ...data,
            posterUrl: data.posterUrl || null,
            director: data.director || null,
            runtime: data.runtime || null,
            language: data.language || null,
            country: data.country || null,
            budget: null,
            revenue: null,
          };
          if (movieToEdit) {
            await updateMovieMutation.mutateAsync({ id: movieToEdit.id, data: movieData });
          } else {
            await createMovieMutation.mutateAsync(movieData);
          }
        }}
        movie={movieToEdit}
      />

      <SeriesDialog 
        open={seriesDialogOpen} 
        onOpenChange={setSeriesDialogOpen}
        onSubmit={async (data) => {
          const seriesData = {
            ...data,
            posterUrl: data.posterUrl || null,
            language: data.language || null,
            country: data.country || null,
            endYear: data.endYear || null,
            creator: data.creator || null,
          };
          if (seriesToEdit) {
            await updateSeriesMutation.mutateAsync({ id: seriesToEdit.id, data: seriesData });
          } else {
            await createSeriesMutation.mutateAsync(seriesData);
          }
        }}
        series={seriesToEdit}
      />

      <UserDialog 
        open={userDialogOpen} 
        onOpenChange={setUserDialogOpen}
        onSubmit={async (data) => {
          if (userToEdit) {
            await updateUserMutation.mutateAsync({ id: userToEdit.id, data });
          } else {
            await createUserMutation.mutateAsync(data);
          }
        }}
        user={userToEdit}
      />
    </div>
  );
}

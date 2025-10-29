import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Film, Tv, Users, Plus, Trash2, BarChart3 } from "lucide-react";
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
import type { Movie, Series, User } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');

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

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: 'movie' | 'series'; id: string }) =>
      apiRequest("DELETE", `/api/admin/${type === 'movie' ? 'movies' : 'series'}/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Contenido eliminado exitosamente" });
    },
  });

  const handleDelete = (type: 'movie' | 'series', id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este contenido?")) {
      deleteMutation.mutate({ type, id });
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
                onClick={() => toast({ 
                  title: "Función deshabilitada", 
                  description: "La función de agregar películas está temporalmente deshabilitada" 
                })} 
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
                onClick={() => toast({ 
                  title: "Función deshabilitada", 
                  description: "La función de agregar series está temporalmente deshabilitada" 
                })} 
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
            <h2 className="font-heading font-semibold text-2xl">Gestionar Usuarios</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Se Unió</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.displayName}</TableCell>
                        <TableCell>
                          <Badge variant={u.isAdmin ? "default" : "secondary"}>
                            {u.isAdmin ? "Admin" : "Usuario"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
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
    </div>
  );
}

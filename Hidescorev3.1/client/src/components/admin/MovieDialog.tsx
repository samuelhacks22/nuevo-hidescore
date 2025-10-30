import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Movie } from "@shared/schema";

const movieSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  posterUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  releaseYear: z.coerce.number().min(1888, "Año inválido").max(new Date().getFullYear() + 5),
  genre: z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
  platform: z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
  director: z.string().optional(),
  cast: z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
  runtime: z.coerce.number().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
});

type FormData = z.infer<typeof movieSchema>;

interface MovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie?: Movie;
  onSubmit: (data: FormData) => void;
}

export function MovieDialog({ open, onOpenChange, movie, onSubmit }: MovieDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: movie?.title || "",
      description: movie?.description || "",
      posterUrl: movie?.posterUrl || "",
      releaseYear: movie?.releaseYear || new Date().getFullYear(),
      genre: movie?.genre?.join(", ") || "",
      platform: movie?.platform?.join(", ") || "",
      director: movie?.director || "",
      cast: movie?.cast?.join(", ") || "",
      runtime: movie?.runtime,
      language: movie?.language || "",
      country: movie?.country || "",
    },
  });

  const handleSubmit = useCallback(async (data: FormData) => {
    await onSubmit(data);
    onOpenChange(false);
  }, [onSubmit, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{movie ? "Editar" : "Crear"} Película</DialogTitle>
          <DialogDescription>
            {movie 
              ? "Modifica los detalles de la película. Los campos con * son obligatorios."
              : "Añade una nueva película. Los campos con * son obligatorios."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="posterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Poster</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="releaseYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año de Lanzamiento *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1888} max={new Date().getFullYear() + 5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Géneros *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acción, Drama, Comedia" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataformas *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Netflix, Prime Video" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="director"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reparto *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Actor 1, Actor 2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="runtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (min)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {movie ? "Actualizar" : "Crear"} Película
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
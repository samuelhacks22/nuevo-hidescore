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
import { Series } from "@shared/schema";

const seriesSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  posterUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  releaseYear: z.coerce.number().min(1888, "Año inválido").max(new Date().getFullYear() + 5),
  endYear: z.coerce.number().min(1888, "Año inválido").max(new Date().getFullYear() + 5).optional(),
  seasons: z.coerce.number().min(1, "Mínimo 1 temporada").default(1),
  episodes: z.coerce.number().min(1, "Mínimo 1 episodio").default(1),
  genre: z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
  platform: z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
  creator: z.string().optional(),
  cast: z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
  language: z.string().optional(),
  country: z.string().optional(),
});

type FormData = z.infer<typeof seriesSchema>;

interface SeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: Series;
  onSubmit: (data: FormData) => Promise<void>;
}

export function SeriesDialog({ open, onOpenChange, series, onSubmit }: SeriesDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: series?.title || "",
      description: series?.description || "",
      posterUrl: series?.posterUrl || "",
      releaseYear: series?.releaseYear || new Date().getFullYear(),
      endYear: series?.endYear,
      seasons: series?.seasons || 1,
      episodes: series?.episodes || 1,
      genre: series?.genre?.join(", ") || "",
      platform: series?.platform?.join(", ") || "",
      creator: series?.creator || "",
      cast: series?.cast?.join(", ") || "",
      language: series?.language || "",
      country: series?.country || "",
    },
  });

  const handleSubmit = useCallback(async (data: FormData) => {
    await onSubmit(data);
    onOpenChange(false);
    form.reset();
  }, [onSubmit, onOpenChange, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{series ? "Editar" : "Crear"} Serie</DialogTitle>
          <DialogDescription>
            {series 
              ? "Modifica los detalles de la serie. Los campos con * son obligatorios."
              : "Añade una nueva serie. Los campos con * son obligatorios."
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
                name="endYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año de Finalización</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1888} max={new Date().getFullYear() + 5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seasons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporadas *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="episodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Episodios Totales *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creador</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} placeholder="Drama, Comedia, Acción" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {series ? "Actualizar" : "Crear"} Serie
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
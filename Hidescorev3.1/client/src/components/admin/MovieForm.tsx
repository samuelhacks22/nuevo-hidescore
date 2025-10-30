import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Movie } from "@shared/schema";

import type { InsertMovie } from "@shared/schema";

type FormSchema = {
  title: string;
  description: string;
  posterUrl: string;
  releaseYear: string;
  genre: string;
  platform: string;
  director: string;
  cast: string;
  runtime: string;
  language: string;
  country: string;
  budget: string;
  revenue: string;
};

const movieFormSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  posterUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  releaseYear: z.string().min(4, "Año inválido"),
  genre: z.string(),
  platform: z.string(),
  director: z.string(),
  cast: z.string(),
  runtime: z.string(),
  language: z.string(),
  country: z.string(),
  budget: z.string(),
  revenue: z.string(),
});

type MovieFormProps = {
  initialData?: Partial<Movie>;
  onSubmit: (data: InsertMovie) => void | Promise<void>;
  onCancel: () => void;
};

const arrayFromString = (str: string) => str.split(",").map(s => s.trim()).filter(Boolean);

export function MovieForm({ initialData, onSubmit, onCancel }: MovieFormProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      posterUrl: initialData?.posterUrl ?? "",
      releaseYear: initialData?.releaseYear?.toString() ?? new Date().getFullYear().toString(),
      genre: initialData?.genre?.join(", ") ?? "",
      platform: initialData?.platform?.join(", ") ?? "",
      director: initialData?.director ?? "",
      cast: initialData?.cast?.join(", ") ?? "",
      runtime: initialData?.runtime?.toString() ?? "",
      language: initialData?.language ?? "",
      country: initialData?.country ?? "",
      budget: initialData?.budget?.toString() ?? "",
      revenue: initialData?.revenue?.toString() ?? "",
    },
  });

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit((data) => {
          const transformedData: InsertMovie = {
            title: data.title,
            description: data.description,
            posterUrl: data.posterUrl || null,
            releaseYear: parseInt(data.releaseYear),
            genre: arrayFromString(data.genre),
            platform: arrayFromString(data.platform),
            director: data.director || null,
            cast: arrayFromString(data.cast),
            runtime: data.runtime ? parseInt(data.runtime) : null,
            language: data.language || null,
            country: data.country || null,
            budget: data.budget || null,
            revenue: data.revenue || null,
          };
          onSubmit(transformedData);
        })} 
        className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel>Año de Lanzamiento</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Géneros (separados por coma)</FormLabel>
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
              <FormLabel>Plataformas (separadas por coma)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Netflix, Prime Video" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel>Reparto (separado por coma)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="runtime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración (minutos)</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
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

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presupuesto</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="revenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recaudación</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? "Actualizar" : "Crear"} Película
          </Button>
        </div>
      </form>
    </Form>
  );
}
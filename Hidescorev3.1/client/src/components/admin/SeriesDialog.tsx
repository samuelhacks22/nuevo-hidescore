import { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";

// Normalize a user-entered URL by adding https:// when missing and validating
function normalizeUrl(raw?: string) {
  const s = (raw ?? "").trim();
  if (!s) return "";
  try {
    new URL(s);
    return s;
  } catch {
    if (!s.includes("://")) {
      try {
        const candidate = `https://${s}`;
        new URL(candidate);
        return candidate;
      } catch {
        return s;
      }
    }
    return s;
  }
}

function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Input schema for the form (strings / simple types)
const seriesInputSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  posterUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  releaseYear: z.string().regex(/^\d{4}$/, "Año inválido"),
  endYear: z.string().optional().or(z.literal("")),
  seasons: z.string().regex(/^\d+$/, "Temporadas inválidas").optional().or(z.literal("1")),
  episodes: z.string().regex(/^\d+$/, "Episodios inválidos").optional().or(z.literal("1")),
  genre: z.string(),
  // platformPairs: explicit list of { name, link }
  platformPairs: z.array(z.object({ name: z.string().min(1), link: z.string().optional().or(z.literal("") ) })),
  creator: z.string().optional().or(z.literal("")),
  cast: z.string(),
  language: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

type FormInput = z.infer<typeof seriesInputSchema>;

type FormData = {
  title: string;
  description: string;
  posterUrl: string | null;
  releaseYear: number;
  endYear?: number | null;
  seasons: number;
  episodes: number;
  genre: string[];
  platform: string[];
  platformLinks?: string[];
  creator?: string | null;
  cast: string[];
  language?: string | null;
  country?: string | null;
};

interface SeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: Series;
  onSubmit: (data: FormData) => Promise<void>;
}

export function SeriesDialog({ open, onOpenChange, series, onSubmit }: SeriesDialogProps) {
  const { toast } = useToast();

  const form = useForm<FormInput>({
    resolver: zodResolver(seriesInputSchema),
    defaultValues: {
      title: series?.title || "",
      description: series?.description || "",
      posterUrl: series?.posterUrl || "",
      releaseYear: series?.releaseYear?.toString() || new Date().getFullYear().toString(),
      endYear: series?.endYear?.toString() || "",
      seasons: series?.seasons?.toString() || "1",
      episodes: series?.episodes?.toString() || "1",
      genre: series?.genre?.join(", ") || "",
      platformPairs: (series?.platform || []).map((name, i) => ({ name, link: series?.platformLinks?.[i] ?? "" })) || [],
      creator: series?.creator || "",
      cast: series?.cast?.join(", ") || "",
      language: series?.language || "",
      country: series?.country || "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "platformPairs" });

  const handleSubmit = useCallback(async (input: FormInput) => {
    const toArray = (s?: string) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

    const platformNames = input.platformPairs.map(p => p.name).filter(Boolean);
    const normalizedLinks = input.platformPairs.map((p) => normalizeUrl(p.link));

    const hasInvalid = input.platformPairs.some((p, idx) => {
      const raw = (p.link ?? "").trim();
      if (!raw) return false;
      return !isValidHttpUrl(normalizedLinks[idx]);
    });

    if (hasInvalid) {
      input.platformPairs.forEach((p, idx) => {
        const raw = (p.link ?? "").trim();
        if (raw && !isValidHttpUrl(normalizedLinks[idx])) {
          form.setError(`platformPairs.${idx}.link` as any, { type: "manual", message: "URL inválida" } as any);
        }
      });
      toast({ title: "Hay enlaces inválidos", description: "Corrige los enlaces de plataforma antes de enviar." });
      return;
    }

    const platformLinks = normalizedLinks.some(l => l.length > 0) ? normalizedLinks : undefined;

    const payload: FormData = {
      title: input.title,
      description: input.description,
      posterUrl: input.posterUrl || null,
      releaseYear: parseInt(input.releaseYear, 10) || new Date().getFullYear(),
      endYear: input.endYear ? parseInt(input.endYear, 10) : null,
      seasons: input.seasons ? parseInt(input.seasons, 10) : 1,
      episodes: input.episodes ? parseInt(input.episodes, 10) : 1,
      genre: toArray(input.genre),
      platform: platformNames,
      platformLinks,
      creator: input.creator ? input.creator : null,
      cast: toArray(input.cast),
      language: input.language ? input.language : null,
      country: input.country ? input.country : null,
    };

    try {
      await onSubmit(payload);
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || String(err) });
    }
  }, [onSubmit, onOpenChange, form, toast]);

  useEffect(() => {
    if (open) {
      form.reset({
        title: series?.title || "",
        description: series?.description || "",
        posterUrl: series?.posterUrl || "",
        releaseYear: series?.releaseYear?.toString() || new Date().getFullYear().toString(),
        endYear: series?.endYear?.toString() || "",
        seasons: series?.seasons?.toString() || "1",
        episodes: series?.episodes?.toString() || "1",
        genre: series?.genre?.join(", ") || "",
        platformPairs: (series?.platform || []).map((name, i) => ({ name, link: series?.platformLinks?.[i] ?? "" })) || [],
        creator: series?.creator || "",
        cast: series?.cast?.join(", ") || "",
        language: series?.language || "",
        country: series?.country || "",
      });
    } else {
      form.reset();
    }
  }, [open, series, form]);

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

              <div>
                <FormItem>
                  <FormLabel>Plataformas y Links</FormLabel>
                  <FormMessage />
                </FormItem>

                {fields.map((f, idx) => (
                  <div key={f.id} className="flex gap-2 items-center mb-2">
                    <FormControl>
                      <Input {...form.register(`platformPairs.${idx}.name` as const)} placeholder="Nombre de la plataforma (ej. Netflix)" />
                    </FormControl>
                    <FormControl>
                      <Input {...form.register(`platformPairs.${idx}.link` as const)} placeholder="https://... (opcional)" />
                    </FormControl>
                    <Button type="button" variant="ghost" onClick={() => remove(idx)}>
                      Eliminar
                    </Button>
                  </div>
                ))}

                <Button type="button" onClick={() => append({ name: "", link: "" })}>
                  Añadir plataforma
                </Button>
              </div>
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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Item = {
  id: string;
  title: string;
  platform: string[];
  platformLinks?: string[];
};

export function BulkLinksDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<Item[]>([]);
  const [series, setSeries] = useState<Item[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiRequest("GET", "/api/admin/bulk/platform-links").then(async (res) => {
      const json = await res.json();
      setMovies(json.movies || []);
      setSeries(json.series || []);
    }).catch((err) => {
      toast({ title: "Error cargando datos", description: String(err) });
    }).finally(() => setLoading(false));
  }, [open]);

  const updateLink = (collection: "movies" | "series", idx: number, platIdx: number, value: string) => {
    const list = collection === "movies" ? [...movies] : [...series];
    const item = { ...list[idx] } as Item;
    const links = (item.platformLinks || []).slice();
    // ensure length
    while (links.length < (item.platform || []).length) links.push("");
    links[platIdx] = value;
    item.platformLinks = links;
    list[idx] = item;
    if (collection === "movies") setMovies(list);
    else setSeries(list);
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      // validate and normalize links client-side before sending
      const normalize = (links: any[]) => {
        if (!Array.isArray(links)) return [];
        const out: string[] = [];
        for (const l of links) {
          if (l === null || l === undefined) {
            out.push("");
            continue;
          }
          let s = String(l).trim();
          if (s === "") { out.push(""); continue; }
          if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
          try {
            const u = new URL(s);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('invalid');
            out.push(u.toString());
          } catch (err) {
            return { error: `Invalid URL: ${l}` };
          }
        }
        return { links: out };
      };

      const moviesPayload = movies.map(m => {
        const norm = normalize(m.platformLinks || []);
        if ((norm as any).error) throw new Error((norm as any).error + ` (movie ${m.title})`);
        return { id: m.id, platformLinks: (norm as any).links };
      });

      const seriesPayload = series.map(s => {
        const norm = normalize(s.platformLinks || []);
        if ((norm as any).error) throw new Error((norm as any).error + ` (series ${s.title})`);
        return { id: s.id, platformLinks: (norm as any).links };
      });

      const payload = { movies: moviesPayload, series: seriesPayload };
      await apiRequest("PUT", "/api/admin/bulk/platform-links", payload);
      toast({ title: "Guardado", description: "Enlaces actualizados correctamente" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error guardando", description: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Editar enlaces de plataformas (bulk)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="mb-4">
            <Label>Filtrar por título o plataforma</Label>
            <Input placeholder="Buscar..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
          <section>
            <h3 className="font-semibold mb-2">Películas</h3>
            {movies.length === 0 ? <p className="text-sm text-muted-foreground">No hay películas.</p> : (
              <div className="space-y-4">
                {movies.filter(m => {
                  if (!filter) return true;
                  const f = filter.toLowerCase();
                  return m.title.toLowerCase().includes(f) || (m.platform || []).some(p => p.toLowerCase().includes(f));
                }).map((m, mi) => (
                  <div key={m.id} className="p-3 border rounded">
                    <div className="font-medium mb-2">{m.title}</div>
                    {(m.platform || []).map((p, pi) => (
                      <div key={pi} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center mb-2">
                        <div className="md:col-span-1 text-sm text-muted-foreground">{p}</div>
                        <div className="md:col-span-2">
                          <Input value={(m.platformLinks || [])[pi] || ""} onChange={(e) => updateLink('movies', mi, pi, e.target.value)} placeholder={`Link para ${p}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-2">Series</h3>
            {series.length === 0 ? <p className="text-sm text-muted-foreground">No hay series.</p> : (
              <div className="space-y-4">
                {series.map((s, si) => (
                  <div key={s.id} className="p-3 border rounded">
                    <div className="font-medium mb-2">{s.title}</div>
                    {(s.platform || []).map((p, pi) => (
                      <div key={pi} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center mb-2">
                        <div className="md:col-span-1 text-sm text-muted-foreground">{p}</div>
                        <div className="md:col-span-2">
                          <Input value={(s.platformLinks || [])[pi] || ""} onChange={(e) => updateLink('series', si, pi, e.target.value)} placeholder={`Link para ${p}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={saveAll} disabled={loading}>{loading ? 'Guardando...' : 'Guardar todos'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkLinksDialog;

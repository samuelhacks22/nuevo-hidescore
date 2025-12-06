import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Flag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ReportDialogProps {
    movieId?: string;
    seriesId?: string;
    title: string;
}

export function ReportDialog({ movieId, seriesId, title }: ReportDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            toast({
                title: "Error",
                description: "Por favor selecciona una razón",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiRequest("POST", "/api/reports", {
                movieId,
                seriesId,
                reason,
                details,
            });

            toast({
                title: "Reporte enviado",
                description: "Gracias por tu reporte. Lo revisaremos pronto.",
            });
            setOpen(false);
            setReason("");
            setDetails("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reportar {title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Razón</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una razón" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="broken_link">Enlace roto</SelectItem>
                                <SelectItem value="wrong_content">Contenido incorrecto</SelectItem>
                                <SelectItem value="poor_quality">Mala calidad</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="details">Detalles (opcional)</Label>
                        <Textarea
                            id="details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Describe el problema..."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

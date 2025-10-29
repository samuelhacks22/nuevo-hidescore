import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Error', description: 'Por favor ingresa un email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await login(email.trim());
      toast({ title: 'Bienvenido' });
      setLocation('/');
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Algo salió mal', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="tucorreo@ejemplo.com" 
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Procesando...' : 'Iniciar sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Esta es una versión simplificada sin autenticación.
            Solo necesitas tu email para identificarte.
          </p>
          <div className="text-sm text-center">
            ¿No tienes una cuenta?{" "}
            <Button variant="ghost" className="p-0 h-auto" onClick={() => setLocation('/register')}>
              Regístrate
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
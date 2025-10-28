import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password, displayName || undefined);
        toast({ title: 'Registro exitoso' });
      } else {
        await signInWithEmail(email, password);
        toast({ title: 'Inicio de sesión exitoso' });
      }
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
          <CardTitle className="text-2xl">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <div>
                <Label>Nombre</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tu nombre" />
              </div>
            )}

            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>

            <div>
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={loading}>{loading ? 'Procesando...' : isRegister ? 'Registrar' : 'Iniciar sesión'}</Button>
              <Button variant="ghost" onClick={() => setIsRegister(!isRegister)}>{isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function SessionTimeout() {
    const { user, signOut } = useAuth();
    const { toast } = useToast();

    // 30 minutes in milliseconds
    const TIMEOUT_MS = 30 * 60 * 1000;

    useIdleTimeout(TIMEOUT_MS, () => {
        if (user) {
            signOut();
            toast({
                title: "Sesión expirada",
                description: "Se ha agotado el tiempo del servidor.",
                variant: "destructive",
            });
        }
    });

    return null;
}

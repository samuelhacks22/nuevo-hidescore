import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background pt-16">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center space-y-6">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-bold">404</h1>
            <p className="text-xl text-muted-foreground">Page Not Found</p>
          </div>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button className="w-full" data-testid="button-home">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

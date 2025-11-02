import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import React, { Suspense, lazy } from "react";
const HomePage = lazy(() => import("@/pages/HomePage"));
const MoviesPage = lazy(() => import("@/pages/MoviesPage"));
const SeriesPage = lazy(() => import("@/pages/SeriesPage"));
const ContentDetailPage = lazy(() => import("@/pages/ContentDetailPage"));
const DiscoverPage = lazy(() => import("@/pages/DiscoverPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage").then(mod => ({ default: (mod as any).LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then(mod => ({ default: (mod as any).RegisterPage })));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/movies" component={MoviesPage} />
        <Route path="/series" component={SeriesPage} />
        <Route path="/movie/:id">
          {() => <ContentDetailPage type="movie" />}
        </Route>
        <Route path="/series/:id">
          {() => <ContentDetailPage type="series" />}
        </Route>
        <Route path="/discover" component={DiscoverPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/admin" component={AdminPage} />
  <Route path="/login" component={LoginPage} />
  <Route path="/register" component={RegisterPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import MoviesPage from "@/pages/MoviesPage";
import SeriesPage from "@/pages/SeriesPage";
import ContentDetailPage from "@/pages/ContentDetailPage";
import DiscoverPage from "@/pages/DiscoverPage";
import AdminPage from "@/pages/AdminPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navbar />
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
        <Route path="/admin" component={AdminPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

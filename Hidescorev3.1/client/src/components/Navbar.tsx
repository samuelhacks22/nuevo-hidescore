import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Film, Search, Menu, X, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      const searchUrl = `/search?q=${encodeURIComponent(trimmedQuery)}`;
      console.log('Navigating to:', searchUrl);
      setLocation(searchUrl);
    }
  };

  // keep search input in sync with the query param when on /search
  useEffect(() => {
    try {
      const parts = location.split('?');
      if (parts[0] === '/search') {
        const params = new URLSearchParams(parts[1] || '');
        const q = params.get('q') || '';
        setSearchQuery(decodeURIComponent(q));
        return;
      }
    } catch (err) {
      // ignore
    }
    // when leaving search page, keep the input but don't override user's typing
  }, [location]);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/movies", label: "Películas" },
    { href: "/series", label: "Series" },
    { href: "/discover", label: "Descubrir" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
      )}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer group" data-testid="link-home">
            <img src="/logo.jpg" alt="Hidescore Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-medium transition-colors hover:text-primary cursor-pointer",
                  location === link.href ? "text-primary" : "text-foreground"
                )}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6 gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre de película o serie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-card-border"
                data-testid="input-search"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!searchQuery.trim()}
              data-testid="button-search"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" data-testid="button-admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Administrador
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar>
                        <AvatarFallback>
                          {user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} data-testid="button-logout" className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setLocation('/register')} data-testid="button-register">
                  Registrarse
                </Button>
                <Button onClick={() => setLocation('/login')} data-testid="button-signin">
                  Iniciar Sesión
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden pt-20 px-6 animate-in slide-in-from-top-5 duration-200 flex flex-col h-screen">
            <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="mb-6 space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </form>

            <div className="space-y-1 overflow-y-auto pb-20">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-6 border-t border-border" />

              {user ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm text-muted-foreground">Conectado como</p>
                    <p className="font-medium truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 rounded-lg text-lg font-medium hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 mr-2 inline-block" />
                      Panel de Administrador
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="block px-4 py-3 rounded-lg text-lg font-medium hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-2 inline-block" />
                    Mi Perfil
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-lg font-medium hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-2 inline-block" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="space-y-3 mt-4">
                  <Button
                    onClick={() => {
                      setLocation('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full h-12 text-base font-medium"
                  >
                    Registrarse
                  </Button>
                  <Button
                    onClick={() => {
                      setLocation('/login');
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full h-12 text-base font-medium"
                  >
                    Iniciar Sesión
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                className="w-full h-12 text-base font-medium text-muted-foreground hover:text-foreground mt-4 border border-transparent hover:border-border"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5 mr-2" />
                Cerrar Menú
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

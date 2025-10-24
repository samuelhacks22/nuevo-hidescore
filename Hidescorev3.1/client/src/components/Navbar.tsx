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
  const { user, signInWithGoogle, signOut, isConfigured } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/series", label: "Series" },
    { href: "/discover", label: "Discover" },
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
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group" data-testid="link-home">
              <Film className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-heading font-bold text-2xl">
                Hide<span className="text-primary">score</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "font-medium transition-colors hover:text-primary cursor-pointer",
                    location === link.href ? "text-primary" : "text-foreground"
                  )}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-card-border"
                data-testid="input-search"
              />
            </div>
          </form>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" data-testid="button-admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium" data-testid="text-username">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} data-testid="button-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={signInWithGoogle} data-testid="button-signin">
                {isConfigured ? "Sign In with Google" : "Sign In (Configure Firebase)"}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={cn(
                      "block px-3 py-2 rounded-md font-medium transition-colors",
                      location === link.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              {user ? (
                <>
                  {user.isAdmin && (
                    <Link href="/admin">
                      <a className="block px-3 py-2 rounded-md font-medium hover:bg-muted">
                        Admin Panel
                      </a>
                    </Link>
                  )}
                  <Link href="/profile">
                    <a className="block px-3 py-2 rounded-md font-medium hover:bg-muted">
                      Profile
                    </a>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md font-medium hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Button onClick={signInWithGoogle} className="w-full">
                  Sign In with Google
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

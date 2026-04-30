import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Activity, Users, Settings, Rss, Brain, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useUser } from "@clerk/react";
import { cn } from "@/lib/utils";
import { SportTabs } from "./sport-tabs";
import { UserMenu } from "./user-menu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  const navigation = [
    { name: "Breaking", href: "/", icon: Zap },
    { name: "Live Feed", href: "/feed", icon: Rss },
    { name: "Analyst", href: "/analyst", icon: Brain },
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Preferences", href: "/preferences", icon: Settings },
  ];

  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center px-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-mono font-bold tracking-tighter text-lg hover:text-primary transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <Activity className="h-5 w-5 text-primary" />
            <span>
              PRESSBOX<span className="text-primary">WIRE</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-auto hidden md:flex items-center gap-4 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-foreground",
                  isActive(item.href) ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive(item.href) && "text-primary")} />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="ml-4 hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile: just the hamburger + compact signed-in avatar */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            {/* Only show avatar (not the two-button row) when signed in */}
            {isLoaded && isSignedIn && <UserMenu />}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex items-center justify-center h-9 w-9 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl">
            <nav className="container mx-auto px-4 py-2 flex flex-col">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-3.5 text-sm font-medium border-b border-border/50 transition-colors",
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn("h-4 w-4 shrink-0", isActive(item.href) && "text-primary")}
                  />
                  <span>{item.name}</span>
                  {isActive(item.href) && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              ))}

              {/* Auth actions inside dropdown for signed-out users */}
              {isLoaded && !isSignedIn && (
                <div className="flex gap-3 pt-3 pb-1">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border border-border text-sm font-mono font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-mono font-bold hover:bg-primary/90 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Join Free
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

        <SportTabs />
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">{children}</main>

      <footer className="border-t border-border py-6 md:py-8 mt-auto bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-mono text-xs uppercase tracking-widest opacity-50 flex items-center justify-center gap-2">
            <Activity className="h-3 w-3" /> Pressbox Wire · NFL · MLB · NBA
          </p>
        </div>
      </footer>
    </div>
  );
}

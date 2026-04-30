import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Activity, Users, Settings, Rss, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { SportTabs } from "./sport-tabs";
import { UserMenu } from "./user-menu";
import { BreakingTicker } from "./breaking-ticker";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

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
        {/* Top bar: logo + auth */}
        <div className="container mx-auto flex h-12 items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono font-bold tracking-tighter text-lg hover:text-primary transition-colors"
          >
            <Activity className="h-5 w-5 text-primary" />
            <span>
              PRESSBOX<span className="text-primary">WIRE</span>
            </span>
          </Link>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>

        {/* Breaking news ticker */}
        <BreakingTicker />

        {/* Nav tab bar — scrollable on mobile, comfortable on desktop */}
        <div className="border-t border-border/60 bg-card/50">
          <div className="container mx-auto px-2">
            <div className="flex items-center overflow-x-auto scrollbar-none">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors shrink-0",
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                    )}
                  >
                    <item.icon className={cn("h-3.5 w-3.5", active && "text-primary")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

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

import { useClerk, useUser } from "@clerk/react";
import { Link } from "wouter";
import { User, LogOut, Settings, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/sign-in">
          <Button variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
            <LogIn className="h-4 w-4 mr-1.5" />
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="sm" className="font-mono text-xs uppercase tracking-wider">
            Join Free
          </Button>
        </Link>
      </div>
    );
  }

  const displayName = user.firstName ?? user.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "User";
  const initials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.firstName?.[1] ?? "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors">
          <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-bold font-mono text-primary uppercase">
            {initials || <User className="h-3.5 w-3.5" />}
          </div>
          <span className="hidden sm:block text-xs font-mono text-muted-foreground max-w-[100px] truncate">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {user.emailAddresses[0]?.emailAddress}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/preferences" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() => signOut({ redirectUrl: window.location.origin + (import.meta.env.BASE_URL || "/") })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

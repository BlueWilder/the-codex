import { Link, useLocation } from "wouter";
import { BookOpen, Gamepad2, HelpCircle, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GlobalMenu } from "@/components/GlobalMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  const navItems = [
    { href: "/introduction", icon: HelpCircle, label: "Guide" },
    { href: "/reference", icon: BookOpen, label: "Reference" },
    { href: "/game", icon: Gamepad2, label: "Game" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-[var(--page-x)]">
        <div className="flex items-center justify-between h-14 md:h-20">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" data-testid="link-logo-home">
            <img src={logoImage} alt="Codex" className="w-6 h-6 md:w-8 md:h-8" />
            <span className="font-display text-lg md:text-2xl text-amber-500 tracking-wider">Codex</span>
          </Link>

          <div className="flex items-center gap-1 md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "btn-icon md:w-auto md:gap-2 md:px-3",
                  location === item.href
                    ? "text-amber-500 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                    : "text-muted-foreground hover:text-amber-200 hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden md:inline text-sm font-sans font-medium">{item.label}</span>
              </Link>
            ))}

            <GlobalMenu />

            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="round"
                      aria-label="Account"
                      data-testid="button-user-menu"
                    >
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-amber-500" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                      {user.email || user.firstName || "Logged in"}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex items-center gap-2 cursor-pointer" data-testid="button-logout">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="pill" className="px-3 text-amber-500">
                  <a href="/api/login" aria-label="Sign in" data-testid="button-login">
                    <LogIn />
                    <span className="hidden sm:inline">Sign in</span>
                  </a>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { Link, useLocation } from "wouter";
import { BookOpen, Gamepad2, HelpCircle, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-amber-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-20">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" data-testid="link-logo-home">
            <img src={logoImage} alt="Codex" className="w-6 h-6 md:w-8 md:h-8" />
            <span className="font-display text-lg md:text-2xl text-amber-500 tracking-wider">Codex</span>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-1 md:space-x-2 px-3 py-2 rounded-lg transition-all duration-300",
                  location === item.href
                    ? "text-amber-500 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                    : "text-muted-foreground hover:text-amber-200 hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </Link>
            ))}

            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-8 w-8 md:h-10 md:w-10"
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
                <a href="/api/login" data-testid="button-login">
                  <Button variant="outline" size="sm" className="gap-1.5 text-amber-500 border-amber-900/50 hover:bg-amber-950/30">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Button>
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

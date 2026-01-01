import { Link, useLocation } from "wouter";
import { Skull, BookOpen, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/reference", icon: BookOpen, label: "Reference" },
    { href: "/game", icon: Gamepad2, label: "Game" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-amber-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-20">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" data-testid="link-logo-home">
            <Skull className="w-6 h-6 md:w-8 md:h-8 text-red-700" />
            <span className="font-display text-lg md:text-2xl text-amber-500 tracking-wider">The Codex</span>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-8">
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
          </div>
        </div>
      </div>
    </nav>
  );
}

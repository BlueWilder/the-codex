import { Link, useLocation } from "wouter";
import { Home, Skull, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/reference", icon: BookOpen, label: "Reference" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-amber-900/50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="hidden md:flex items-center space-x-2">
            <Skull className="w-8 h-8 text-red-700" />
            <span className="font-display text-2xl text-amber-500 tracking-wider">The Codex</span>
          </div>

          <div className="flex items-center justify-around w-full md:w-auto md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-all duration-300 md:flex-row md:space-x-2 md:px-4 md:py-2",
                  location === item.href
                    ? "text-amber-500 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                    : "text-muted-foreground hover:text-amber-200 hover:bg-white/5"
                )}
              >
                <item.icon className="w-6 h-6 mb-1 md:mb-0" />
                <span className="text-xs font-medium md:text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

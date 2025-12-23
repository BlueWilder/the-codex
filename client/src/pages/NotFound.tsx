import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto border border-red-900/50">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-display text-amber-500">404 Page Not Found</h1>
        <p className="text-muted-foreground font-serif text-lg">
          The page you seek has been lost to the void. Perhaps the Demon has hidden it?
        </p>
        <Link href="/" className="inline-block bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-8 rounded-lg transition-colors">
          Return to Safety
        </Link>
      </div>
    </div>
  );
}

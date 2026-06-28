import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import { Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center space-y-12 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-amber-400 to-amber-700 bg-clip-text text-transparent drop-shadow-sm font-display">
            Codex
          </h1>
          <p className="text-xl text-amber-100/60 font-serif max-w-2xl mx-auto italic">
            "Do not dare to hope, for the demon devours hope before all else."
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className="bg-amber-600 hover:bg-amber-500 text-black font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-amber-900/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Link href="/game" data-testid="link-enter-game-mode">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Enter Game Mode
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Track players, claims, and votes during your live games.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}

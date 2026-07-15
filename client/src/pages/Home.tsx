import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import { Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import cccBadge from "@/assets/ccc-parchment.png";

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
            className="bg-amber-600 hover:bg-amber-500 text-black font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-amber-900/30 transition-all duration-150 hover:-translate-y-0.5"
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="pt-8 space-y-3 border-t border-amber-900/20"
        >
          <p className="text-sm text-muted-foreground">
            Created by{" "}
            <a
              href="https://mageproductions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-600 hover:text-amber-500 underline underline-offset-2"
              data-testid="link-mage-productions"
            >
              Mage Productions
            </a>
          </p>
          <p
            className="text-xs leading-relaxed text-muted-foreground/70 max-w-2xl mx-auto"
            data-testid="text-attribution"
          >
            This is an unofficial fan-made reference tool for Blood on the Clocktower. Blood on the Clocktower and all associated characters, names, and imagery are the property of Steven Medway and The Pandemonium Institute. This tool is not affiliated with, endorsed, or sponsored by The Pandemonium Institute. For the official game, visit{" "}
            <a
              href="https://bloodontheclocktower.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-500 underline underline-offset-2"
              data-testid="link-botc-official"
            >
              bloodontheclocktower.com
            </a>
          </p>
          <a
            href="https://botc.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center gap-1 pt-2 opacity-80 hover:opacity-100 transition-opacity"
            data-testid="link-ccc-badge"
          >
            <img
              src={cccBadge}
              alt="Custom Characters Community"
              className="h-8 w-auto"
              data-testid="img-ccc-badge"
            />
            <span className="text-[10px] text-muted-foreground/60">
              A reference tool, not a source of official rulings.
            </span>
          </a>
        </motion.div>
      </div>
    </Layout>
  );
}

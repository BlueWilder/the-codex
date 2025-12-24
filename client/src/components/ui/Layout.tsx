import { ReactNode } from "react";
import { Navigation } from "../Navigation";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pt-16 md:pt-24 flex flex-col text-foreground selection:bg-red-900/50 selection:text-white">
      <Navigation />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto px-4 py-4 flex-1"
      >
        {children}
      </motion.main>
      <footer className="border-t border-amber-900/30 py-6 mt-8">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Created by <span className="font-bold">Mage Productions</span></p>
          <p className="text-xs text-muted-foreground/70 max-w-2xl mx-auto">
            This is an unofficial fan-made reference tool for Blood on the Clocktower. Blood on the Clocktower and all associated characters, names, and imagery are the property of Steven Medway and The Pandemonium Institute. This tool is not affiliated with, endorsed, or sponsored by The Pandemonium Institute. For the official game, visit{" "}
            <a href="https://bloodontheclocktower.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 underline">bloodontheclocktower.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

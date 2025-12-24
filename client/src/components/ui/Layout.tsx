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
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">Created by <span className="font-bold">Mage Productions</span></p>
        </div>
      </footer>
    </div>
  );
}

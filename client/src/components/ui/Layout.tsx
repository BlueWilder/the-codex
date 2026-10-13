import { ReactNode } from "react";
import { Navigation } from "../Navigation";
import { motion } from "framer-motion";

/**
 * Page shell: the app header plus a main column with the 20px page padding
 * (UI rule 8). Game Mode passes hideHeader; its own game header is the only
 * chrome there (UI rule 6).
 */
export function Layout({ children, hideHeader = false }: { children: ReactNode; hideHeader?: boolean }) {
  return (
    <div
      className={
        hideHeader
          ? "min-h-screen flex flex-col text-foreground selection:bg-red-900/50 selection:text-white"
          : "min-h-screen pt-14 md:pt-24 flex flex-col text-foreground selection:bg-red-900/50 selection:text-white"
      }
    >
      {!hideHeader && <Navigation />}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto flex-1 px-[var(--page-x)] py-5"
      >
        {children}
      </motion.main>
    </div>
  );
}

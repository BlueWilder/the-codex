import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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
            The Codex
          </h1>
          <p className="text-xl text-amber-100/60 font-serif max-w-2xl mx-auto italic">
            "There is no greater sorrow than to recall happiness in times of misery."
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Link href="/reference" className="group block">
            <div className="bg-card hover:bg-card/80 border border-amber-900/30 hover:border-amber-600/50 p-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-900/20 group-hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-900/40 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-500 mb-3 font-display">Character Reference</h2>
              <p className="text-muted-foreground">Browse characters by script, view abilities, tips, and strategies.</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}

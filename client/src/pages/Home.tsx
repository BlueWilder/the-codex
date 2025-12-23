import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import { ScrollText, PlusCircle, PlayCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
            The Grimoire
          </h1>
          <p className="text-xl text-amber-100/60 font-serif max-w-2xl mx-auto italic">
            "There is no greater sorrow than to recall happiness in times of misery."
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div variants={item}>
            <Link href="/game-setup" className="group block h-full">
              <div className="h-full bg-card hover:bg-card/80 border border-amber-900/30 hover:border-amber-600/50 p-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-900/20 group-hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-900/40 transition-colors">
                  <PlayCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-amber-500 mb-3 font-display">New Game</h2>
                <p className="text-muted-foreground">Setup a new session. Choose your script, add players, and begin the night.</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/scripts" className="group block h-full">
              <div className="h-full bg-card hover:bg-card/80 border border-amber-900/30 hover:border-amber-600/50 p-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-900/20 group-hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-amber-900/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-900/40 transition-colors">
                  <ScrollText className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-amber-500 mb-3 font-display">Scripts</h2>
                <p className="text-muted-foreground">Browse official scripts or create your own custom character sets.</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/reference" className="group block h-full">
              <div className="h-full bg-card hover:bg-card/80 border border-amber-900/30 hover:border-amber-600/50 p-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-900/20 group-hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-900/40 transition-colors">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-amber-500 mb-3 font-display">Reference</h2>
                <p className="text-muted-foreground">Browse characters, alignments, and ability details.</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/script-builder" className="group block h-full">
              <div className="h-full bg-card hover:bg-card/80 border border-amber-900/30 hover:border-amber-600/50 p-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-900/20 group-hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-emerald-900/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-900/40 transition-colors">
                  <PlusCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-amber-500 mb-3 font-display">Script Builder</h2>
                <p className="text-muted-foreground">Forge a new script. Mix and match characters for unique chaos.</p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}

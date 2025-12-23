import { Layout } from "@/components/ui/Layout";
import { useScripts } from "@/hooks/use-scripts";
import { OFFICIAL_SCRIPTS } from "@/lib/game-data";
import { ScrollText, Feather } from "lucide-react";
import { Link } from "wouter";

export default function Scripts() {
  const { data: customScripts, isLoading } = useScripts();

  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
          <h1 className="text-4xl font-display text-amber-500">Grimoires & Scripts</h1>
          <Link href="/script-builder" className="px-4 py-2 bg-red-900/80 hover:bg-red-800 text-red-100 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-black/20 hover:shadow-red-900/20 border border-red-800/50">
            <Feather className="w-4 h-4" />
            <span>Create Script</span>
          </Link>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-amber-200/80 flex items-center gap-2">
            <ScrollText className="w-5 h-5" /> Official Scripts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFICIAL_SCRIPTS.map((script) => (
              <div key={script.id} className="bg-card border border-amber-900/20 rounded-xl p-6 hover:border-amber-600/40 transition-all hover:bg-card/80 group">
                <div className="mb-4">
                  <span className="text-xs uppercase tracking-widest text-amber-500/60 font-semibold border border-amber-900/30 px-2 py-1 rounded">Official</span>
                </div>
                <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors font-display mb-2">{script.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 font-serif italic line-clamp-2">{script.description}</p>
                <div className="text-xs text-amber-500/50">By {script.author}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pt-8">
          <h2 className="text-2xl font-serif text-amber-200/80 flex items-center gap-2">
            <Feather className="w-5 h-5" /> Community Scripts
          </h2>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Summoning scripts...</div>
          ) : customScripts?.length === 0 ? (
            <div className="text-center py-12 bg-card/30 rounded-xl border border-dashed border-amber-900/30">
              <p className="text-muted-foreground">No custom scripts forged yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customScripts?.map((script) => (
                <div key={script.id} className="bg-card border border-amber-900/20 rounded-xl p-6 hover:border-amber-600/40 transition-all hover:bg-card/80 group">
                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-widest text-emerald-500/60 font-semibold border border-emerald-900/30 px-2 py-1 rounded">Custom</span>
                  </div>
                  <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors font-display mb-2">{script.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 font-serif italic line-clamp-2">{script.description || "No description provided."}</p>
                  <div className="text-xs text-amber-500/50">By {script.author || "Unknown"}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

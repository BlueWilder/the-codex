import { Layout } from "@/components/ui/Layout";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { useState } from "react";
import { Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Reference() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = ALL_CHARACTERS.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) || 
                          char.ability.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || char.team === filter;
    return matchesSearch && matchesFilter;
  });

  const getTeamColor = (team: string) => {
    switch(team) {
      case 'townsfolk': return 'text-blue-400 border-blue-900/30 bg-blue-950/20';
      case 'outsider': return 'text-blue-200 border-blue-800/30 bg-blue-900/10';
      case 'minion': return 'text-red-400 border-red-900/30 bg-red-950/20';
      case 'demon': return 'text-red-600 border-red-900/50 bg-red-950/30';
      case 'traveler': return 'text-amber-400 border-amber-900/30 bg-amber-950/20';
      default: return 'text-gray-400 border-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/30 pb-6">
          <h1 className="text-4xl font-display text-amber-500">Character Reference</h1>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ability..."
              className="w-full bg-black/20 border border-amber-900/30 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-amber-600/50 transition-colors placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                filter === f 
                  ? "bg-amber-900/50 text-amber-100 border-amber-600" 
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((char) => (
            <div key={char.id} className={cn("p-4 rounded-xl border transition-all hover:-translate-y-0.5", getTeamColor(char.team))}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-lg font-bold">{char.name}</h3>
                <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{char.team}</span>
              </div>
              <p className="text-sm font-serif leading-relaxed opacity-90">{char.ability}</p>
              
              <div className="mt-4 flex gap-2">
                {char.firstNightOrder !== null && (
                  <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-200/70 border border-amber-900/20">First Night</span>
                )}
                {char.otherNightOrder !== null && (
                  <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-200/70 border border-amber-900/20">Other Nights</span>
                )}
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground font-serif italic">
              No souls found matching your inquiry.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

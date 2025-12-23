import { Layout } from "@/components/ui/Layout";
import { useState } from "react";
import { useCreateScript } from "@/hooks/use-scripts";
import { CHARACTERS } from "@/lib/game-data";
import { Search, Plus, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScriptBuilder() {
  const { mutate: createScript, isPending } = useCreateScript();
  const [name, setName] = useState("");
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const toggleChar = (id: string) => {
    if (selectedChars.includes(id)) {
      setSelectedChars(prev => prev.filter(c => c !== id));
    } else {
      setSelectedChars(prev => [...prev, id]);
    }
  };

  const handleSave = () => {
    if (!name || selectedChars.length === 0) return;
    createScript({
      name,
      author: "Local User", // In real app, from auth
      description: "Custom script created in Script Builder",
      isOfficial: false,
      content: selectedChars
    });
    // Reset or redirect logic here
    setName("");
    setSelectedChars([]);
  };

  const filtered = CHARACTERS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        {/* Left Panel: Selection */}
        <div className="w-1/3 bg-card border border-amber-900/30 rounded-xl p-6 flex flex-col shadow-lg">
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-display text-amber-500">New Script</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Script Name..."
              className="w-full bg-black/20 border-b border-amber-900/50 px-0 py-2 text-xl font-bold focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {['townsfolk', 'outsider', 'minion', 'demon'].map(team => {
              const teamChars = selectedChars
                .map(id => CHARACTERS.find(c => c.id === id))
                .filter(c => c && c.team === team);
              
              if (teamChars.length === 0) return null;

              return (
                <div key={team}>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">{team}s</h3>
                  <div className="space-y-2">
                    {teamChars.map(char => char && (
                      <div key={char.id} className="flex items-center justify-between group p-2 rounded hover:bg-white/5">
                        <span className={cn(
                          "font-serif",
                          team === 'townsfolk' ? 'text-blue-300' :
                          team === 'outsider' ? 'text-blue-200' :
                          team === 'minion' ? 'text-red-400' : 'text-red-500'
                        )}>{char.name}</span>
                        <button onClick={() => toggleChar(char.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {selectedChars.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic font-serif">
                The grimoire is empty. Add characters from the right.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-amber-900/30">
            <button
              onClick={handleSave}
              disabled={!name || selectedChars.length === 0 || isPending}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Forging..." : "Save Script"}
            </button>
          </div>
        </div>

        {/* Right Panel: Library */}
        <div className="flex-1 flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-card border border-amber-900/30 rounded-xl py-3 pl-12 pr-4 shadow-lg focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {filtered.map(char => (
              <button
                key={char.id}
                onClick={() => toggleChar(char.id)}
                className={cn(
                  "text-left p-4 rounded-xl border transition-all hover:-translate-y-0.5 relative group overflow-hidden",
                  selectedChars.includes(char.id)
                    ? "bg-amber-900/20 border-amber-500/50"
                    : "bg-card border-amber-900/20 hover:border-amber-500/30"
                )}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "font-bold font-display",
                      char.team === 'townsfolk' ? 'text-blue-400' :
                      char.team === 'outsider' ? 'text-blue-200' :
                      char.team === 'minion' ? 'text-red-400' : 'text-red-500'
                    )}>{char.name}</span>
                    {selectedChars.includes(char.id) && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{char.ability}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

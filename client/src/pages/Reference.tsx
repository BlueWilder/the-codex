import { Layout } from "@/components/ui/Layout";
import { ALL_CHARACTERS, getJinxesForCharacter, type Character, type Jinx } from "@/lib/game-data";
import { useState } from "react";
import { Search, Moon, Sun, Settings, AlertTriangle, ChevronDown, Quote, Lightbulb, Sword, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function CharacterCard({ char, isExpanded, onToggle }: { 
  char: Character; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const jinxes = getJinxesForCharacter(char.id);
  
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

  const getJinxedCharacterName = (jinx: Jinx) => {
    const otherId = jinx.character1 === char.id ? jinx.character2 : jinx.character1;
    const otherChar = ALL_CHARACTERS.find(c => c.id === otherId);
    return otherChar?.name || otherId;
  };

  return (
    <motion.div 
      layout
      onClick={onToggle}
      className={cn(
        "p-4 rounded-xl border transition-colors cursor-pointer select-none",
        getTeamColor(char.team),
        isExpanded && "ring-1 ring-amber-500/50"
      )}
      data-testid={`card-character-${char.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-lg font-bold">{char.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{char.team}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 opacity-50" />
          </motion.div>
        </div>
      </div>
      
      <p className="text-sm font-serif leading-relaxed opacity-90">{char.ability}</p>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {char.firstNightOrder !== null && (
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-200/70 border border-amber-900/20 flex items-center gap-1">
            <Moon className="w-3 h-3" /> First Night
          </span>
        )}
        {char.otherNightOrder !== null && (
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-200/70 border border-amber-900/20 flex items-center gap-1">
            <Sun className="w-3 h-3" /> Other Nights
          </span>
        )}
        {char.setup && (
          <span className="text-[10px] bg-purple-900/40 px-2 py-0.5 rounded text-purple-300 border border-purple-700/30 flex items-center gap-1">
            <Settings className="w-3 h-3" /> Setup
          </span>
        )}
        {jinxes.length > 0 && (
          <span className="text-[10px] bg-orange-900/40 px-2 py-0.5 rounded text-orange-300 border border-orange-700/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {jinxes.length} Jinx{jinxes.length > 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-current/20 space-y-4">
              {(char.firstNightOrder !== null || char.otherNightOrder !== null) && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Moon className="w-3 h-3" /> Night Order
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {char.firstNightOrder !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">First Night:</span>
                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-amber-300">#{char.firstNightOrder}</span>
                      </div>
                    )}
                    {char.otherNightOrder !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Other Nights:</span>
                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-amber-300">#{char.otherNightOrder}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {char.reminders.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">Reminder Tokens</h4>
                  <div className="flex flex-wrap gap-2">
                    {char.reminders.map((reminder, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-black/40 px-2 py-1 rounded-full border border-current/20"
                      >
                        {reminder}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jinxes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-orange-400" /> Jinxes
                  </h4>
                  <div className="space-y-2">
                    {jinxes.map((jinx, idx) => (
                      <div 
                        key={idx}
                        className="text-xs bg-orange-950/30 border border-orange-900/30 rounded-lg p-2"
                      >
                        <span className="font-bold text-orange-300">{getJinxedCharacterName(jinx)}:</span>
                        <span className="ml-1 opacity-90">{jinx.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {char.setup && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Settings className="w-3 h-3 text-purple-400" /> Setup Effect
                  </h4>
                  <p className="text-xs opacity-80">
                    This character modifies the game setup. Check the ability for details.
                  </p>
                </div>
              )}

              {/* Flavor Quote */}
              {char.flavorQuote && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-400" /> Flavor
                  </h4>
                  <p className="text-sm font-serif italic opacity-80 pl-3 border-l-2 border-amber-700/50">
                    {char.flavorQuote}
                  </p>
                </div>
              )}

              {/* Extended Summary */}
              {char.extendedSummary && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-400" /> How It Works
                  </h4>
                  <div className="text-sm font-serif opacity-90 space-y-2">
                    {char.extendedSummary.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips and Tricks */}
              {char.tipsAndTricks && char.tipsAndTricks.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-yellow-400" /> Tips & Tricks
                  </h4>
                  <ul className="text-xs space-y-1.5 opacity-90">
                    {char.tipsAndTricks.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-yellow-500/70 shrink-0">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bluffing As (for good characters to bluff) */}
              {char.bluffingAs && char.bluffingAs.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Sword className="w-3 h-3 text-red-400" /> Bluffing as {char.name}
                  </h4>
                  <ul className="text-xs space-y-1.5 opacity-90">
                    {char.bluffingAs.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-red-400/70 shrink-0">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fighting The (for good characters fighting evil) */}
              {char.fightingThe && char.fightingThe.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                    <Sword className="w-3 h-3 text-green-400" /> Fighting the {char.name}
                  </h4>
                  <ul className="text-xs space-y-1.5 opacity-90">
                    {char.fightingThe.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-green-400/70 shrink-0">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const SCRIPTS = [
  { id: 'all', label: 'All Scripts' },
  { id: 'tb', label: 'Trouble Brewing' },
  { id: 'bmr', label: 'Bad Moon Rising' },
  { id: 'snv', label: 'Sects & Violets' },
];

export default function Reference() {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [scriptFilter, setScriptFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ALL_CHARACTERS.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) || 
                          char.ability.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === "all" || char.team === teamFilter;
    const matchesScript = scriptFilter === "all" || char.edition === scriptFilter;
    return matchesSearch && matchesTeam && matchesScript;
  });

  const handleToggle = (charId: string) => {
    setExpandedId(prev => prev === charId ? null : charId);
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
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SCRIPTS.map((script) => (
              <button
                key={script.id}
                onClick={() => setScriptFilter(script.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                  scriptFilter === script.id 
                    ? "bg-red-900/50 text-red-100 border-red-600" 
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
                )}
                data-testid={`button-script-${script.id}`}
              >
                {script.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler'].map((f) => (
              <button
                key={f}
                onClick={() => setTeamFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                  teamFilter === f 
                    ? "bg-amber-900/50 text-amber-100 border-amber-600" 
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
                )}
                data-testid={`button-filter-${f}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((char) => (
            <CharacterCard 
              key={char.id}
              char={char}
              isExpanded={expandedId === char.id}
              onToggle={() => handleToggle(char.id)}
            />
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground font-serif italic">
              No souls found matching your inquiry.
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

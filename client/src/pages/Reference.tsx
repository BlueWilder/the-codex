import { Layout } from "@/components/ui/Layout";
import { ALL_CHARACTERS, OFFICIAL_SCRIPTS, TRAVELLER_SCRIPT_MAP, getJinxesForCharacter, type Character, type Jinx } from "@/lib/game-data";
import { useState, useEffect } from "react";
import { Search, Moon, Sun, Settings, AlertTriangle, ChevronDown, Quote, Lightbulb, Sword, Eye, Check, BookOpen, Plus, Minus, Trash2, Pencil, ArrowDownAZ, LayoutList, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";

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
      case 'fabled': return 'text-violet-400 border-violet-900/30 bg-violet-950/20';
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
            <div className="mt-4 pt-4 border-t border-current/20 space-y-5 md:space-y-4">
              {(char.firstNightOrder !== null || char.otherNightOrder !== null) && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 md:w-3 md:h-3" /> Night Order
                  </h4>
                  <div className="flex flex-wrap gap-3 text-base md:text-sm">
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
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70">Reminder Tokens</h4>
                  <div className="flex flex-wrap gap-2">
                    {char.reminders.map((reminder, idx) => (
                      <span 
                        key={idx}
                        className="text-sm md:text-xs bg-black/40 px-3 py-1.5 md:px-2 md:py-1 rounded-full border border-current/20"
                      >
                        {reminder}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jinxes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 md:w-3 md:h-3 text-orange-400" /> Jinxes
                  </h4>
                  <div className="space-y-2">
                    {jinxes.map((jinx, idx) => (
                      <div 
                        key={idx}
                        className="text-sm md:text-xs bg-orange-950/30 border border-orange-900/30 rounded-lg p-3 md:p-2"
                      >
                        <span className="font-bold text-orange-300">{getJinxedCharacterName(jinx)}:</span>
                        <span className="ml-1 opacity-90">{jinx.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {char.setup && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 md:w-3 md:h-3 text-purple-400" /> Setup Effect
                  </h4>
                  <p className="text-sm md:text-xs opacity-80">
                    This character modifies the game setup. Check the ability for details.
                  </p>
                </div>
              )}

              {/* Flavor Quote */}
              {char.flavorQuote && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <Quote className="w-4 h-4 md:w-3 md:h-3 text-amber-400" /> Flavor
                  </h4>
                  <p className="text-base md:text-sm font-serif italic opacity-80 pl-4 md:pl-3 border-l-2 border-amber-700/50">
                    {char.flavorQuote}
                  </p>
                </div>
              )}

              {/* Extended Summary */}
              {char.extendedSummary && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 md:w-3 md:h-3 text-blue-400" /> How It Works
                  </h4>
                  <div className="text-base md:text-sm font-serif opacity-90 space-y-3 md:space-y-2 leading-relaxed">
                    {char.extendedSummary.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips and Tricks */}
              {char.tipsAndTricks && char.tipsAndTricks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 md:w-3 md:h-3 text-yellow-400" /> Tips & Tricks
                  </h4>
                  <ul className="text-sm md:text-xs space-y-2.5 md:space-y-1.5 opacity-90">
                    {char.tipsAndTricks.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-yellow-500/70 shrink-0">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bluffing As (for good characters to bluff) */}
              {char.bluffingAs && char.bluffingAs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <Sword className="w-4 h-4 md:w-3 md:h-3 text-red-400" /> Bluffing as {char.name}
                  </h4>
                  <ul className="text-sm md:text-xs space-y-2.5 md:space-y-1.5 opacity-90">
                    {char.bluffingAs.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-red-400/70 shrink-0">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fighting The (for good characters fighting evil) */}
              {char.fightingThe && char.fightingThe.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                    <Sword className="w-4 h-4 md:w-3 md:h-3 text-green-400" /> Fighting the {char.name}
                  </h4>
                  <ul className="text-sm md:text-xs space-y-2.5 md:space-y-1.5 opacity-90">
                    {char.fightingThe.map((tip, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-green-400/70 shrink-0">-</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to Run (Storyteller instructions) - Collapsible Accordion */}
              {char.howToRun && (
                <Accordion type="single" collapsible className="w-full" onClick={(e) => e.stopPropagation()}>
                  <AccordionItem value="how-to-run" className="border-none">
                    <AccordionTrigger 
                      className="py-2 hover:no-underline [&>svg]:hidden"
                      data-testid={`accordion-how-to-run-${char.id}`}
                    >
                      <h4 className="text-sm md:text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 md:w-3 md:h-3 text-purple-400" /> How to Run
                        <Plus className="w-4 h-4 md:w-3 md:h-3 text-purple-400 transition-transform [[data-state=open]_&]:hidden" />
                        <Minus className="w-4 h-4 md:w-3 md:h-3 text-purple-400 transition-transform [[data-state=closed]_&]:hidden" />
                      </h4>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm md:text-xs bg-purple-950/30 border border-purple-900/30 rounded-lg p-3 md:p-2">
                        <div className="space-y-2 opacity-90 leading-relaxed">
                          {char.howToRun.split('\n\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph.replace(/\n/g, ' ')}</p>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
  { id: 'twh', label: 'The Wild Hunt' },
  { id: 'sot', label: 'The Ship of Theseus' },
];


export default function Reference() {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [scriptFilter, setScriptFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"alphabetical" | "sheet" | "night">("alphabetical");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const { customScripts, addCustomScript, updateCustomScript, deleteCustomScript } = useLocalScripts();

  // Update sort order based on script filter
  useEffect(() => {
    if (scriptFilter === "all") {
      setSortOrder("alphabetical");
    } else {
      setSortOrder("sheet");
    }
  }, [scriptFilter]);

  const activeCustomScript = scriptFilter.startsWith('custom:') 
    ? customScripts.find(s => s.id === scriptFilter.replace('custom:', ''))
    : null;

  const filtered = ALL_CHARACTERS.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) || 
                          char.ability.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === "all" || char.team === teamFilter;
    
    const isFabled = char.team === "fabled";
    const isTraveler = char.team === "traveler";
    let matchesScript = true;
    if (activeCustomScript) {
      matchesScript = activeCustomScript.characterIds.includes(char.id) || isFabled;
    } else if (scriptFilter !== "all") {
      const officialScript = OFFICIAL_SCRIPTS.find(s => s.id === scriptFilter);
      if (officialScript) {
        if (isTraveler) {
          const inCharacterList = officialScript.characters.includes(char.id);
          const scriptTravellers = TRAVELLER_SCRIPT_MAP[officialScript.id];
          matchesScript = inCharacterList || (scriptTravellers ? scriptTravellers.includes(char.id) : false);
        } else {
          matchesScript = officialScript.characters.includes(char.id) || isFabled;
        }
      } else {
        if (isTraveler) {
          const scriptTravellers = TRAVELLER_SCRIPT_MAP[scriptFilter];
          matchesScript = scriptTravellers ? scriptTravellers.includes(char.id) : false;
        } else {
          matchesScript = char.edition === scriptFilter || isFabled;
        }
      }
    }
    
    return matchesSearch && matchesTeam && matchesScript;
  }).sort((a, b) => {
    const endTeams = ["traveler", "fabled"];
    const aIsEnd = endTeams.includes(a.team);
    const bIsEnd = endTeams.includes(b.team);
    if (aIsEnd && bIsEnd) {
      if (a.team !== b.team) return a.team === "traveler" ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    if (aIsEnd && !bIsEnd) return 1;
    if (!aIsEnd && bIsEnd) return -1;
    
    // Sort non-travelers based on selected sort order
    if (sortOrder === "alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === "night") {
      // Night order sorting - use firstNightOrder, fall back to otherNightOrder
      const aOrder = a.firstNightOrder ?? a.otherNightOrder ?? 999;
      const bOrder = b.firstNightOrder ?? b.otherNightOrder ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    } else {
      // Sheet order: group by team, maintain original array order within team
      const teamOrder: Record<string, number> = { townsfolk: 0, outsider: 1, minion: 2, demon: 3, traveler: 4, fabled: 5 };
      const aTeamOrder = teamOrder[a.team] ?? 6;
      const bTeamOrder = teamOrder[b.team] ?? 6;
      if (aTeamOrder !== bTeamOrder) return aTeamOrder - bTeamOrder;
      // Within same team, maintain original array index order
      const aIndex = ALL_CHARACTERS.indexOf(a);
      const bIndex = ALL_CHARACTERS.indexOf(b);
      return aIndex - bIndex;
    }
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
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
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
            
            {customScripts.length > 0 && (
              <>
                <div className="w-px h-6 bg-border mx-1" />
                {customScripts.map((script) => (
                  <div key={script.id} className="flex items-center">
                    <button
                      onClick={() => setScriptFilter(`custom:${script.id}`)}
                      className={cn(
                        "px-3 py-1.5 rounded-l-full text-xs font-bold tracking-wider transition-all border whitespace-nowrap",
                        scriptFilter === `custom:${script.id}`
                          ? "bg-purple-900/50 text-purple-100 border-purple-600"
                          : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
                      )}
                      data-testid={`button-load-script-${script.id}`}
                    >
                      {script.name}
                    </button>
                    <button
                      onClick={() => {
                        setEditingScript(script);
                        setShowScriptBuilder(true);
                      }}
                      className="px-1.5 py-1.5 text-xs text-muted-foreground border-y border-transparent hover:bg-white/10 transition-colors"
                      title="Edit script"
                      data-testid={`button-edit-script-${script.id}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (scriptFilter === `custom:${script.id}`) {
                          setScriptFilter("all");
                        }
                        deleteCustomScript(script.id);
                      }}
                      className="px-1.5 py-1.5 rounded-r-full text-xs text-muted-foreground border-y border-r border-transparent hover:bg-red-900/30 hover:text-red-400 transition-colors"
                      title="Delete script"
                      data-testid={`button-delete-script-${script.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </>
            )}

            <button
              onClick={() => {
                setEditingScript(null);
                setShowScriptBuilder(true);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all border border-dashed border-purple-700/50 whitespace-nowrap flex items-center gap-1 text-purple-400 hover:bg-purple-900/20"
              data-testid="button-create-custom-script"
            >
              <Plus className="w-3 h-3" />
              New Script
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center justify-between">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'].map((f) => (
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
            
            <button
              onClick={() => setSortOrder(prev => {
                if (prev === "sheet") return "alphabetical";
                if (prev === "alphabetical") return "night";
                return "sheet";
              })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all border whitespace-nowrap",
                "bg-transparent text-muted-foreground border-amber-900/30 hover:bg-white/5"
              )}
              title={
                sortOrder === "sheet" ? "Sheet order (by team) - click for A-Z" :
                sortOrder === "alphabetical" ? "Alphabetical - click for Night order" :
                "Night order - click for Sheet order"
              }
              data-testid="button-toggle-sort"
            >
              {sortOrder === "sheet" ? (
                <>
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sheet</span>
                </>
              ) : sortOrder === "alphabetical" ? (
                <>
                  <ArrowDownAZ className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">A-Z</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Night</span>
                </>
              )}
            </button>
          </div>
        </div>

        <ScriptBuilderDialog
          open={showScriptBuilder}
          onOpenChange={setShowScriptBuilder}
          initialCharacters={editingScript ? new Set(editingScript.characterIds) : new Set()}
          initialName={editingScript?.name || ""}
          initialSynopsis={editingScript?.synopsis || ""}
          title={editingScript ? "Edit Custom Script" : "Create Custom Script"}
          editMode={!!editingScript}
          onSave={(name, characterIds, synopsis) => {
            if (editingScript) {
              updateCustomScript(editingScript.id, name, characterIds, synopsis);
            } else {
              const newScript = addCustomScript(name, characterIds, synopsis);
              setScriptFilter(`custom:${newScript.id}`);
            }
          }}
        />

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

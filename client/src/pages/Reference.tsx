import { Layout } from "@/components/ui/Layout";
import { ALL_CHARACTERS, getJinxesForCharacter, type Character, type Jinx } from "@/lib/game-data";
import { useState, useEffect } from "react";
import { Search, Moon, Sun, Settings, AlertTriangle, ChevronDown, Quote, Lightbulb, Sword, Eye, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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

function CustomScriptDialog({ 
  open, 
  onOpenChange, 
  selectedCharacters, 
  onSave 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  selectedCharacters: Set<string>;
  onSave: (characters: Set<string>) => void;
}) {
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(selectedCharacters));
  const [dialogTeamFilter, setDialogTeamFilter] = useState<string>("all");

  useEffect(() => {
    if (open) {
      setTempSelected(new Set(selectedCharacters));
    }
  }, [open, selectedCharacters]);

  const toggleCharacter = (charId: string) => {
    const newSet = new Set(tempSelected);
    if (newSet.has(charId)) {
      newSet.delete(charId);
    } else {
      newSet.add(charId);
    }
    setTempSelected(newSet);
  };

  const handleSave = () => {
    onSave(tempSelected);
    onOpenChange(false);
  };

  const handleSelectAll = () => {
    const filteredChars = ALL_CHARACTERS.filter(c => 
      dialogTeamFilter === "all" || c.team === dialogTeamFilter
    );
    const newSet = new Set(tempSelected);
    filteredChars.forEach(c => newSet.add(c.id));
    setTempSelected(newSet);
  };

  const handleClearAll = () => {
    if (dialogTeamFilter === "all") {
      setTempSelected(new Set());
    } else {
      const filteredChars = ALL_CHARACTERS.filter(c => c.team === dialogTeamFilter);
      const newSet = new Set(tempSelected);
      filteredChars.forEach(c => newSet.delete(c.id));
      setTempSelected(newSet);
    }
  };

  const filteredChars = ALL_CHARACTERS.filter(c => 
    dialogTeamFilter === "all" || c.team === dialogTeamFilter
  );

  const getTeamColor = (team: string) => {
    switch(team) {
      case 'townsfolk': return 'border-blue-900/50 bg-blue-950/30';
      case 'outsider': return 'border-blue-800/50 bg-blue-900/20';
      case 'minion': return 'border-red-900/50 bg-red-950/30';
      case 'demon': return 'border-red-800/50 bg-red-950/40';
      case 'traveler': return 'border-amber-900/50 bg-amber-950/30';
      default: return 'border-gray-800 bg-gray-900/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-amber-500">
            Select Characters for Custom Script
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-wrap gap-2 py-2">
          {['all', 'townsfolk', 'outsider', 'minion', 'demon', 'traveler'].map((f) => (
            <button
              key={f}
              onClick={() => setDialogTeamFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                dialogTeamFilter === f 
                  ? "bg-amber-900/50 text-amber-100 border-amber-600" 
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
              )}
              data-testid={`dialog-filter-${f}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pb-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll} data-testid="button-select-all">
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} data-testid="button-clear-all">
            Clear {dialogTeamFilter !== "all" ? dialogTeamFilter : "All"}
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">
            {tempSelected.size} selected
          </span>
        </div>

        <div className="flex-1 min-h-0 max-h-[40vh] md:max-h-[50vh] overflow-y-auto border border-amber-900/30 rounded-lg p-2 touch-pan-y">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredChars.map((char) => (
              <button
                key={char.id}
                onClick={() => toggleCharacter(char.id)}
                className={cn(
                  "p-2 rounded-lg border text-left transition-all",
                  getTeamColor(char.team),
                  tempSelected.has(char.id) 
                    ? "ring-2 ring-amber-500" 
                    : "opacity-60 hover:opacity-100"
                )}
                data-testid={`select-character-${char.id}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold truncate">{char.name}</span>
                  {tempSelected.has(char.id) && (
                    <Check className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] uppercase opacity-60">{char.team}</span>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-custom">
            Save Custom Script
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Reference() {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [scriptFilter, setScriptFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customCharacters, setCustomCharacters] = useState<Set<string>>(new Set());

  const filtered = ALL_CHARACTERS.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) || 
                          char.ability.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === "all" || char.team === teamFilter;
    
    let matchesScript = true;
    if (scriptFilter === "custom") {
      matchesScript = customCharacters.has(char.id);
    } else if (scriptFilter !== "all") {
      matchesScript = char.edition === scriptFilter;
    }
    
    return matchesSearch && matchesTeam && matchesScript;
  });

  const handleToggle = (charId: string) => {
    setExpandedId(prev => prev === charId ? null : charId);
  };

  const handleCustomClick = () => {
    if (scriptFilter === "custom") {
      setCustomDialogOpen(true);
    } else {
      setScriptFilter("custom");
      if (customCharacters.size === 0) {
        setCustomDialogOpen(true);
      }
    }
  };

  const handleResetCustom = () => {
    setCustomCharacters(new Set());
    setCustomDialogOpen(true);
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
            
            <button
              onClick={handleCustomClick}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap flex items-center gap-1",
                scriptFilter === "custom" 
                  ? "bg-purple-900/50 text-purple-100 border-purple-600" 
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
              )}
              data-testid="button-script-custom"
            >
              Custom {customCharacters.size > 0 && `(${customCharacters.size})`}
            </button>

            {scriptFilter === "custom" && customCharacters.size > 0 && (
              <button
                onClick={handleResetCustom}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-white/10 transition-colors"
                title="Reset custom script"
                data-testid="button-reset-custom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
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

        <CustomScriptDialog
          open={customDialogOpen}
          onOpenChange={setCustomDialogOpen}
          selectedCharacters={customCharacters}
          onSave={setCustomCharacters}
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

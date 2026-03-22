import { useState, useMemo, useEffect, useCallback } from "react";
import { getCharacterById, OFFICIAL_SCRIPTS, type Character } from "@/lib/game-data";
import { getBreakdown } from "@/hooks/use-player-game";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Scroll, BookOpen, Users, Lock, Shuffle, Trash2, Check, Plus, Pencil, FileText, Moon, Sun, ChevronDown, Lightbulb, Power, XCircle } from "lucide-react";

const TEAM_COLORS: Record<string, string> = {
  townsfolk: "bg-blue-900/60 text-blue-200 border-blue-700",
  outsider: "bg-teal-900/60 text-teal-200 border-teal-700",
  minion: "bg-orange-900/60 text-orange-200 border-orange-700",
  demon: "bg-red-900/60 text-red-200 border-red-700",
};

const TEAM_ORDER = ['townsfolk', 'outsider', 'minion', 'demon'] as const;

const TEAM_LABELS: Record<string, string> = {
  townsfolk: 'Townsfolk',
  outsider: 'Outsiders',
  minion: 'Minions',
  demon: 'Demons',
};

export const ST_STORAGE_KEY = "clocktower_st_session";

interface STSession {
  playerCount: number;
  scriptId: string;
  scriptName: string;
  scriptCharacterIds: string[];
  bagIds: string[];
  activeIds: string[];
  synopsis?: string;
}

export function getStoredSTSession(): STSession | null {
  try {
    const stored = localStorage.getItem(ST_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (
      parsed &&
      typeof parsed.playerCount === 'number' &&
      typeof parsed.scriptId === 'string' &&
      typeof parsed.scriptName === 'string' &&
      Array.isArray(parsed.scriptCharacterIds) &&
      Array.isArray(parsed.bagIds) &&
      Array.isArray(parsed.activeIds)
    ) {
      return parsed as STSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSTSession() {
  localStorage.removeItem(ST_STORAGE_KEY);
}

function NightRow({ char, index, prefix, isExpanded, onToggle, isInBag, isActive, onToggleActive }: {
  char: Character;
  index: number;
  prefix: string;
  isExpanded: boolean;
  onToggle: () => void;
  isInBag: boolean;
  isActive: boolean;
  onToggleActive: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        !isActive && "opacity-40",
        isActive && isInBag && "border-amber-700/50 bg-card",
        isActive && !isInBag && "border-border/50 bg-card/50 border-dashed",
        !isActive && "border-border/30 bg-card/30",
        isExpanded && isActive && "ring-1 ring-amber-600/30"
      )}
      data-testid={`night-row-${prefix}-${char.id}`}
    >
      <div className="flex items-start">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
          className={cn(
            "shrink-0 flex items-center justify-center w-10 self-stretch rounded-l-lg transition-colors",
            isActive ? "hover:bg-green-900/20" : "hover:bg-red-900/20"
          )}
          data-testid={`button-toggle-active-${prefix}-${char.id}`}
          title={isActive ? "Mark inactive" : "Mark active"}
        >
          <Power className={cn(
            "w-3.5 h-3.5 transition-colors",
            isActive ? "text-green-500" : "text-red-500/60"
          )} />
        </button>

        <button
          onClick={onToggle}
          className="flex-1 text-left flex items-start gap-3 p-3 min-w-0"
          data-testid={`button-expand-${prefix}-${char.id}`}
        >
          <span className="text-xs text-muted-foreground font-mono w-5 text-right shrink-0 mt-0.5">{index + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium text-sm", !isActive && "line-through")}>{char.name}</span>
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", TEAM_COLORS[char.team])}>
                {char.team}
              </Badge>
              {isInBag && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="In bag" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{char.ability}</p>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 shrink-0 text-muted-foreground transition-transform mt-0.5",
            isExpanded && "rotate-180"
          )} />
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 ml-10">
          <div className="border-t border-border/50 pt-3" />

          {char.howToRun && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-purple-400" /> How to Run
              </h4>
              <div className="text-xs bg-purple-950/30 border border-purple-900/30 rounded-lg p-2">
                <div className="space-y-1.5 opacity-90 leading-relaxed">
                  {char.howToRun.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph.replace(/\n/g, ' ')}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {char.tipsAndTricks && char.tipsAndTricks.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3 text-yellow-400" /> Tips & Tricks
              </h4>
              <ul className="text-xs space-y-1 opacity-90">
                {char.tipsAndTricks.map((tip, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-yellow-500/70 shrink-0">-</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {char.reminders.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">Reminders</h4>
              <div className="flex flex-wrap gap-1.5">
                {char.reminders.map((reminder, idx) => (
                  <span key={idx} className="text-xs bg-black/40 px-2 py-0.5 rounded-full border border-current/20">
                    {reminder}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface STWizardProps {
  playerCount: number;
  onBack: () => void;
}

function countPlayableCharacters(characterIds: string[]): number {
  return characterIds.filter(id => {
    const c = getCharacterById(id);
    return c && c.team !== 'traveler' && c.team !== 'fabled';
  }).length;
}

export function STWizard({ playerCount, onBack }: STWizardProps) {
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [selectedScript, setSelectedScript] = useState<LocalScript | null>(null);
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [bagIds, setBagIds] = useState<Set<string>>(new Set());
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [expandedCharId, setExpandedCharId] = useState<string | null>(null);
  const [synopsisOpen, setSynopsisOpen] = useState(false);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [restoredPlayerCount, setRestoredPlayerCount] = useState<number | null>(null);
  const { allScripts, customScripts, addCustomScript, updateCustomScript } = useLocalScripts();

  useEffect(() => {
    const session = getStoredSTSession();
    if (session) {
      setSelectedScript({
        id: session.scriptId,
        name: session.scriptName,
        characterIds: session.scriptCharacterIds,
        isOfficial: false,
        synopsis: session.synopsis,
      });
      setBagIds(new Set(session.bagIds));
      setActiveIds(new Set(session.activeIds));
      setLockedIds(new Set(session.bagIds));
      setRestoredPlayerCount(session.playerCount);
      setStep(4);
    }
  }, []);

  const effectivePlayerCount = restoredPlayerCount ?? playerCount;

  const breakdown = getBreakdown(effectivePlayerCount);

  const scriptCharacters = useMemo(() => {
    if (!selectedScript) return [];
    return selectedScript.characterIds
      .map(id => getCharacterById(id))
      .filter((c): c is Character => !!c && c.team !== 'traveler' && c.team !== 'fabled');
  }, [selectedScript]);

  const charactersByTeam = useMemo(() => {
    const grouped: Record<string, Character[]> = {
      townsfolk: [],
      outsider: [],
      minion: [],
      demon: [],
    };
    for (const char of scriptCharacters) {
      if (grouped[char.team]) {
        grouped[char.team].push(char);
      }
    }
    return grouped;
  }, [scriptCharacters]);

  const tally = useMemo(() => {
    const counts = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
    lockedIds.forEach(id => {
      const char = getCharacterById(id);
      if (char && counts[char.team as keyof typeof counts] !== undefined) {
        counts[char.team as keyof typeof counts]++;
      }
    });
    return counts;
  }, [lockedIds]);

  const required = useMemo(() => ({
    townsfolk: breakdown.townsfolk,
    outsider: breakdown.outsiders,
    minion: breakdown.minions,
    demon: breakdown.demons,
  }), [breakdown]);

  const isExactMatch = TEAM_ORDER.every(t => tally[t] === required[t]);

  const firstNightChars = useMemo(() => {
    return scriptCharacters
      .filter(c => c.firstNightOrder !== null)
      .sort((a, b) => (a.firstNightOrder ?? 0) - (b.firstNightOrder ?? 0));
  }, [scriptCharacters]);

  const otherNightChars = useMemo(() => {
    return scriptCharacters
      .filter(c => c.otherNightOrder !== null)
      .sort((a, b) => (a.otherNightOrder ?? 0) - (b.otherNightOrder ?? 0));
  }, [scriptCharacters]);

  const toggleActive = useCallback((id: string) => {
    setActiveIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        const stored = localStorage.getItem(ST_STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored) as STSession;
          session.activeIds = Array.from(next);
          localStorage.setItem(ST_STORAGE_KEY, JSON.stringify(session));
        }
      } catch {}
      return next;
    });
  }, []);

  const toggleLock = (id: string) => {
    setLockedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const shuffleBag = () => {
    const lockedArr = Array.from(lockedIds);
    const newBag = new Set(lockedArr);

    for (const team of TEAM_ORDER) {
      const lockedCount = lockedArr.filter(id => {
        const c = getCharacterById(id);
        return c?.team === team;
      }).length;
      const needed = required[team] - lockedCount;
      if (needed <= 0) continue;

      const available = charactersByTeam[team].filter(c => !lockedIds.has(c.id));
      const shuffled = Array.from(available).sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(needed, shuffled.length); i++) {
        newBag.add(shuffled[i].id);
      }
    }

    setLockedIds(newBag);
  };

  const clearAll = () => {
    setLockedIds(new Set());
  };

  const handleAcceptBag = () => {
    if (!selectedScript || !isExactMatch) return;
    const newBagIds = new Set(lockedIds);
    const newActiveIds = new Set(lockedIds);
    setBagIds(newBagIds);
    setActiveIds(newActiveIds);
    setExpandedCharId(null);
    setSynopsisOpen(false);
    setStep(4);

    const session: STSession = {
      playerCount: effectivePlayerCount,
      scriptId: selectedScript.id,
      scriptName: selectedScript.name,
      scriptCharacterIds: selectedScript.characterIds,
      bagIds: Array.from(newBagIds),
      activeIds: Array.from(newActiveIds),
      synopsis: selectedScript.synopsis,
    };
    localStorage.setItem(ST_STORAGE_KEY, JSON.stringify(session));
  };

  const handleEndSession = () => {
    clearSTSession();
    setBagIds(new Set());
    setActiveIds(new Set());
    setLockedIds(new Set());
    setSelectedScript(null);
    setRestoredPlayerCount(null);
    setStep(2);
  };

  const handleSelectScript = (script: LocalScript) => {
    setSelectedScript(script);
    setLockedIds(new Set());
  };

  const handleScriptNext = () => {
    if (!selectedScript) return;
    setStep(3);
  };

  if (step === 4 && selectedScript) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <Card className="p-4 md:p-6">
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display text-amber-100">Night Sheet</h2>
              <p className="text-muted-foreground text-sm">{selectedScript.name} · {countPlayableCharacters(selectedScript.characterIds)} characters</p>
            </div>

            {(() => {
              const officialScript = OFFICIAL_SCRIPTS.find(s => s.id === selectedScript.id);
              const synopsis = (officialScript && 'synopsis' in officialScript ? (officialScript as { synopsis?: string }).synopsis : null) || selectedScript.synopsis || null;
              if (!synopsis) return null;
              return (
                <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 overflow-hidden">
                  <button
                    onClick={() => setSynopsisOpen(!synopsisOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-amber-950/30 transition-colors"
                    data-testid="button-toggle-synopsis"
                  >
                    <span className="text-sm text-amber-200/80 font-medium">{selectedScript.name}</span>
                    <span className="flex items-center gap-1 text-xs text-amber-400/60">
                      {synopsisOpen ? 'Hide' : 'Read synopsis'}
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", synopsisOpen && "rotate-180")} />
                    </span>
                  </button>
                  {synopsisOpen && (
                    <div className="px-3 pb-3 pt-1 border-t border-amber-900/20">
                      {synopsis.split('\n\n').map((para, i) => (
                        <p key={i} className={cn("text-sm italic text-amber-100/60 leading-relaxed", i > 0 && "mt-3")}>{para}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <Tabs defaultValue="first" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="first" data-testid="tab-first-night">
                  <Moon className="w-3.5 h-3.5 mr-1.5" /> First Night
                </TabsTrigger>
                <TabsTrigger value="other" data-testid="tab-other-nights">
                  <Sun className="w-3.5 h-3.5 mr-1.5" /> Other Nights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="first">
                <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
                  {firstNightChars.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">No characters act on the first night.</p>
                  ) : (
                    <div className="space-y-1 pr-2">
                      {firstNightChars.map((char, i) => (
                        <NightRow
                          key={char.id}
                          char={char}
                          index={i}
                          prefix="first"
                          isExpanded={expandedCharId === `first-${char.id}`}
                          onToggle={() => setExpandedCharId(expandedCharId === `first-${char.id}` ? null : `first-${char.id}`)}
                          isInBag={bagIds.has(char.id)}
                          isActive={activeIds.has(char.id)}
                          onToggleActive={() => toggleActive(char.id)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="other">
                <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
                  {otherNightChars.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">No characters act on other nights.</p>
                  ) : (
                    <div className="space-y-1 pr-2">
                      {otherNightChars.map((char, i) => (
                        <NightRow
                          key={char.id}
                          char={char}
                          index={i}
                          prefix="other"
                          isExpanded={expandedCharId === `other-${char.id}`}
                          onToggle={() => setExpandedCharId(expandedCharId === `other-${char.id}` ? null : `other-${char.id}`)}
                          isInBag={bagIds.has(char.id)}
                          isActive={activeIds.has(char.id)}
                          onToggleActive={() => toggleActive(char.id)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(3)} data-testid="button-st-back-night">
                <ChevronLeft className="w-4 h-4 mr-1" /> Bag
              </Button>
              <Button
                variant="outline"
                className="text-red-400 border-red-900/50 hover:bg-red-950/30 hover:text-red-300"
                onClick={handleEndSession}
                data-testid="button-end-session"
              >
                <XCircle className="w-4 h-4 mr-1.5" /> End Session
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-display text-amber-500 mb-2 text-center">Storyteller Setup</h1>
      <p className="text-center text-muted-foreground text-sm mb-6">{effectivePlayerCount} players</p>

      <div className="flex items-center justify-center mb-8 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors",
              (i === 1 || step >= (i + 1)) ? "bg-amber-600 border-amber-600 text-black" :
              "bg-transparent border-muted text-muted-foreground"
            )}>
              {(i === 1 || step > (i + 1)) ? <Check className="w-4 h-4" /> : i}
            </div>
            {i < 3 && <div className={cn("w-6 sm:w-10 h-0.5 mx-1 sm:mx-2", step > (i + 1) ? "bg-amber-800" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <Card className="p-6 md:p-8">
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <Scroll className="w-12 h-12 mx-auto text-amber-500 mb-4" />
              <h2 className="text-2xl font-display text-amber-100">Select Script</h2>
              <p className="text-muted-foreground text-sm">Choose a script to build the character bag from</p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              <div className="pt-2 pb-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Official Scripts</span>
              </div>
              {allScripts.filter(s => s.isOfficial && !s.isCommunity).map(script => (
                <button
                  key={script.id}
                  onClick={() => handleSelectScript(script)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    selectedScript?.id === script.id
                      ? "bg-amber-900/30 border-amber-600 ring-1 ring-amber-500/50"
                      : "bg-card border-border hover:bg-muted/30"
                  )}
                  data-testid={`button-st-script-${script.id}`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-amber-500/70" />
                    <div>
                      <div className="font-medium">{script.name}</div>
                      <div className="text-sm text-muted-foreground">{countPlayableCharacters(script.characterIds)} characters</div>
                    </div>
                  </div>
                </button>
              ))}

              <div className="pt-2 pb-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Community Scripts</span>
              </div>
              {allScripts.filter(s => s.isOfficial && s.isCommunity).map(script => (
                <button
                  key={script.id}
                  onClick={() => handleSelectScript(script)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    selectedScript?.id === script.id
                      ? "bg-teal-900/30 border-teal-600 ring-1 ring-teal-500/50"
                      : "bg-card border-border hover:bg-muted/30"
                  )}
                  data-testid={`button-st-script-${script.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-teal-500/70" />
                    <div>
                      <div className="font-medium">{script.name}</div>
                      <div className="text-sm text-muted-foreground">{countPlayableCharacters(script.characterIds)} characters</div>
                    </div>
                  </div>
                </button>
              ))}

              <div className="pt-2 pb-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Custom Scripts</span>
              </div>
              {customScripts.map(script => (
                <div
                  key={script.id}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors flex items-center gap-2",
                    selectedScript?.id === script.id
                      ? "bg-purple-900/30 border-purple-600 ring-1 ring-purple-500/50"
                      : "bg-card border-border"
                  )}
                >
                  <button
                    onClick={() => handleSelectScript(script)}
                    className="flex-1 flex items-center gap-3 hover:bg-muted/30 rounded-lg -m-2 p-2"
                    data-testid={`button-st-script-${script.id}`}
                  >
                    <FileText className="w-5 h-5 text-purple-500/70" />
                    <div>
                      <div className="font-medium">{script.name}</div>
                      <div className="text-sm text-muted-foreground">{countPlayableCharacters(script.characterIds)} characters</div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingScript(script);
                      setShowScriptBuilder(true);
                    }}
                    data-testid={`button-edit-st-script-${script.id}`}
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <button
                onClick={() => {
                  setEditingScript(null);
                  setShowScriptBuilder(true);
                }}
                className="w-full text-left p-4 rounded-lg border border-dashed border-purple-700/50 hover:bg-muted/30 transition-colors flex items-center gap-3"
                data-testid="button-st-create-custom-script"
              >
                <Plus className="w-5 h-5 text-purple-500/70" />
                <div className="font-medium text-purple-400">Create Custom Script</div>
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={onBack} data-testid="button-st-back">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleScriptNext} disabled={!selectedScript} data-testid="button-st-next">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && selectedScript && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display text-amber-100">Build the Bag</h2>
              <p className="text-muted-foreground text-sm">{selectedScript.name} · {effectivePlayerCount} players</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2" data-testid="st-tally">
              {TEAM_ORDER.map(team => {
                const status = tally[team] === required[team] ? 'exact' :
                  tally[team] > required[team] ? 'over' : 'under';
                return (
                  <Badge
                    key={team}
                    variant="secondary"
                    className={cn(
                      "text-xs transition-colors",
                      status === 'exact' && "bg-green-900/50 text-green-300 border-green-600",
                      status === 'over' && "bg-red-900/50 text-red-300 border-red-600",
                      status === 'under' && TEAM_COLORS[team],
                    )}
                    data-testid={`tally-${team}`}
                  >
                    {tally[team]}/{required[team]} {TEAM_LABELS[team]}
                  </Badge>
                );
              })}
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={shuffleBag} data-testid="button-shuffle">
                <Shuffle className="w-3.5 h-3.5 mr-1.5" /> {lockedIds.size > 0 ? 'Reshuffle' : 'Shuffle'}
              </Button>
              <Button size="sm" variant="outline" onClick={clearAll} data-testid="button-clear-locks">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear All
              </Button>
            </div>

            <ScrollArea className="h-[350px] md:h-[400px] pr-2">
              <div className="space-y-5">
                {TEAM_ORDER.map(team => (
                  <div key={team}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{TEAM_LABELS[team]}</span>
                      <span className={cn(
                        "text-xs",
                        tally[team] === required[team] ? "text-green-400" :
                        tally[team] > required[team] ? "text-red-400" : "text-muted-foreground"
                      )}>
                        ({tally[team]}/{required[team]})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {charactersByTeam[team].map(char => {
                        const isLocked = lockedIds.has(char.id);
                        return (
                          <button
                            key={char.id}
                            onClick={() => toggleLock(char.id)}
                            className={cn(
                              "text-left p-3 rounded-lg border transition-all relative group",
                              isLocked && "ring-2 ring-amber-500/70 border-amber-600 bg-amber-900/20",
                              !isLocked && "border-border bg-card hover:bg-muted/30",
                            )}
                            data-testid={`card-char-${char.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{char.name}</div>
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{char.ability}</div>
                              </div>
                              {isLocked && (
                                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)} data-testid="button-st-back-bag">
                <ChevronLeft className="w-4 h-4 mr-1" /> Script
              </Button>
              <Button onClick={handleAcceptBag} disabled={!isExactMatch} data-testid="button-accept-bag">
                <Check className="w-4 h-4 mr-2" /> Accept Bag
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ScriptBuilderDialog
        open={showScriptBuilder}
        onOpenChange={(open) => {
          setShowScriptBuilder(open);
          if (!open) setEditingScript(null);
        }}
        initialCharacters={editingScript ? new Set(editingScript.characterIds) : new Set()}
        initialName={editingScript?.name || ""}
        initialSynopsis={editingScript?.synopsis || ""}
        title={editingScript ? "Edit Custom Script" : "Create Custom Script"}
        editMode={!!editingScript}
        onSave={(name, characterIds, synopsis) => {
          if (editingScript) {
            updateCustomScript(editingScript.id, name, characterIds, synopsis);
            if (selectedScript?.id === editingScript.id) {
              setSelectedScript({ ...selectedScript, name, characterIds, synopsis });
              setLockedIds(new Set());
            }
          } else {
            const newScript = addCustomScript(name, characterIds, synopsis);
            setSelectedScript(newScript);
          }
        }}
      />
    </div>
  );
}

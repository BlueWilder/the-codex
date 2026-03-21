import { useState, useMemo } from "react";
import { ALL_CHARACTERS, getCharacterById, type Character } from "@/lib/game-data";
import { getBreakdown, type GameScriptRef } from "@/hooks/use-player-game";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Scroll, BookOpen, Users, Lock, Unlock, Shuffle, Trash2, Check, Plus, Pencil, FileText } from "lucide-react";

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

interface STWizardProps {
  playerCount: number;
  onBack: () => void;
  onComplete: (bag: string[], scriptRef: GameScriptRef) => void;
}

export function STWizard({ playerCount, onBack, onComplete }: STWizardProps) {
  const [step, setStep] = useState<2 | 3>(2);
  const [selectedScript, setSelectedScript] = useState<LocalScript | null>(null);
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const { allScripts, customScripts, addCustomScript, updateCustomScript } = useLocalScripts();

  const breakdown = getBreakdown(playerCount);

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
    selectedIds.forEach(id => {
      const char = getCharacterById(id);
      if (char && counts[char.team as keyof typeof counts] !== undefined) {
        counts[char.team as keyof typeof counts]++;
      }
    });
    return counts;
  }, [selectedIds]);

  const required = useMemo(() => ({
    townsfolk: breakdown.townsfolk,
    outsider: breakdown.outsiders,
    minion: breakdown.minions,
    demon: breakdown.demons,
  }), [breakdown]);

  const isExactMatch = TEAM_ORDER.every(t => tally[t] === required[t]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setLockedIds(locks => {
          const nl = new Set(locks);
          nl.delete(id);
          return nl;
        });
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedIds.has(id)) return;
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
    const newSelected = new Set(lockedArr);

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
        newSelected.add(shuffled[i].id);
      }
    }

    setSelectedIds(newSelected);
  };

  const clearAll = () => {
    setLockedIds(new Set());
    setSelectedIds(new Set());
  };

  const handleAcceptBag = () => {
    if (!selectedScript || !isExactMatch) return;
    const scriptRef: GameScriptRef = { id: selectedScript.id };
    onComplete(Array.from(selectedIds), scriptRef);
  };

  const handleSelectScript = (script: LocalScript) => {
    setSelectedScript(script);
    setLockedIds(new Set());
    setSelectedIds(new Set());
  };

  const handleScriptNext = () => {
    if (!selectedScript) return;
    setStep(3);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-display text-amber-500 mb-2 text-center">Storyteller Setup</h1>
      <p className="text-center text-muted-foreground text-sm mb-6">{playerCount} players</p>

      <div className="flex items-center justify-center mb-8 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors",
              (i === 1 || step >= i) ? "bg-amber-600 border-amber-600 text-black" :
              "bg-transparent border-muted text-muted-foreground"
            )}>
              {i === 1 ? <Check className="w-4 h-4" /> : i}
            </div>
            {i < 3 && <div className={cn("w-8 sm:w-12 h-0.5 mx-1 sm:mx-2", step >= (i + 1) ? "bg-amber-800" : "bg-muted")} />}
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
                      <div className="text-sm text-muted-foreground">{script.characterIds.length} characters</div>
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
                      <div className="text-sm text-muted-foreground">{script.characterIds.length} characters</div>
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
                      <div className="text-sm text-muted-foreground">{script.characterIds.length} characters</div>
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
              <p className="text-muted-foreground text-sm">{selectedScript.name} · {playerCount} players</p>
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
                <Shuffle className="w-3.5 h-3.5 mr-1.5" /> {selectedIds.size > 0 ? 'Reshuffle' : 'Shuffle'}
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
                        const isSelected = selectedIds.has(char.id);
                        const isLocked = lockedIds.has(char.id);
                        return (
                          <button
                            key={char.id}
                            onClick={() => toggleSelect(char.id)}
                            className={cn(
                              "text-left p-3 rounded-lg border transition-all relative group",
                              isSelected && isLocked && "ring-2 ring-amber-500/70 border-amber-600 bg-amber-900/20",
                              isSelected && !isLocked && "border-amber-600/50 bg-amber-900/10",
                              !isSelected && "border-border bg-card hover:bg-muted/30",
                            )}
                            data-testid={`card-char-${char.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{char.name}</div>
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{char.ability}</div>
                              </div>
                              {isSelected && (
                                <button
                                  onClick={(e) => toggleLock(char.id, e)}
                                  className={cn(
                                    "shrink-0 p-1 rounded transition-colors",
                                    isLocked ? "text-amber-400 hover:text-amber-300" : "text-muted-foreground hover:text-amber-400"
                                  )}
                                  data-testid={`button-lock-${char.id}`}
                                >
                                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 left-1">
                                <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-black" />
                                </div>
                              </div>
                            )}
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
        title={editingScript ? "Edit Custom Script" : "Create Custom Script"}
        editMode={!!editingScript}
        onSave={(name, characterIds) => {
          if (editingScript) {
            updateCustomScript(editingScript.id, name, characterIds);
            if (selectedScript?.id === editingScript.id) {
              setSelectedScript({ ...selectedScript, name, characterIds });
              setLockedIds(new Set());
              setSelectedIds(new Set());
            }
          } else {
            const newScript = addCustomScript(name, characterIds);
            setSelectedScript(newScript);
          }
        }}
      />
    </div>
  );
}

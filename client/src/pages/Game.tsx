import { Layout } from "@/components/ui/Layout";
import { useState, useMemo, useEffect } from "react";
import { usePlayerGame, getBreakdown, isPlayerActive, canPlayerVote, canPlayerVoteOnExile, type GamePlayer, type Nomination, type PlayerVote, type GameScriptRef, type ExileVote, type PlayerStatus, type NominationResult } from "@/hooks/use-player-game";
import { ALL_CHARACTERS, OFFICIAL_SCRIPTS } from "@/lib/game-data";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { InlineGameLog } from "@/components/InlineGameLog";
import { Users, ChevronRight, ChevronLeft, Play, Skull, X, Plus, Check, Hand, Search, Sun, Moon, ChevronUp, ChevronDown, FileText, Theater, Vote, Loader2, Ghost, GripVertical, UserPlus, ArrowRight, Target, Scale, Scroll, BookOpen, HandMetal, Ban, LogOut, Trash2, List, Circle, Pencil, MoreVertical, RotateCcw, Info, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TEAM_COLORS: Record<string, string> = {
  townsfolk: "bg-blue-900/60 text-blue-200 border-blue-700",
  outsider: "bg-teal-900/60 text-teal-200 border-teal-700",
  minion: "bg-orange-900/60 text-orange-200 border-orange-700",
  demon: "bg-red-900/60 text-red-200 border-red-700",
  traveler: "bg-purple-900/60 text-purple-200 border-purple-700",
};

function GallowsIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 22V4" />
      <path d="M4 4h10" />
      <path d="M4 8l3-4" />
      <path d="M14 4v3" />
      <circle cx="14" cy="10" r="3" />
    </svg>
  );
}

function PointingFingerIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
    >
      <rect x="10" y="9" width="12" height="4" rx="2" />
      <rect x="2" y="7" width="10" height="8" rx="2" />
      <rect x="3" y="15" width="3" height="4" rx="1" />
      <rect x="6" y="15" width="3" height="4" rx="1" />
      <rect x="9" y="15" width="3" height="3" rx="1" />
    </svg>
  );
}

function SetupWizard({ onStart }: { onStart: (count: number, names: string[], script?: GameScriptRef | null) => void }) {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(8);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [selectedScript, setSelectedScript] = useState<LocalScript | null>(null);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const { allScripts, customScripts, addCustomScript, updateCustomScript, getScriptById } = useLocalScripts();

  const breakdown = getBreakdown(playerCount);

  const handleCountConfirm = () => {
    // Initialize with empty strings - placeholder text shows default names
    setPlayerNames(Array(playerCount).fill(""));
    setStep(2);
  };
  
  const getDefaultName = (index: number) => {
    if (playerCount > 15 && index >= 15) {
      return `Traveler ${index - 14}`;
    }
    return `Player ${index + 1}`;
  };

  const handleNameChange = (index: number, name: string) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  };

  const handleStartGame = () => {
    const scriptRef: GameScriptRef | null = selectedScript ? {
      id: selectedScript.id,
    } : null;
    // Use default names for any empty inputs
    const finalNames = playerNames.map((name, i) => name.trim() || getDefaultName(i));
    onStart(playerCount, finalNames, scriptRef);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-display text-amber-500 mb-8 text-center">New Game</h1>

      <div className="flex items-center justify-center mb-8 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors",
              step === i ? "bg-amber-600 border-amber-600 text-black" :
              step > i ? "bg-amber-900/40 border-amber-600 text-amber-500" :
              "bg-transparent border-muted text-muted-foreground"
            )}>
              {i}
            </div>
            {i < 3 && <div className={cn("w-8 sm:w-12 h-0.5 mx-1 sm:mx-2", step > i ? "bg-amber-800" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <Card className="p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <Users className="w-12 h-12 mx-auto text-amber-500 mb-4" />
              <h2 className="text-2xl font-display text-amber-100">How many players?</h2>
              <p className="text-muted-foreground text-sm">Select the number of players in your game</p>
            </div>

            <div className="flex items-center justify-center gap-6 py-4">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setPlayerCount(Math.max(5, playerCount - 1))}
                data-testid="button-decrease-players"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
              <div className="text-5xl md:text-6xl font-display text-amber-100 w-20 text-center" data-testid="text-player-count">
                {playerCount}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                data-testid="button-increase-players"
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg text-center space-y-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Character Breakdown</p>
              <div className="flex flex-wrap justify-center gap-2" data-testid="text-breakdown">
                <Badge variant="secondary" className="bg-blue-900/40 text-blue-300 border-blue-700">
                  {breakdown.townsfolk} Townsfolk
                </Badge>
                <Badge variant="secondary" className="bg-teal-900/40 text-teal-300 border-teal-700">
                  {breakdown.outsiders} Outsiders
                </Badge>
                <Badge variant="secondary" className="bg-orange-900/40 text-orange-300 border-orange-700">
                  {breakdown.minions} Minions
                </Badge>
                <Badge variant="secondary" className="bg-red-900/40 text-red-300 border-red-700">
                  {breakdown.demons} Demon
                </Badge>
                {'travelers' in breakdown && breakdown.travelers > 0 && (
                  <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 border-purple-700">
                    + {breakdown.travelers} {breakdown.travelers === 1 ? 'Traveler' : 'Travelers'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCountConfirm} data-testid="button-next-step">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display text-amber-100">Player Names</h2>
              <p className="text-muted-foreground text-sm">Enter names or leave defaults</p>
            </div>

            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
              {playerNames.map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm w-6 text-right">{i + 1}.</span>
                  <Input
                    value={name}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={getDefaultName(i)}
                    data-testid={`input-player-name-${i}`}
                    className={playerCount > 15 && i >= 15 ? "border-purple-700/50" : ""}
                  />
                  {playerCount > 15 && i >= 15 && (
                    <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 border-purple-700 shrink-0">
                      Traveler
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} data-testid="button-back">
                Back
              </Button>
              <Button onClick={() => setStep(3)} data-testid="button-next-step-2">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <Scroll className="w-12 h-12 mx-auto text-amber-500 mb-4" />
              <h2 className="text-2xl font-display text-amber-100">Select Script</h2>
              <p className="text-muted-foreground text-sm">Optional: Choose a script to filter character claims</p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              <button
                onClick={() => setSelectedScript(null)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-colors",
                  !selectedScript 
                    ? "bg-amber-900/30 border-amber-600 ring-1 ring-amber-500/50" 
                    : "bg-card border-border hover-elevate"
                )}
                data-testid="button-no-script"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">All Characters</div>
                    <div className="text-sm text-muted-foreground">No script filter - show all characters when claiming</div>
                  </div>
                </div>
              </button>

              <div className="pt-2 pb-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Official Scripts</span>
              </div>

              {allScripts.filter(s => s.isOfficial).map(script => (
                <button
                  key={script.id}
                  onClick={() => setSelectedScript(script)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    selectedScript?.id === script.id
                      ? "bg-amber-900/30 border-amber-600 ring-1 ring-amber-500/50" 
                      : "bg-card border-border hover-elevate"
                  )}
                  data-testid={`button-script-${script.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Scroll className="w-5 h-5 text-amber-500/70" />
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
                    onClick={() => setSelectedScript(script)}
                    className="flex-1 flex items-center gap-3 hover-elevate rounded-lg -m-2 p-2"
                    data-testid={`button-script-${script.id}`}
                  >
                    <Scroll className="w-5 h-5 text-purple-500/70" />
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
                    data-testid={`button-edit-script-${script.id}`}
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
                className="w-full text-left p-4 rounded-lg border border-dashed border-purple-700/50 hover-elevate transition-colors flex items-center gap-3"
                data-testid="button-create-custom-script"
              >
                <Plus className="w-5 h-5 text-purple-500/70" />
                <div className="font-medium text-purple-400">Create Custom Script</div>
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)} data-testid="button-back-2">
                Back
              </Button>
              <Button onClick={handleStartGame} data-testid="button-start-game">
                <Play className="w-4 h-4 mr-2" /> Start Game
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ScriptBuilderDialog
        open={showScriptBuilder}
        onOpenChange={setShowScriptBuilder}
        initialCharacters={editingScript ? new Set(editingScript.characterIds) : new Set()}
        initialName={editingScript?.name || ""}
        title={editingScript ? "Edit Custom Script" : "Create Custom Script"}
        editMode={!!editingScript}
        onSave={(name, characterIds) => {
          if (editingScript) {
            updateCustomScript(editingScript.id, name, characterIds);
            const updated = getScriptById(editingScript.id);
            if (updated) setSelectedScript(updated);
          } else {
            const newScript = addCustomScript(name, characterIds);
            setSelectedScript(newScript);
          }
        }}
      />
    </div>
  );
}

function CharacterPicker({ 
  open, 
  onClose, 
  onSelect,
  excludeIds = [],
  scriptCharacterIds,
}: { 
  open: boolean; 
  onClose: () => void; 
  onSelect: (characterIds: string[]) => void;
  excludeIds?: string[];
  scriptCharacterIds?: string[] | null;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredCharacters = useMemo(() => {
    const term = search.toLowerCase();
    const getTeamOrder = (team: string) => {
      switch (team) {
        case 'townsfolk': return 0;
        case 'outsider': return 1;
        case 'minion': return 2;
        case 'demon': return 3;
        case 'traveler': return 4;
        default: return 5;
      }
    };
    return ALL_CHARACTERS.filter(c => {
      if (excludeIds.includes(c.id)) return false;
      // Exclude Travelers from claims - they are always known before the game begins
      if (c.team === 'traveler') return false;
      if (scriptCharacterIds && scriptCharacterIds.length > 0 && !scriptCharacterIds.includes(c.id)) return false;
      return c.name.toLowerCase().includes(term) || c.team.toLowerCase().includes(term);
    }).sort((a, b) => {
      const orderDiff = getTeamOrder(a.team) - getTeamOrder(b.team);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });
  }, [search, excludeIds, scriptCharacterIds]);

  const toggleCharacter = (charId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(charId)) {
        next.delete(charId);
      } else {
        next.add(charId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size > 0) {
      onSelect(Array.from(selected));
    }
    setSelected(new Set());
    setSearch("");
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md p-0">
        <div className="flex flex-col max-h-[70vh] overflow-hidden p-6 pb-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-amber-500">Select Characters</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-10"
              data-testid="input-search-character"
            />
          </div>
          <div className="flex-1 overflow-y-auto -mx-2 px-2">
            <div className="space-y-1 pb-4">
              {filteredCharacters.map(char => {
                const isSelected = selected.has(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3",
                      "hover-elevate active-elevate-2",
                      TEAM_COLORS[char.team],
                      isSelected && "ring-2 ring-amber-500 ring-offset-1 ring-offset-background"
                    )}
                    data-testid={`button-select-character-${char.id}`}
                  >
                    <Checkbox 
                      checked={isSelected} 
                      className="pointer-events-none"
                      data-testid={`checkbox-character-${char.id}`}
                    />
                    <span className="font-medium">{char.name}</span>
                    <span className="text-xs opacity-70 capitalize ml-auto">{char.team}</span>
                  </button>
                );
              })}
              {filteredCharacters.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No characters found</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 p-4 border-t border-border bg-card/50">
          <span className="text-sm text-muted-foreground">
            {selected.size > 0 ? `${selected.size} selected` : "Select characters to add"}
          </span>
          <Button 
            onClick={handleConfirm}
            disabled={selected.size === 0}
            data-testid="button-confirm-add-claims"
          >
            Add {selected.size > 0 ? `${selected.size} ` : ""}Claim{selected.size !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlayerDetailDrawer({
  player,
  players,
  nominations,
  exileVotes,
  onClose,
  onToggleAlive,
  onSetPlayerStatus,
  onToggleGhostVote,
  onAddMultipleClaims,
  onRemoveClaim,
  onSetNotes,
  onSetPlayerName,
  onRemoveTraveler,
  onRemovePlayer,
  onConvertToTraveler,
  canRemovePlayer,
  scriptCharacterIds,
}: {
  player: GamePlayer | null;
  players: GamePlayer[];
  nominations: Nomination[];
  exileVotes?: ExileVote[];
  onClose: () => void;
  onToggleAlive: () => void;
  onSetPlayerStatus?: (status: PlayerStatus) => void;
  onToggleGhostVote: () => void;
  onAddMultipleClaims: (characterIds: string[]) => void;
  onRemoveClaim: (characterId: string) => void;
  onSetNotes: (notes: string) => void;
  onSetPlayerName: (name: string) => void;
  onRemoveTraveler?: () => void;
  onRemovePlayer?: () => void;
  onConvertToTraveler?: () => void;
  canRemovePlayer?: boolean;
  scriptCharacterIds?: string[] | null;
}) {
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [previewCharacter, setPreviewCharacter] = useState<typeof ALL_CHARACTERS[0] | null>(null);

  if (!player) return null;

  const claimedCharacters = player.claims.map(id => ALL_CHARACTERS.find(c => c.id === id)).filter(Boolean);
  
  const playerNominations = nominations.filter(n => 
    n.nomineeId === player.id || n.nominatorId === player.id || (n.votes && n.votes.some(v => v.playerId === player.id))
  );
  const nominationsByDay = playerNominations.reduce((acc, nom) => {
    if (!acc[nom.day]) acc[nom.day] = [];
    acc[nom.day].push(nom);
    return acc;
  }, {} as Record<number, Nomination[]>);

  return (
    <>
      <Drawer open={!!player} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="border-b border-border pb-4 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                {player.status === 'dead' && <Skull className="w-5 h-5 text-muted-foreground" />}
                {player.status === 'exiled' && <Ban className="w-5 h-5 text-purple-400" />}
                {player.status === 'left' && <LogOut className="w-5 h-5 text-muted-foreground" />}
                {isEditingName ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={() => {
                      if (editedName.trim() && editedName.trim() !== player.name) {
                        onSetPlayerName(editedName.trim());
                      }
                      setIsEditingName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editedName.trim() && editedName.trim() !== player.name) {
                          onSetPlayerName(editedName.trim());
                        }
                        setIsEditingName(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                    autoFocus
                    className="font-display text-xl text-amber-500 h-8 w-40"
                    data-testid="input-edit-player-name"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditedName(player.name);
                      setIsEditingName(true);
                    }}
                    className="font-display text-xl text-amber-500 hover:underline hover:underline-offset-2 text-left"
                    data-testid="button-edit-player-name"
                  >
                    {player.name}
                    <Pencil className="w-3 h-3 inline ml-1.5 opacity-50" />
                  </button>
                )}
                {player.isTraveler && (
                  <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 border-purple-700">
                    Traveler
                  </Badge>
                )}
                <Badge 
                  variant={player.status === 'alive' ? "default" : "secondary"} 
                  className={cn(
                    player.status === 'alive' && "bg-emerald-900/50 text-emerald-300",
                    player.status === 'exiled' && "bg-purple-900/50 text-purple-300",
                    player.status === 'left' && "bg-muted text-muted-foreground"
                  )}
                >
                  {player.status === 'alive' ? "Alive" : player.status === 'dead' ? "Dead" : player.status === 'exiled' ? "Exiled" : "Left"}
                </Badge>
              </div>
              <DrawerClose asChild>
                <Button size="icon" variant="ghost" data-testid="button-close-drawer">
                  <X className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-4">
            <div className="space-y-6">
              {/* Status Controls - Different for Travelers vs Regular Players */}
              {player.isTraveler ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {player.status !== 'alive' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-800 text-emerald-400"
                        onClick={() => onSetPlayerStatus('alive')}
                        data-testid="button-set-alive"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Mark Alive
                      </Button>
                    )}
                    {player.status !== 'dead' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-800 text-red-400"
                        onClick={() => onSetPlayerStatus('dead')}
                        data-testid="button-set-dead"
                      >
                        <Skull className="w-4 h-4 mr-1" />
                        Mark Dead
                      </Button>
                    )}
                    {player.status !== 'exiled' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-800 text-purple-400"
                        onClick={() => onSetPlayerStatus('exiled')}
                        data-testid="button-set-exiled"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Mark Exiled
                      </Button>
                    )}
                    {player.status !== 'left' && onSetPlayerStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-muted text-muted-foreground"
                        onClick={() => onSetPlayerStatus('left')}
                        data-testid="button-set-left"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Mark Left
                      </Button>
                    )}
                  </div>
                  {onRemoveTraveler && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onRemoveTraveler();
                        onClose();
                      }}
                      data-testid="button-remove-traveler"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove from Game
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1",
                      player.status === 'alive'
                        ? "border-red-800 text-red-400"
                        : "border-emerald-800 text-emerald-400"
                    )}
                    onClick={onToggleAlive}
                    data-testid="button-toggle-alive"
                  >
                    <Skull className="w-4 h-4 mr-2" />
                    {player.status === 'alive' ? "Mark as Dead" : "Mark as Alive"}
                  </Button>
                  {player.status === 'dead' && !player.isTraveler && (
                    <Button
                      variant="outline"
                      className={cn(
                        player.hasGhostVote
                          ? "border-purple-800 text-purple-400"
                          : "border-muted text-muted-foreground"
                      )}
                      onClick={onToggleGhostVote}
                      data-testid="button-toggle-ghost-vote"
                    >
                      <Ghost className="w-4 h-4 mr-2" />
                      {player.hasGhostVote ? "Has Ghost Vote" : "Ghost Vote Used"}
                    </Button>
                  )}
                </div>
              )}

              {/* Claims Section - Primary focus */}
              <div className="rounded-lg bg-card/50 border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-amber-500/80 flex items-center gap-2">
                    <Theater className="w-4 h-4" /> Claims
                  </h3>
                  <Button size="sm" variant="outline" className="border-amber-800/50 text-amber-400" onClick={() => setShowCharacterPicker(true)} data-testid="button-add-claim">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                {claimedCharacters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {claimedCharacters.map(char => char && (
                      <Badge
                        key={char.id}
                        className={cn(
                          "cursor-pointer gap-1.5",
                          TEAM_COLORS[char.team]
                        )}
                        onClick={() => setPreviewCharacter(char)}
                        data-testid={`badge-claim-${char.id}`}
                      >
                        {char.name}
                        <Info className="w-3 h-3 opacity-60" />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No claims recorded</p>
                )}
              </div>

              {/* Notes Section */}
              <div className="rounded-lg bg-card/30 border border-border/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notes
                  </h3>
                </div>
                <Textarea
                  value={player.notes}
                  onChange={(e) => onSetNotes(e.target.value)}
                  placeholder="Add notes about this player..."
                  className="min-h-[80px] resize-none bg-background/50"
                  data-testid="textarea-notes"
                />
              </div>

              {/* Nomination History Section */}
              <div className="rounded-lg bg-card/30 border border-border/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Vote className="w-4 h-4" /> Nomination History
                  </h3>
                </div>
                {Object.keys(nominationsByDay).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(nominationsByDay).sort(([a], [b]) => Number(b) - Number(a)).map(([day, noms]) => (
                      <div key={day} className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground">Day {day}</p>
                        {noms.map((nom) => {
                          const nominee = players.find(p => p.id === nom.nomineeId);
                          const nominator = players.find(p => p.id === nom.nominatorId);
                          const playerVote = nom.votes?.find(v => v.playerId === player.id);
                          const votesFor = nom.votes?.filter(v => v.voted).length ?? nom.yesVotes;
                          
                          // Quick log result display
                          const quickLogResult = nom.result 
                            ? (nom.result === 'executed' ? 'Executed' : nom.result === 'on_the_block' ? 'On Block' : nom.result === 'passed' ? 'Survived' : 'Failed')
                            : null;
                          
                          return (
                            <div key={nom.id} className="text-sm pl-2 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-amber-400">{nominee?.name || '[Removed]'}</span>
                                <span className="text-muted-foreground">nominated by</span>
                                <span className="text-purple-400">{nominator?.name || '[Removed]'}</span>
                                <Badge variant="secondary" className="text-xs">{votesFor} votes</Badge>
                                {quickLogResult && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      nom.result === 'executed' && "border-red-500 text-red-400",
                                      nom.result === 'on_the_block' && "border-amber-500 text-amber-400",
                                      nom.result === 'passed' && "border-emerald-500 text-emerald-400",
                                      nom.result === 'failed' && "border-muted-foreground"
                                    )}
                                  >
                                    {quickLogResult}
                                  </Badge>
                                )}
                              </div>
                              {nom.nomineeId === player.id && (
                                <div className="flex items-center gap-1 text-amber-400">
                                  <GallowsIcon className="w-3 h-3" /> Was nominated
                                </div>
                              )}
                              {nom.nominatorId === player.id && (
                                <div className="flex items-center gap-1 text-purple-400">
                                  <PointingFingerIcon className="w-3 h-3" /> Made nomination
                                </div>
                              )}
                              {playerVote && (
                                <div className="flex items-center gap-1">
                                  {playerVote.voted ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span className="text-emerald-400">Voted for execution</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 text-red-500" />
                                      <span className="text-red-400">Did not vote</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No nomination activity</p>
                )}
              </div>

              {/* Player Actions - subtle styling at bottom */}
              {!player.isTraveler && (onConvertToTraveler || onRemovePlayer) && (
                <div className="pt-6 mt-6 border-t border-border/50 space-y-2">
                  {onConvertToTraveler && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-purple-400"
                      onClick={() => {
                        onConvertToTraveler();
                        onClose();
                      }}
                      data-testid="button-convert-to-traveler"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Make Traveler
                    </Button>
                  )}
                  {onRemovePlayer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-destructive"
                      onClick={() => setShowRemoveConfirm(true)}
                      disabled={!canRemovePlayer}
                      data-testid="button-remove-player"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {canRemovePlayer ? "Remove Player" : "Cannot remove last player"}
                    </Button>
                  )}
                </div>
              )}
            </div>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      {/* Remove Player Confirmation */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{player?.name}" from the game? This will delete all their notes, claims, and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onRemovePlayer?.();
                setShowRemoveConfirm(false);
                onClose();
              }}
              data-testid="button-confirm-remove"
            >
              Remove Player
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CharacterPicker
        open={showCharacterPicker}
        onClose={() => setShowCharacterPicker(false)}
        onSelect={(characterIds) => onAddMultipleClaims(characterIds)}
        excludeIds={player.claims}
        scriptCharacterIds={scriptCharacterIds}
      />

      {/* Character Preview Dialog */}
      <Dialog open={!!previewCharacter} onOpenChange={(open) => !open && setPreviewCharacter(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {previewCharacter && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs uppercase tracking-wider",
                    TEAM_COLORS[previewCharacter.team]
                  )}>
                    {previewCharacter.team}
                  </span>
                  <span className="text-amber-400 font-display">{previewCharacter.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Ability */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Ability</h4>
                  <p className="text-sm leading-relaxed text-foreground/90 italic">"{previewCharacter.ability}"</p>
                </div>

                {/* Extended Summary */}
                {previewCharacter.extendedSummary && (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">How it Works</h4>
                    <p className="text-sm leading-relaxed text-foreground/80">{previewCharacter.extendedSummary}</p>
                  </div>
                )}

                {/* Tips (first 3) */}
                {previewCharacter.tipsAndTricks && previewCharacter.tipsAndTricks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Tips</h4>
                    <ul className="text-sm space-y-1 text-foreground/80">
                      {previewCharacter.tipsAndTricks.slice(0, 3).map((tip, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`/reference?character=${previewCharacter.id}`, '_blank')}
                    data-testid="button-view-full-reference"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Reference
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onRemoveClaim(previewCharacter.id);
                      setPreviewCharacter(null);
                    }}
                    data-testid="button-remove-claim-from-preview"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Claim
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SortablePlayerCard({
  player,
  game,
  onSelect,
}: {
  player: GamePlayer;
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging 
      ? 'transform 150ms cubic-bezier(0.22, 1, 0.36, 1)' 
      : transition || 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const claimedChars = player.claims.map(id => ALL_CHARACTERS.find(c => c.id === id)).filter(Boolean);
  const hasNotes = player.notes.trim().length > 0;
  
  const nominationsReceived = game.nominations.filter(n => n.nomineeId === player.id).length;
  const nominationsMade = game.nominations.filter(n => n.nominatorId === player.id).length;

  const isActive = player.status === 'alive';
  const isInactive = player.status !== 'alive';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4",
        isInactive && "opacity-60",
        isDragging && "opacity-80 shadow-lg z-50 scale-[1.02]",
        player.isTraveler && "border-purple-700/50"
      )}
      data-testid={`card-player-${player.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="touch-none cursor-grab active:cursor-grabbing flex items-center justify-center w-9 h-9 -ml-2 -my-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted"
            data-testid={`button-drag-${player.id}`}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          {player.status === 'dead' && <Skull className="w-4 h-4 text-muted-foreground" />}
          {player.status === 'exiled' && <Ban className="w-4 h-4 text-purple-400" />}
          {player.status === 'left' && <LogOut className="w-4 h-4 text-muted-foreground" />}
          {player.isTraveler && (
            <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 border-purple-700 text-xs">
              T
            </Badge>
          )}
          <button
            onClick={onSelect}
            className={cn(
              "font-bold text-lg text-left hover:underline",
              isActive ? "text-amber-100" : "text-muted-foreground line-through"
            )}
          >
            {player.name}
          </button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {player.status === 'dead' && !player.isTraveler && (
            player.hasGhostVote ? (
              <Ghost className="w-5 h-5 text-purple-400" data-testid={`icon-ghost-vote-${player.id}`} />
            ) : (
              <span className="relative" data-testid={`icon-ghost-spent-${player.id}`}>
                <Ghost className="w-5 h-5 text-muted-foreground/40" />
                <X className="w-3 h-3 text-red-500 absolute -bottom-0.5 -right-0.5" />
              </span>
            )
          )}
          {hasNotes && <FileText className="w-4 h-4" />}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        {claimedChars.length > 0 ? (
          <div className="flex flex-wrap gap-1 flex-1">
            {claimedChars.slice(0, 3).map(char => char && (
              <Badge key={char.id} variant="secondary" className={cn("text-xs", TEAM_COLORS[char.team])}>
                {char.name}
              </Badge>
            ))}
            {claimedChars.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{claimedChars.length - 3}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          {nominationsReceived > 0 && (
            <span className="flex items-center gap-1 text-amber-400" data-testid={`text-nominated-${player.id}`}>
              <GallowsIcon className="w-3.5 h-3.5" />
              {nominationsReceived}
            </span>
          )}
          {nominationsMade > 0 && (
            <span className="flex items-center gap-1 text-purple-400" data-testid={`text-nominations-made-${player.id}`}>
              <PointingFingerIcon className="w-3.5 h-3.5" />
              {nominationsMade}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function NominationDialog({
  open,
  onClose,
  players,
  hasBeenNominatedToday,
  hasNominatedToday,
  onCreateNomination,
  onCreateQuickNomination,
}: {
  open: boolean;
  onClose: () => void;
  players: GamePlayer[];
  hasBeenNominatedToday: (playerId: string) => boolean;
  hasNominatedToday: (playerId: string) => boolean;
  onCreateNomination: (nomineeId: string, nominatorId: string, votes: PlayerVote[]) => void;
  onCreateQuickNomination: (nomineeId: string, nominatorId: string, yesVotes: number, result: NominationResult) => void;
}) {
  // Steps: 1=nominee, 2=nominator, 3=choose mode, 4=full vote record, 5=quick log
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [nomineeId, setNomineeId] = useState<string | null>(null);
  const [nominatorId, setNominatorId] = useState<string | null>(null);
  const [selectedVoters, setSelectedVoters] = useState<Set<string>>(new Set());
  // Quick log state
  const [quickVoteCount, setQuickVoteCount] = useState<string>("");
  const [quickResult, setQuickResult] = useState<NominationResult>("failed");

  const reset = () => {
    setStep(1);
    setNomineeId(null);
    setNominatorId(null);
    setSelectedVoters(new Set());
    setQuickVoteCount("");
    setQuickResult("failed");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectNominee = (id: string) => {
    setNomineeId(id);
    setStep(2);
  };

  const handleSelectNominator = (id: string) => {
    setNominatorId(id);
    setStep(3);
  };

  const handleToggleVoter = (playerId: string) => {
    setSelectedVoters(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSubmitFullVote = () => {
    if (!nomineeId || !nominatorId) return;
    
    const votes: PlayerVote[] = players
      .filter(p => p.isAlive || p.hasGhostVote)
      .map(p => ({
        playerId: p.id,
        voted: selectedVoters.has(p.id),
      }));
    
    onCreateNomination(nomineeId, nominatorId, votes);
    handleClose();
  };

  const handleSubmitQuickLog = () => {
    if (!nomineeId || !nominatorId) return;
    const voteCount = parseInt(quickVoteCount) || 0;
    onCreateQuickNomination(nomineeId, nominatorId, voteCount, quickResult);
    handleClose();
  };

  const eligibleNominees = players.filter(p => p.status === 'alive' && !hasBeenNominatedToday(p.id));
  const eligibleNominators = players.filter(p => p.status === 'alive' && !hasNominatedToday(p.id));
  // Show all alive players and dead non-travelers (travelers can't vote on nominations)
  const allVoters = players.filter(p => p.status === 'alive' || (p.status === 'dead' && !p.isTraveler));
  // Helper to check if a player can actually vote
  const canVote = (player: GamePlayer) => player.status === 'alive' || (player.status === 'dead' && player.hasGhostVote && !player.isTraveler);
  const nominee = players.find(p => p.id === nomineeId);
  const nominator = players.find(p => p.id === nominatorId);
  
  // Calculate votes needed for display
  const aliveCount = players.filter(p => p.status === 'alive').length;
  const votesNeeded = Math.ceil(aliveCount / 2);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-amber-500">
            {step === 1 && "Select Nominee"}
            {step === 2 && "Select Nominator"}
            {step === 3 && "How to Record?"}
            {step === 4 && "Record Votes"}
            {step === 5 && "Quick Log"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-2 overflow-y-auto flex-1">
            <p className="text-sm text-muted-foreground mb-4">Who is being put on the block?</p>
            {eligibleNominees.length > 0 ? (
              eligibleNominees.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleSelectNominee(player.id)}
                  className="w-full text-left p-3 rounded-lg border bg-card border-border hover-elevate active-elevate-2"
                  data-testid={`button-nominee-${player.id}`}
                >
                  {player.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">All players have been nominated today</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2 overflow-y-auto flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Who nominated <span className="text-amber-400 font-medium">{nominee?.name}</span>?
            </p>
            {eligibleNominators.length > 0 ? (
              eligibleNominators.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleSelectNominator(player.id)}
                  className="w-full text-left p-3 rounded-lg border bg-card border-border hover-elevate active-elevate-2"
                  data-testid={`button-nominator-${player.id}`}
                >
                  {player.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">All players have nominated today</p>
            )}
            <Button variant="ghost" className="w-full mt-2" onClick={() => setStep(1)}>
              Back
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                <span className="text-amber-400 font-medium">{nominee?.name}</span>
                {" "}nominated by{" "}
                <span className="text-purple-400 font-medium">{nominator?.name}</span>
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep(5)}
                className="w-full text-left p-4 rounded-lg border bg-card border-border hover-elevate active-elevate-2"
                data-testid="button-quick-log"
              >
                <div className="font-medium mb-1">Quick Log</div>
                <div className="text-sm text-muted-foreground">
                  Just record vote count and result
                </div>
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-full text-left p-4 rounded-lg border bg-card border-border hover-elevate active-elevate-2"
                data-testid="button-full-vote-record"
              >
                <div className="font-medium mb-1">Full Vote Record</div>
                <div className="text-sm text-muted-foreground">
                  Track each player's vote individually
                </div>
              </button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
              Back
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 overflow-y-auto flex-1">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="text-amber-400 font-medium">{nominee?.name}</span>
                {" "}nominated by{" "}
                <span className="text-purple-400 font-medium">{nominator?.name}</span>
              </p>
              <p>Check all players who voted for execution:</p>
            </div>
            <div className="space-y-2">
              {allVoters.map(player => {
                const playerCanVote = canVote(player);
                const isSpentGhost = player.status === 'dead' && !player.hasGhostVote && !player.isTraveler;
                
                return (
                  <label
                    key={player.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      !playerCanVote && "opacity-50 cursor-not-allowed",
                      playerCanVote && "cursor-pointer",
                      selectedVoters.has(player.id)
                        ? "bg-emerald-950/30 border-emerald-800"
                        : playerCanVote ? "bg-card border-border hover:bg-muted/50" : "bg-muted/30 border-border"
                    )}
                    data-testid={`label-voter-${player.id}`}
                  >
                    <Checkbox
                      checked={selectedVoters.has(player.id)}
                      onCheckedChange={() => playerCanVote && handleToggleVoter(player.id)}
                      disabled={!playerCanVote}
                      data-testid={`checkbox-voter-${player.id}`}
                    />
                    <span className={cn(
                      "flex-1",
                      player.status !== 'alive' && "text-muted-foreground",
                      isSpentGhost && "line-through"
                    )}>
                      {player.name}
                      {player.status === 'dead' && player.hasGhostVote && !player.isTraveler && (
                        <Ghost className="w-4 h-4 inline ml-2 text-purple-400" />
                      )}
                      {isSpentGhost && (
                        <span className="ml-2 text-xs text-muted-foreground">(vote spent)</span>
                      )}
                    </span>
                    {selectedVoters.has(player.id) && (
                      <Hand className="w-4 h-4 text-emerald-500" />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmitFullVote} data-testid="button-confirm-nomination">
                <Check className="w-4 h-4 mr-2" />
                Confirm ({selectedVoters.size} votes)
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>
                <span className="text-amber-400 font-medium">{nominee?.name}</span>
                {" "}nominated by{" "}
                <span className="text-purple-400 font-medium">{nominator?.name}</span>
              </p>
              <p className="mt-1 text-xs">Votes needed: {votesNeeded}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Vote Count</label>
              <Input
                type="number"
                min="0"
                value={quickVoteCount}
                onChange={(e) => setQuickVoteCount(e.target.value)}
                placeholder="Number of votes"
                className="flex-1"
                data-testid="input-quick-vote-count"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground block">Result</label>
              <div className="space-y-1.5">
                <label
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                    quickResult === "failed" ? "bg-red-950/30 border-red-800" : "bg-card border-border"
                  )}
                >
                  <input
                    type="radio"
                    name="quickResult"
                    checked={quickResult === "failed"}
                    onChange={() => setQuickResult("failed")}
                    className="accent-red-500"
                    data-testid="radio-result-failed"
                  />
                  <span className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Failed
                  </span>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                    quickResult === "on_the_block" ? "bg-amber-950/30 border-amber-800" : "bg-card border-border"
                  )}
                >
                  <input
                    type="radio"
                    name="quickResult"
                    checked={quickResult === "on_the_block"}
                    onChange={() => setQuickResult("on_the_block")}
                    className="accent-amber-500"
                    data-testid="radio-result-on-block"
                  />
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    On the Block
                  </span>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                    quickResult === "executed" ? "bg-emerald-950/30 border-emerald-800" : "bg-card border-border"
                  )}
                >
                  <input
                    type="radio"
                    name="quickResult"
                    checked={quickResult === "executed"}
                    onChange={() => setQuickResult("executed")}
                    className="accent-emerald-500"
                    data-testid="radio-result-executed"
                  />
                  <span className="flex items-center gap-2">
                    <GallowsIcon className="w-4 h-4 text-emerald-500" />
                    Executed
                  </span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Quick Log does not auto-spend ghost votes
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)} data-testid="button-back-quick-log">
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmitQuickLog} data-testid="button-confirm-quick-log">
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AxeIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
    >
      {/* Handle */}
      <rect x="10" y="12" width="3" height="11" rx="1" fill="currentColor" opacity="0.7" />
      {/* Axe head - curved blade */}
      <path d="M6 4 C2 6, 2 12, 6 14 L13 14 L13 4 Z" fill="currentColor" />
      {/* Metal edge highlight */}
      <path d="M6 4 C3 6, 3 12, 6 14" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    </svg>
  );
}

function ChoppingBlockModal({
  open,
  onClose,
  nominations,
  isTied,
  players,
  onExecute,
  onNoExecution,
}: {
  open: boolean;
  onClose: () => void;
  nominations: Nomination[];
  isTied: boolean;
  players: GamePlayer[];
  onExecute: () => void;
  onNoExecution: () => void;
}) {
  const [showConfirmExecute, setShowConfirmExecute] = useState(false);
  
  if (nominations.length === 0) return null;
  
  const currentBlockVotes = nominations[0]?.yesVotes ?? 0;
  
  const handleExecute = () => {
    onExecute();
    setShowConfirmExecute(false);
    onClose();
  };
  
  const handleNoExecution = () => {
    onNoExecution();
    onClose();
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={cn(
              "font-display flex items-center gap-2",
              isTied ? "text-amber-500" : "text-red-500"
            )}>
              <AxeIcon className="w-5 h-5" />
              {isTied ? "CHOPPING BLOCK - TIE" : "CHOPPING BLOCK"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isTied ? (
              <>
                <p className="text-muted-foreground">No execution - players are tied</p>
                <div className="space-y-2">
                  {nominations.map(nom => {
                    const nominee = players.find(p => p.id === nom.nomineeId);
                    const nominator = players.find(p => p.id === nom.nominatorId);
                    return (
                      <div key={nom.id} className="p-3 bg-card rounded-lg border border-amber-800/50">
                        <p className="font-medium text-amber-400">{nominee?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {nom.yesVotes} votes - nominated by {nominator?.name || 'Unknown'}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleNoExecution}
                  data-testid="button-confirm-no-execution-tie"
                >
                  Confirm No Execution
                </Button>
              </>
            ) : (
              <>
                {nominations.map(nom => {
                  const nominee = players.find(p => p.id === nom.nomineeId);
                  const nominator = players.find(p => p.id === nom.nominatorId);
                  return (
                    <div key={nom.id} className="text-center space-y-2">
                      <p className="text-2xl font-display text-red-400">{nominee?.name || 'Unknown'}</p>
                      <p className="text-muted-foreground">
                        {nom.yesVotes} votes received
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nominated by {nominator?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-amber-500 mt-2">
                        Needs more than {currentBlockVotes} votes to replace
                      </p>
                    </div>
                  );
                })}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={handleNoExecution}
                    data-testid="button-no-execution"
                  >
                    No Execution
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => setShowConfirmExecute(true)}
                    data-testid="button-execute"
                  >
                    <GallowsIcon className="w-4 h-4 mr-2" />
                    Execute
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Execute Confirmation */}
      <AlertDialog open={showConfirmExecute} onOpenChange={setShowConfirmExecute}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Execute Player?</AlertDialogTitle>
            <AlertDialogDescription>
              Execute "{players.find(p => p.id === nominations[0]?.nomineeId)?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-execute">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleExecute}
              data-testid="button-confirm-execute"
            >
              Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AddTravelerDialog({
  open,
  onClose,
  onAddTraveler,
  scriptCharacterIds,
}: {
  open: boolean;
  onClose: () => void;
  onAddTraveler: (name: string, initialClaims?: string[]) => void;
  scriptCharacterIds?: string[];
}) {
  const [name, setName] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [claimSearch, setClaimSearch] = useState("");

  const travelerCharacters = useMemo(() => {
    // Travelers are never filtered by script - they can be added to any game
    let chars = ALL_CHARACTERS.filter(c => c.team === "traveler");
    if (claimSearch) {
      chars = chars.filter(c => c.name.toLowerCase().includes(claimSearch.toLowerCase()));
    }
    return chars;
  }, [claimSearch]);

  const resetState = () => {
    setName("");
    setSelectedClaim(null);
    setClaimSearch("");
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    const claims = selectedClaim ? [selectedClaim] : [];
    onAddTraveler(name.trim(), claims);
    resetState();
    onClose();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-display">Add Traveler</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Traveler Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Traveler name"
              data-testid="input-traveler-name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Character Claim (optional)</label>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                placeholder="Search travelers..."
                className="pl-8"
                data-testid="input-search-traveler-claim"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {travelerCharacters.map(char => (
                <button
                  key={char.id}
                  onClick={() => setSelectedClaim(selectedClaim === char.id ? null : char.id)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center gap-2",
                    selectedClaim === char.id 
                      ? "bg-purple-900/40 border border-purple-700" 
                      : "hover-elevate"
                  )}
                  data-testid={`button-claim-${char.id}`}
                >
                  {char.name}
                  {selectedClaim === char.id && <Check className="w-3 h-3 ml-auto text-purple-400" />}
                </button>
              ))}
              {travelerCharacters.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">No travelers found</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAdd} disabled={!name.trim()} data-testid="button-confirm-add-traveler">
              <Plus className="w-4 h-4 mr-2" />
              Add Traveler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddPlayerDialog({
  open,
  onClose,
  onAddPlayer,
  players,
}: {
  open: boolean;
  onClose: () => void;
  onAddPlayer: (name: string, insertAfterPlayerId: string | null) => void;
  players: GamePlayer[];
}) {
  const [name, setName] = useState(`Player ${players.length + 1}`);
  const [insertAfter, setInsertAfter] = useState<string>("__end__");

  const resetState = () => {
    setName(`Player ${players.length + 1}`);
    setInsertAfter("__end__");
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddPlayer(name.trim(), insertAfter === "__beginning__" ? null : insertAfter);
    resetState();
    onClose();
  };

  const handleAddAsTraveler = () => {
    onClose();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-display">Add Player</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Player Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
              data-testid="input-new-player-name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Insert After</label>
            <select
              value={insertAfter}
              onChange={(e) => setInsertAfter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              data-testid="select-insert-position"
            >
              <option value="__beginning__">At beginning</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="__end__">At end</option>
            </select>
          </div>
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <span className="text-amber-500">Warning:</span> Adding players mid-game may affect balance. Consider Traveler instead.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={handleClose} data-testid="button-cancel-add-player">
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAdd} disabled={!name.trim()} data-testid="button-confirm-add-player">
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExileDialog({
  open,
  onClose,
  players,
  onCreateExileVote,
}: {
  open: boolean;
  onClose: () => void;
  players: GamePlayer[];
  onCreateExileVote: (travelerId: string, votes: PlayerVote[]) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTravelerId, setSelectedTravelerId] = useState<string | null>(null);
  const [selectedVoters, setSelectedVoters] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedTravelerId(null);
      setSelectedVoters(new Set());
    }
  }, [open]);

  const aliveTravelers = players.filter(p => p.isTraveler && p.status === 'alive');
  const selectedTraveler = players.find(p => p.id === selectedTravelerId);
  
  // All alive and dead players can vote on exile (not left/exiled)
  const eligibleVoters = players.filter(p => canPlayerVoteOnExile(p));
  const aliveCount = players.filter(p => p.status === 'alive').length;
  const votesNeeded = Math.ceil(aliveCount / 2);

  const handleToggleVoter = (playerId: string) => {
    setSelectedVoters(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!selectedTravelerId) return;
    const votes: PlayerVote[] = eligibleVoters.map(p => ({
      playerId: p.id,
      voted: selectedVoters.has(p.id),
    }));
    onCreateExileVote(selectedTravelerId, votes);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-display">
            {step === 1 ? "Call for Exile" : `Exile ${selectedTraveler?.name}?`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select a Traveler to call for exile:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {aliveTravelers.map(player => (
                <button
                  key={player.id}
                  onClick={() => {
                    setSelectedTravelerId(player.id);
                    setStep(2);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-purple-700/50 bg-purple-900/20 hover-elevate"
                  data-testid={`button-exile-${player.id}`}
                >
                  <div className="font-medium">{player.name}</div>
                  {player.claims.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {player.claims.map(claimId => {
                        const char = ALL_CHARACTERS.find(c => c.id === claimId);
                        return char && (
                          <Badge key={claimId} variant="secondary" className="text-xs bg-purple-900/40 text-purple-300 border-purple-700">
                            {char.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select all players who vote to exile. Dead players can vote on exile (doesn't use ghost vote). Need {votesNeeded} votes to pass.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {eligibleVoters.map(player => (
                <label
                  key={player.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors",
                    selectedVoters.has(player.id)
                      ? "bg-emerald-900/30 border-emerald-700"
                      : "bg-card border-border hover:bg-muted/50"
                  )}
                  data-testid={`label-exile-voter-${player.id}`}
                >
                  <Checkbox
                    checked={selectedVoters.has(player.id)}
                    onCheckedChange={() => handleToggleVoter(player.id)}
                    data-testid={`checkbox-exile-voter-${player.id}`}
                  />
                  <span className={cn(
                    "flex-1",
                    player.status !== 'alive' && "text-muted-foreground"
                  )}>
                    {player.name}
                    {player.status === 'dead' && (
                      <Skull className="w-4 h-4 inline ml-2 text-red-400/70" />
                    )}
                  </span>
                  {selectedVoters.has(player.id) && (
                    <Hand className="w-4 h-4 text-emerald-500" />
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                className={cn("flex-1", selectedVoters.size >= votesNeeded ? "bg-red-600 hover:bg-red-700" : "")}
                onClick={handleSubmit} 
                data-testid="button-confirm-exile"
              >
                <Check className="w-4 h-4 mr-2" />
                {selectedVoters.size >= votesNeeded ? `Exile (${selectedVoters.size} votes)` : `${selectedVoters.size} / ${votesNeeded} votes`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CircleNodeContent({
  player,
  nodeSize,
  nominations,
  isDragging = false,
  isOverlay = false,
}: {
  player: GamePlayer;
  nodeSize: number;
  nominations: Nomination[];
  isDragging?: boolean;
  isOverlay?: boolean;
}) {
  const nomCount = nominations.filter(n => n.nomineeId === player.id).length;
  const firstClaim = player.claims[0];
  const claimChar = firstClaim ? ALL_CHARACTERS.find(c => c.id === firstClaim) : null;
  const isActive = player.status === 'alive';
  const isDead = player.status === 'dead';

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-full border-2 text-center",
        isActive ? "bg-card border-border" : "bg-muted/50 border-muted",
        player.isTraveler && "border-purple-700",
        !isActive && "opacity-70",
        isOverlay && "shadow-2xl scale-110 border-amber-500 bg-card",
        isDragging && "opacity-40"
      )}
      style={{ width: nodeSize, height: nodeSize }}
    >
      <div className="flex items-center gap-0.5 px-1">
        {isDead && <Skull className="w-3 h-3 text-muted-foreground shrink-0" />}
        <span className={cn(
          "text-xs font-medium truncate max-w-[50px]",
          !isActive && "text-muted-foreground"
        )}>
          {player.name.length > 8 ? player.name.slice(0, 7) + '...' : player.name}
        </span>
      </div>
      
      {claimChar && (
        <span className={cn(
          "text-[9px] truncate max-w-[55px] px-1",
          TEAM_COLORS[claimChar.team]
        )}>
          {claimChar.name.length > 8 ? claimChar.name.slice(0, 7) + '...' : claimChar.name}
        </span>
      )}
      
      <div className="flex items-center gap-1 mt-0.5">
        {isDead && !player.isTraveler && (
          player.hasGhostVote ? (
            <Ghost className="w-3 h-3 text-purple-400" />
          ) : (
            <span className="relative">
              <Ghost className="w-3 h-3 text-muted-foreground/40" />
              <X className="w-2 h-2 text-red-500 absolute -bottom-0.5 -right-0.5" />
            </span>
          )
        )}
        {nomCount > 0 && (
          <span className="flex items-center text-[10px] text-amber-400">
            <GallowsIcon className="w-2.5 h-2.5" />
            {nomCount}
          </span>
        )}
      </div>
    </div>
  );
}

function SortableCircleNode({
  player,
  position,
  nodeSize,
  nominations,
  onSelectPlayer,
  isOver,
}: {
  player: GamePlayer;
  position: { x: number; y: number };
  nodeSize: number;
  nominations: Nomination[];
  onSelectPlayer: (playerId: string) => void;
  isOver: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({ id: player.id });

  const style: React.CSSProperties = {
    left: position.x,
    top: position.y,
    width: nodeSize,
    height: nodeSize,
    transition: 'left 200ms ease, top 200ms ease',
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onSelectPlayer(player.id)}
      className={cn(
        "absolute touch-none",
        !isDragging && "hover-elevate active-elevate-2"
      )}
      style={style}
      data-testid={`circle-node-${player.id}`}
    >
      {isOver && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-500 animate-pulse z-20" />
      )}
      <CircleNodeContent
        player={player}
        nodeSize={nodeSize}
        nominations={nominations}
        isDragging={isDragging}
      />
    </button>
  );
}

function CircleSeatingChart({
  players,
  nominations,
  currentDay,
  onSelectPlayer,
  onReorderPlayers,
}: {
  players: GamePlayer[];
  nominations: Nomination[];
  currentDay: number;
  onSelectPlayer: (playerId: string) => void;
  onReorderPlayers: (activeId: string, overId: string) => void;
}) {
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 32, 500);
      setDimensions({ width, height: width });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const playerCount = players.length;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const nodeSize = playerCount <= 8 ? 70 : playerCount <= 12 ? 60 : 50;
  const radius = Math.min(centerX, centerY) - nodeSize / 2 - 10;

  const getPlayerPosition = (index: number) => {
    // Start at top (-90 degrees) and go clockwise (positive angle)
    const angle = ((index / playerCount) * 360 - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle) - nodeSize / 2,
      y: centerY + radius * Math.sin(angle) - nodeSize / 2,
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: { over: { id: string | number } | null }) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderPlayers(active.id as string, over.id as string);
    }
    setActiveId(null);
    setOverId(null);
  };

  const activePlayer = activeId ? players.find(p => p.id === activeId) : null;

  return (
    <div className="flex justify-center py-4">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={players.map(p => p.id)} strategy={rectSortingStrategy}>
          <div 
            className="relative"
            style={{ width: dimensions.width, height: dimensions.height }}
          >
            {players.map((player, index) => (
              <SortableCircleNode
                key={player.id}
                player={player}
                position={getPlayerPosition(index)}
                nodeSize={nodeSize}
                nominations={nominations}
                onSelectPlayer={onSelectPlayer}
                isOver={overId === player.id && activeId !== player.id}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activePlayer && (
            <CircleNodeContent
              player={activePlayer}
              nodeSize={nodeSize}
              nominations={nominations}
              isOverlay={true}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function GameTrackerView({
  game,
  onEndGame,
  onPlayAgain,
  onToggleAlive,
  onSetPlayerStatus,
  onToggleGhostVote,
  onAddClaim,
  onAddMultipleClaims,
  onRemoveClaim,
  onSetNotes,
  onUpdatePlayerName,
  onNextDay,
  onPrevDay,
  onReorderPlayers,
  hasBeenNominatedToday,
  hasNominatedToday,
  onCreateNomination,
  onCreateQuickNomination,
  onClearScript,
  onSetScript,
  onAddTraveler,
  onConvertToTraveler,
  onRemoveTraveler,
  onCreateExileVote,
  getPlayerExileVotes,
  onSetGameNotes,
  onAddPlayer,
  onRemovePlayer,
  choppingBlock,
  onExecuteFromBlock,
  onClearChoppingBlock,
}: {
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  onEndGame: () => void;
  onPlayAgain: () => void;
  onToggleAlive: (playerId: string) => void;
  onSetPlayerStatus: (playerId: string, status: PlayerStatus) => void;
  onToggleGhostVote: (playerId: string) => void;
  onAddClaim: (playerId: string, characterId: string) => void;
  onAddMultipleClaims: (playerId: string, characterIds: string[]) => void;
  onRemoveClaim: (playerId: string, characterId: string) => void;
  onSetNotes: (playerId: string, notes: string) => void;
  onUpdatePlayerName: (playerId: string, name: string) => void;
  onNextDay: () => void;
  onPrevDay: () => void;
  onReorderPlayers: (activeId: string, overId: string) => void;
  hasBeenNominatedToday: (playerId: string) => boolean;
  hasNominatedToday: (playerId: string) => boolean;
  onCreateNomination: (nomineeId: string, nominatorId: string, votes: PlayerVote[]) => void;
  onCreateQuickNomination: (nomineeId: string, nominatorId: string, yesVotes: number, result: NominationResult) => void;
  onClearScript: () => void;
  onSetScript: (scriptRef: GameScriptRef | null) => void;
  onAddTraveler: (name: string, initialClaims?: string[]) => void;
  onConvertToTraveler: (playerId: string) => void;
  onRemoveTraveler: (playerId: string) => void;
  onCreateExileVote: (travelerId: string, votes: PlayerVote[]) => void;
  getPlayerExileVotes: (playerId: string) => ExileVote[];
  onSetGameNotes: (notes: string) => void;
  onAddPlayer: (name: string, insertAfterPlayerId: string | null) => void;
  onRemovePlayer: (playerId: string) => void;
  choppingBlock: { nominations: Nomination[]; isTied: boolean };
  onExecuteFromBlock: () => void;
  onClearChoppingBlock: () => void;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showPlayAgainConfirm, setShowPlayAgainConfirm] = useState(false);
  const [showNominationDialog, setShowNominationDialog] = useState(false);
  const [showAddTravelerDialog, setShowAddTravelerDialog] = useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [showExileDialog, setShowExileDialog] = useState(false);
  const [showChoppingBlockModal, setShowChoppingBlockModal] = useState(false);
  const [showDayChangePrompt, setShowDayChangePrompt] = useState(false);
  const [scriptPopoverOpen, setScriptPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'circle' | 'log'>('list');
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const { getScriptById, isLoading: scriptsLoading, allScripts, addCustomScript, updateCustomScript, customScripts } = useLocalScripts();
  
  const resolvedScript = game.script ? getScriptById(game.script.id) : null;
  const scriptCharacterIds = resolvedScript?.characterIds;

  useEffect(() => {
    if (!scriptsLoading && game.script && !resolvedScript) {
      onClearScript();
    }
  }, [scriptsLoading, game.script, resolvedScript, onClearScript]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderPlayers(active.id as string, over.id as string);
    }
  };

  const handleNextDay = () => {
    if (choppingBlock.nominations.length > 0) {
      setShowDayChangePrompt(true);
    } else {
      onNextDay();
    }
  };

  const selectedPlayer = game.players.find(p => p.id === selectedPlayerId) || null;
  const regularPlayers = game.players.filter(p => !p.isTraveler);
  const travelers = game.players.filter(p => p.isTraveler);
  const alivePlayers = game.players.filter(p => p.status === 'alive');
  const aliveCount = alivePlayers.length;
  const deadCount = game.players.filter(p => p.status === 'dead').length;
  const exiledCount = game.players.filter(p => p.status === 'exiled').length;
  const leftCount = game.players.filter(p => p.status === 'left').length;
  const aliveTravelers = travelers.filter(p => p.status === 'alive');
  const votesNeeded = Math.ceil(aliveCount / 2);
  const ghostVotesAvailable = game.players.filter(p => p.status === 'dead' && p.hasGhostVote && !p.isTraveler).length;
  const totalVotesAvailable = aliveCount + ghostVotesAvailable;
  const todayNominations = game.nominations.filter(n => n.day === game.currentDay);
  const canExecute = totalVotesAvailable >= votesNeeded;

  return (
    <div className="space-y-4">
      {/* Dashboard Card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Script Header Row */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
          <Popover open={scriptPopoverOpen} onOpenChange={setScriptPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover-elevate active-elevate-2 flex-1 max-w-[75%]"
                data-testid="button-change-script"
              >
                <Scroll className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-display text-amber-500 truncate">
                  {resolvedScript ? resolvedScript.name : "No Script"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-500/50 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Select Script</div>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover-elevate",
                    !game.script && "bg-accent"
                  )}
                  onClick={() => {
                    onSetScript(null);
                    setScriptPopoverOpen(false);
                  }}
                  data-testid="button-script-none"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>No Script (All Characters)</span>
                </button>
                {allScripts.map((script) => (
                  <div
                    key={script.id}
                    className={cn(
                      "w-full flex items-center gap-1 px-2 py-1.5 rounded-md text-sm",
                      game.script?.id === script.id && "bg-accent"
                    )}
                  >
                    <button
                      className="flex-1 flex items-center gap-2 text-left hover-elevate rounded-md -m-1 p-1"
                      onClick={() => {
                        onSetScript({ id: script.id });
                        setScriptPopoverOpen(false);
                      }}
                      data-testid={`button-script-${script.id}`}
                    >
                      {script.isOfficial ? (
                        <BookOpen className="w-3.5 h-3.5 text-amber-500/70" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-purple-500/70" />
                      )}
                      <span className="truncate">{script.name}</span>
                    </button>
                    {!script.isOfficial && (
                      <button
                        className="p-1 rounded hover-elevate"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingScript(script);
                          setShowScriptBuilder(true);
                          setScriptPopoverOpen(false);
                        }}
                        data-testid={`button-edit-active-script-${script.id}`}
                      >
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover-elevate text-purple-400 border-t border-border mt-1 pt-2"
                  onClick={() => {
                    setEditingScript(null);
                    setShowScriptBuilder(true);
                    setScriptPopoverOpen(false);
                  }}
                  data-testid="button-create-custom-script-active"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Custom Script</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Overflow Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-overflow-menu">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {confirmEnd ? (
                <>
                  <DropdownMenuItem onClick={() => setConfirmEnd(false)} data-testid="button-cancel-end">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onEndGame} 
                    className="text-destructive focus:text-destructive"
                    data-testid="button-confirm-end"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm End Game
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={() => setShowAddPlayerDialog(true)}
                    data-testid="button-add-player-menu"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Player
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowPlayAgainConfirm(true)}
                    data-testid="button-play-again"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setConfirmEnd(true)}
                    className="text-destructive focus:text-destructive"
                    data-testid="button-end-game"
                  >
                    <Skull className="w-4 h-4 mr-2" />
                    End Game
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Day Row - Full Width Action Style */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border bg-amber-950/10">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevDay}
            disabled={game.currentDay <= 1}
            data-testid="button-prev-day"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center justify-center gap-2 flex-1 mx-4 py-2 bg-amber-900/30 border border-amber-700/30 rounded-md">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="font-display text-xl text-amber-400">Day {game.currentDay}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextDay}
            data-testid="button-next-day"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2">
          {/* Alive */}
          <div className="p-4 text-center border-r border-b border-border">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-emerald-500/70" />
              <span className="text-2xl font-bold text-emerald-400 tabular-nums">{aliveCount}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Alive</div>
          </div>

          {/* Dead with Ghost Votes */}
          <div className="p-4 text-center border-b border-border">
            <div className="flex items-center justify-center gap-2">
              <Skull className="w-5 h-5 text-red-500/70" />
              <span className="text-2xl font-bold text-red-400/80 tabular-nums">
                {deadCount}
                {deadCount > 0 && (
                  <span className="text-sm font-normal text-purple-400 ml-1">
                    ({ghostVotesAvailable}<Ghost className="w-3 h-3 inline ml-0.5" />)
                  </span>
                )}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Dead</div>
          </div>

          {/* Votes to Execute */}
          <div className="p-4 text-center border-r border-border">
            <div className="flex items-center justify-center gap-2">
              <Scale className="w-5 h-5 text-amber-500/70" />
              <span className="text-2xl font-bold text-amber-400 tabular-nums">{votesNeeded}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">To Exec</div>
          </div>

          {/* Available Votes */}
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Hand className="w-5 h-5 text-purple-500/70" />
              <span className={cn(
                "text-2xl font-bold tabular-nums",
                canExecute ? "text-purple-400" : "text-red-400"
              )}>{totalVotesAvailable}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Can Vote</div>
          </div>
        </div>

        {/* Chopping Block Indicator */}
        {choppingBlock.nominations.length > 0 && (
          <button
            onClick={() => setShowChoppingBlockModal(true)}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 border-t border-border w-full hover-elevate active-elevate-2",
              choppingBlock.isTied ? "bg-amber-950/30" : "bg-red-950/30"
            )}
            data-testid="button-view-chopping-block"
          >
            <AxeIcon className={cn("w-5 h-5", choppingBlock.isTied ? "text-amber-500" : "text-red-500")} />
            {choppingBlock.isTied ? (
              <span className="text-amber-400 font-medium">
                Tied on Block: {choppingBlock.nominations.length} players ({choppingBlock.nominations[0]?.yesVotes} votes)
              </span>
            ) : (
              <span className="text-red-400 font-medium">
                On the Block: {game.players.find(p => p.id === choppingBlock.nominations[0]?.nomineeId)?.name} ({choppingBlock.nominations[0]?.yesVotes} votes)
              </span>
            )}
            <Badge variant="outline" className="text-xs">View</Badge>
          </button>
        )}

        {/* Traveler Row - Conditional */}
        {travelers.length > 0 && (
          <div className="flex items-center justify-center gap-2 px-3 py-2 border-t border-border bg-purple-950/20">
            <Theater className="w-4 h-4 text-purple-400/70" />
            <span className="text-sm text-purple-300">
              {aliveTravelers.length}/{travelers.length} Travelers
              {(exiledCount > 0 || leftCount > 0) && (
                <span className="text-purple-400/60 ml-1">
                  ({exiledCount > 0 && `${exiledCount} exiled`}{exiledCount > 0 && leftCount > 0 && ', '}{leftCount > 0 && `${leftCount} left`})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-t border-border">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                "py-2.5 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'list' 
                  ? "border-amber-500 text-amber-400 bg-amber-950/20" 
                  : "border-transparent text-muted-foreground hover-elevate"
              )}
              data-testid="tab-list"
            >
              <List className="w-4 h-4 inline mr-1.5" />
              List
            </button>
            <button
              onClick={() => setActiveTab('circle')}
              className={cn(
                "py-2.5 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'circle' 
                  ? "border-amber-500 text-amber-400 bg-amber-950/20" 
                  : "border-transparent text-muted-foreground hover-elevate"
              )}
              data-testid="tab-circle"
            >
              <Circle className="w-4 h-4 inline mr-1.5" />
              Circle
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={cn(
                "py-2.5 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'log' 
                  ? "border-amber-500 text-amber-400 bg-amber-950/20" 
                  : "border-transparent text-muted-foreground hover-elevate"
              )}
              data-testid="tab-log"
            >
              <Scroll className="w-4 h-4 inline mr-1.5" />
              Log
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-center gap-2 px-3 py-2.5 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={() => setShowAddTravelerDialog(true)} data-testid="button-add-traveler">
            <Plus className="w-4 h-4 mr-1.5" />
            Traveler
          </Button>
          {aliveTravelers.length > 0 && (
            <Button variant="outline" onClick={() => setShowExileDialog(true)} data-testid="button-exile">
              Exile
            </Button>
          )}
          <Button 
            variant="destructive"
            onClick={() => setShowNominationDialog(true)} 
            data-testid="button-nominate"
          >
            <Target className="w-4 h-4 mr-1.5" />
            Nominate
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={game.players.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {game.players.map((player) => (
                <SortablePlayerCard
                  key={player.id}
                  player={player}
                  game={game}
                  onSelect={() => setSelectedPlayerId(player.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {activeTab === 'circle' && (
        <CircleSeatingChart
          players={game.players}
          nominations={game.nominations}
          currentDay={game.currentDay}
          onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
          onReorderPlayers={onReorderPlayers}
        />
      )}
      
      {activeTab === 'log' && (
        <InlineGameLog game={game} onUpdateGameNotes={onSetGameNotes} />
      )}

      <PlayerDetailDrawer
        player={selectedPlayer}
        players={game.players}
        nominations={game.nominations}
        exileVotes={selectedPlayer ? getPlayerExileVotes(selectedPlayer.id) : []}
        onClose={() => setSelectedPlayerId(null)}
        onToggleAlive={() => selectedPlayerId && onToggleAlive(selectedPlayerId)}
        onSetPlayerStatus={(status) => selectedPlayerId && onSetPlayerStatus(selectedPlayerId, status)}
        onToggleGhostVote={() => selectedPlayerId && onToggleGhostVote(selectedPlayerId)}
        onAddMultipleClaims={(charIds) => selectedPlayerId && onAddMultipleClaims(selectedPlayerId, charIds)}
        onRemoveClaim={(charId) => selectedPlayerId && onRemoveClaim(selectedPlayerId, charId)}
        onSetNotes={(notes) => selectedPlayerId && onSetNotes(selectedPlayerId, notes)}
        onSetPlayerName={(name) => selectedPlayerId && onUpdatePlayerName(selectedPlayerId, name)}
        onRemoveTraveler={selectedPlayer?.isTraveler ? () => selectedPlayerId && onRemoveTraveler(selectedPlayerId) : undefined}
        onRemovePlayer={() => selectedPlayerId && onRemovePlayer(selectedPlayerId)}
        onConvertToTraveler={!selectedPlayer?.isTraveler ? () => selectedPlayerId && onConvertToTraveler(selectedPlayerId) : undefined}
        canRemovePlayer={game.players.length > 1}
        scriptCharacterIds={scriptCharacterIds}
      />

      <NominationDialog
        open={showNominationDialog}
        onClose={() => setShowNominationDialog(false)}
        players={game.players}
        hasBeenNominatedToday={hasBeenNominatedToday}
        hasNominatedToday={hasNominatedToday}
        onCreateNomination={onCreateNomination}
        onCreateQuickNomination={onCreateQuickNomination}
      />

      <ChoppingBlockModal
        open={showChoppingBlockModal}
        onClose={() => setShowChoppingBlockModal(false)}
        nominations={choppingBlock.nominations}
        isTied={choppingBlock.isTied}
        players={game.players}
        onExecute={onExecuteFromBlock}
        onNoExecution={onClearChoppingBlock}
      />

      <AddTravelerDialog
        open={showAddTravelerDialog}
        onClose={() => setShowAddTravelerDialog(false)}
        onAddTraveler={onAddTraveler}
        scriptCharacterIds={scriptCharacterIds}
      />

      <AddPlayerDialog
        open={showAddPlayerDialog}
        onClose={() => setShowAddPlayerDialog(false)}
        onAddPlayer={onAddPlayer}
        players={game.players}
      />

      <ExileDialog
        open={showExileDialog}
        onClose={() => setShowExileDialog(false)}
        players={game.players}
        onCreateExileVote={onCreateExileVote}
      />

      <ScriptBuilderDialog
        open={showScriptBuilder}
        onOpenChange={setShowScriptBuilder}
        initialCharacters={editingScript ? new Set(editingScript.characterIds) : new Set()}
        initialName={editingScript?.name || ""}
        title={editingScript ? "Edit Custom Script" : "Create Custom Script"}
        editMode={!!editingScript}
        onSave={(name, characterIds) => {
          if (editingScript) {
            updateCustomScript(editingScript.id, name, characterIds);
          } else {
            const newScript = addCustomScript(name, characterIds);
            onSetScript({ id: newScript.id });
          }
        }}
      />

      <AlertDialog open={showPlayAgainConfirm} onOpenChange={setShowPlayAgainConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new game with the same players?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This will reset:</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>All nominations and votes</li>
                  <li>All claims</li>
                  <li>All deaths</li>
                  <li>Day counter</li>
                  <li>Game notes</li>
                  <li>All travelers will be removed</li>
                </ul>
                <p className="text-sm">Player names and script selection will be kept.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-play-again">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onPlayAgain}
              data-testid="button-confirm-play-again"
            >
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDayChangePrompt} onOpenChange={setShowDayChangePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AxeIcon className="w-5 h-5 text-red-500" />
              {choppingBlock.isTied ? "Tied on the Block" : "Player on the Block"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {choppingBlock.isTied ? (
                  <p>
                    {choppingBlock.nominations.length} players are tied with {choppingBlock.nominations[0]?.yesVotes} votes each.
                    In BOTC, ties mean no execution.
                  </p>
                ) : (
                  <p>
                    <span className="font-medium text-red-400">
                      {game.players.find(p => p.id === choppingBlock.nominations[0]?.nomineeId)?.name}
                    </span>
                    {" "}is on the chopping block with {choppingBlock.nominations[0]?.yesVotes} votes.
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Resolve the block before moving to the next day, or skip to continue without executing.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel data-testid="button-cancel-day-change">Stay on Day {game.currentDay}</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setShowDayChangePrompt(false);
                setShowChoppingBlockModal(true);
              }}
              data-testid="button-resolve-block"
            >
              <AxeIcon className="w-4 h-4 mr-2" />
              Resolve Block
            </Button>
            <AlertDialogAction 
              onClick={() => {
                onClearChoppingBlock();
                onNextDay();
              }}
              data-testid="button-skip-execution"
            >
              Skip & Next Day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

export default function Game() {
  const {
    game,
    isLoading,
    createGame,
    endGame,
    playAgain,
    updatePlayer,
    addClaim,
    addMultipleClaims,
    removeClaim,
    toggleAlive,
    setPlayerStatus,
    toggleGhostVote,
    setNotes,
    nextDay,
    prevDay,
    reorderPlayers,
    hasBeenNominatedToday,
    hasNominatedToday,
    createNomination,
    createQuickNomination,
    clearScript,
    setScript,
    addTraveler,
    convertToTraveler,
    removeTraveler,
    createExileVote,
    getPlayerExileVotes,
    setGameNotes,
    addPlayer,
    removePlayer,
    getChoppingBlock,
    executeFromBlock,
    clearChoppingBlock,
  } = usePlayerGame();

  const updatePlayerName = (playerId: string, name: string) => {
    updatePlayer(playerId, { name });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {!game ? (
        <SetupWizard onStart={createGame} />
      ) : (
        <GameTrackerView
          game={game}
          onEndGame={endGame}
          onPlayAgain={playAgain}
          onToggleAlive={toggleAlive}
          onSetPlayerStatus={setPlayerStatus}
          onToggleGhostVote={toggleGhostVote}
          onAddClaim={addClaim}
          onAddMultipleClaims={addMultipleClaims}
          onRemoveClaim={removeClaim}
          onSetNotes={setNotes}
          onUpdatePlayerName={updatePlayerName}
          onNextDay={nextDay}
          onPrevDay={prevDay}
          onReorderPlayers={reorderPlayers}
          hasBeenNominatedToday={hasBeenNominatedToday}
          hasNominatedToday={hasNominatedToday}
          onCreateNomination={createNomination}
          onCreateQuickNomination={createQuickNomination}
          onClearScript={clearScript}
          onSetScript={setScript}
          onAddTraveler={addTraveler}
          onConvertToTraveler={convertToTraveler}
          onRemoveTraveler={removeTraveler}
          onCreateExileVote={createExileVote}
          getPlayerExileVotes={getPlayerExileVotes}
          onSetGameNotes={setGameNotes}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          choppingBlock={getChoppingBlock()}
          onExecuteFromBlock={executeFromBlock}
          onClearChoppingBlock={clearChoppingBlock}
        />
      )}
    </Layout>
  );
}

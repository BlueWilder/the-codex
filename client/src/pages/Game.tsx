import { Layout } from "@/components/ui/Layout";
import { useState, useMemo, useEffect, useRef } from "react";
import { usePlayerGame, getBreakdown, isPlayerActive, type GamePlayer, type GameScriptRef, type PlayerStatus, type DeathRecord } from "@/hooks/use-player-game";
import { ALL_CHARACTERS, OFFICIAL_SCRIPTS, getJinxesForCharacter, getCharacterById } from "@/lib/game-data";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { InlineGameLog } from "@/components/InlineGameLog";
import { scanScriptFile } from "@/lib/scan-script";
import { resolveScriptCharacters, countScriptCharacters } from "@/lib/script-resolve";
import { ScriptSheet } from "@/components/character/ScriptSheet";
import { CharacterCard } from "@/components/character/CharacterCard";
import { latestDeathRecord, deathPhaseLabel } from "@/lib/death-phase";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Play, X, Plus, Check, Search, Moon, Sun, ChevronUp, ChevronDown, FileText, Vote, Loader2, GripVertical, UserPlus, ArrowRight, BookOpen, HandMetal, Ban, LogOut, Trash2, Pencil, MoreVertical, RotateCcw, Info, ExternalLink, Users, Skull, Ghost, Scroll, Hand, Target, Theater, ArrowDownUp, Camera, LayoutList, NotebookText, ScrollText } from "lucide-react";
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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent, useDraggable } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { teamBadge, teamInputAccent, teamCard, teamRing } from "@/lib/team-style";
import { CharacterToken } from "@/components/character/CharacterToken";
import { TeamBadge } from "@/components/character/TeamBadge";
import { NightBadges } from "@/components/character/NightBadges";
import { JinxBadge } from "@/components/character/JinxBadge";
import { JinxList } from "@/components/character/JinxList";

function AddTravelerDialog({
  open,
  onClose,
  onAddTraveler,
}: {
  open: boolean;
  onClose: () => void;
  onAddTraveler: (name: string, initialClaims?: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [claimSearch, setClaimSearch] = useState("");

  const travelerCharacters = useMemo(() => {
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



export function SetupWizard({ onStart }: { onStart: (count: number, names: string[], script?: GameScriptRef | null) => void }) {
  const [playerCount, setPlayerCount] = useState(8);
  const [selectedScript, setSelectedScript] = useState<LocalScript | null>(null);
  const [scriptDrawerOpen, setScriptDrawerOpen] = useState(false);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [scannedCharacters, setScannedCharacters] = useState<Set<string> | null>(null);
  const [scanning, setScanning] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const { allScripts, customScripts, addCustomScriptAsync, updateCustomScript, getScriptById } = useLocalScripts();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.removeItem("clocktower_st_session");
  }, []);

  const breakdown = getBreakdown(playerCount);

  const handleSelectScript = (script: LocalScript | null) => {
    setSelectedScript(script);
    setScriptDrawerOpen(false);
  };

  const handleScanScript = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (scanInputRef.current) scanInputRef.current.value = '';
    if (!file) return;
    setScanning(true);
    try {
      const { matchedIds, unmatchedNames } = await scanScriptFile(file);
      if (matchedIds.length === 0) {
        toast({
          title: "No characters recognized",
          description: "Couldn't read any characters from that photo. Try a clearer, well-lit shot.",
          variant: "destructive",
        });
        return;
      }
      setEditingScript(null);
      setScannedCharacters(new Set(matchedIds));
      setScriptDrawerOpen(false);
      setShowScriptBuilder(true);
      if (unmatchedNames.length > 0) {
        toast({
          title: `Found ${matchedIds.length} characters`,
          description: `Couldn't match: ${unmatchedNames.join(', ')}. Review and edit before saving.`,
        });
      } else {
        toast({
          title: `Found ${matchedIds.length} characters`,
          description: "Review and edit your scanned script before saving.",
        });
      }
    } catch (err) {
      toast({
        title: "Scan failed",
        description: err instanceof Error ? err.message : "Could not scan that photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const getDefaultName = (index: number) => {
    if (playerCount > 15 && index >= 15) {
      return `Traveler ${index - 14}`;
    }
    return `Player ${index + 1}`;
  };

  const handleStartGame = () => {
    const scriptRef: GameScriptRef | null = selectedScript ? {
      id: selectedScript.id,
    } : null;
    const finalNames = Array.from({ length: playerCount }, (_, i) => getDefaultName(i));
    onStart(playerCount, finalNames, scriptRef);
  };

  const sheetCharacters = selectedScript
    ? resolveScriptCharacters(selectedScript, { includeTravellers: false, includeFabled: false })
    : [];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-display text-amber-500 mb-8 text-center">New Game</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 flex flex-col" data-testid="card-script">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Script</div>
          <button
            onClick={() => setScriptDrawerOpen(true)}
            className="w-full flex-1 text-left flex items-center gap-3 rounded-lg hover-elevate -m-1 p-1"
            data-testid="button-script-selector"
          >
            {selectedScript ? (
              <Scroll className="w-5 h-5 text-amber-500/70 shrink-0" />
            ) : (
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {selectedScript ? (
                <>
                  <div className="font-medium truncate">{selectedScript.name}</div>
                  <div className="text-sm text-muted-foreground">{countScriptCharacters(selectedScript)} characters</div>
                </>
              ) : (
                <>
                  <div className="font-medium text-amber-100">Select a script</div>
                  <div className="text-sm text-muted-foreground">Tap to choose, or start with all characters</div>
                </>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </Card>

        <Card className="p-4 flex flex-col" data-testid="card-players">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Players</div>
          <div className="flex flex-1 items-center justify-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setPlayerCount(Math.max(5, playerCount - 1))}
              data-testid="button-decrease-players"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
            <div className="text-4xl md:text-5xl font-display text-amber-100 w-16 text-center" data-testid="text-player-count">
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
        </Card>
      </div>

      <div className="w-full bg-muted/30 p-6 rounded-lg text-center space-y-3 mb-4">
        <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">Character Breakdown</p>
        <div className="flex flex-wrap justify-center gap-3" data-testid="text-breakdown">
          <Badge variant="secondary" className={cn(teamBadge('townsfolk'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.townsfolk} Townsfolk
          </Badge>
          <Badge variant="secondary" className={cn(teamBadge('outsider'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.outsiders} Outsiders
          </Badge>
          <Badge variant="secondary" className={cn(teamBadge('minion'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.minions} Minions
          </Badge>
          <Badge variant="secondary" className={cn(teamBadge('demon'), 'text-sm px-3 py-1 font-sans')}>
            {breakdown.demons} Demon
          </Badge>
          {'travelers' in breakdown && breakdown.travelers > 0 && (
            <Badge variant="secondary" className={cn(teamBadge('traveler'), 'text-sm px-3 py-1 font-sans')}>
              + {breakdown.travelers} {breakdown.travelers === 1 ? 'Traveler' : 'Travelers'}
            </Badge>
          )}
        </div>
      </div>

      {selectedScript ? (
        <ScriptSheet characters={sheetCharacters} scriptName={selectedScript.name} />
      ) : (
        <div className="py-12 text-center text-muted-foreground" data-testid="text-script-nudge">
          Pick a script to see the full character sheet.
        </div>
      )}

      <div className="flex justify-center pt-6">
        <Button onClick={handleStartGame} size="lg" data-testid="button-start-game">
          <Play className="w-4 h-4 mr-2" /> Start Game
        </Button>
      </div>

      <Drawer open={scriptDrawerOpen} onOpenChange={setScriptDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Select a script</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6 space-y-3">
            <button
              onClick={() => handleSelectScript(null)}
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

            {allScripts.filter(s => s.isOfficial && !s.isCommunity).map(script => (
              <button
                key={script.id}
                onClick={() => handleSelectScript(script)}
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
                    <div className="text-sm text-muted-foreground">{countScriptCharacters(script)} characters</div>
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
                    : "bg-card border-border hover-elevate"
                )}
                data-testid={`button-script-${script.id}`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-teal-500/70" />
                  <div>
                    <div className="font-medium">{script.name}</div>
                    <div className="text-sm text-muted-foreground">{countScriptCharacters(script)} characters</div>
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
                  className="flex-1 flex items-center gap-3 hover-elevate rounded-lg -m-2 p-2"
                  data-testid={`button-script-${script.id}`}
                >
                  <Scroll className="w-5 h-5 text-purple-500/70" />
                  <div>
                    <div className="font-medium">{script.name}</div>
                    <div className="text-sm text-muted-foreground">{countScriptCharacters(script)} characters</div>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingScript(script);
                    setScriptDrawerOpen(false);
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
                setScannedCharacters(null);
                setScriptDrawerOpen(false);
                setShowScriptBuilder(true);
              }}
              className="w-full text-left p-4 rounded-lg border border-dashed border-purple-700/50 hover-elevate transition-colors flex items-center gap-3"
              data-testid="button-create-custom-script"
            >
              <Plus className="w-5 h-5 text-purple-500/70" />
              <div className="font-medium text-purple-400">Create Custom Script</div>
            </button>
            <button
              onClick={() => scanInputRef.current?.click()}
              disabled={scanning}
              className="w-full text-left p-4 rounded-lg border border-dashed border-amber-700/50 hover-elevate transition-colors flex items-center gap-3 disabled:opacity-60"
              data-testid="button-scan-paper-script"
            >
              {scanning ? (
                <Loader2 className="w-5 h-5 text-amber-500/70 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-amber-500/70" />
              )}
              <div>
                <div className="font-medium text-amber-400">{scanning ? "Scanning photo..." : "Scan Paper Script"}</div>
                <div className="text-sm text-muted-foreground">Take a photo of a printed script to build it automatically</div>
              </div>
            </button>
            <input
              ref={scanInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleScanScript}
              data-testid="input-scan-paper-script"
            />

            {scanning && (
              <div className="flex items-center gap-2 pt-2 text-sm text-amber-400" data-testid="status-scanning">
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading your photo… the review screen will open in a moment.
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <ScriptBuilderDialog
        open={showScriptBuilder}
        onOpenChange={(o) => {
          setShowScriptBuilder(o);
          if (!o) setScannedCharacters(null);
        }}
        initialCharacters={
          editingScript
            ? new Set(editingScript.characterIds)
            : scannedCharacters ?? new Set()
        }
        initialName={editingScript?.name || (scannedCharacters ? "Scanned Script" : "")}
        initialSynopsis={editingScript?.synopsis || ""}
        title={editingScript ? "Edit Custom Script" : scannedCharacters ? "Review Scanned Script" : "Create Custom Script"}
        editMode={!!editingScript}
        onSave={async (name, characterIds, synopsis) => {
          if (editingScript) {
            updateCustomScript(editingScript.id, name, characterIds, synopsis);
            const updated = getScriptById(editingScript.id);
            if (updated) setSelectedScript(updated);
          } else {
            const newScript = await addCustomScriptAsync(name, characterIds, synopsis);
            setSelectedScript(newScript);
          }
        }}
      />
    </div>
  );
}

const GENERIC_TRAVELLER_ID = 'generic-traveller';

interface ClaimDescriptor {
  id: string;
  name: string;
  team: string;
}

function resolveClaimDescriptor(id: string): ClaimDescriptor | null {
  if (id === GENERIC_TRAVELLER_ID) {
    return { id: GENERIC_TRAVELLER_ID, name: 'Traveller', team: 'traveler' };
  }
  const char = ALL_CHARACTERS.find(c => c.id === id);
  return char ? { id: char.id, name: char.name, team: char.team } : null;
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
        case 'fabled': return 5;
        default: return 6;
      }
    };
    return ALL_CHARACTERS.filter(c => {
      if (excludeIds.includes(c.id)) return false;
      if (c.team === 'traveler' || c.team === 'fabled') return false;
      if (scriptCharacterIds && scriptCharacterIds.length > 0 && !scriptCharacterIds.includes(c.id)) return false;
      return c.name.toLowerCase().includes(term) || c.team.toLowerCase().includes(term);
    }).sort((a, b) => {
      const orderDiff = getTeamOrder(a.team) - getTeamOrder(b.team);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });
  }, [search, excludeIds, scriptCharacterIds]);

  const pickerOptions = useMemo<ClaimDescriptor[]>(() => {
    const opts: ClaimDescriptor[] = filteredCharacters.map(c => ({
      id: c.id,
      name: c.name,
      team: c.team,
    }));
    const term = search.toLowerCase();
    const travellerAlreadyClaimed = excludeIds.includes(GENERIC_TRAVELLER_ID);
    const matchesSearch =
      !term || "traveller".includes(term) || "traveler".includes(term);
    if (!travellerAlreadyClaimed && matchesSearch) {
      opts.push({ id: GENERIC_TRAVELLER_ID, name: "Traveller", team: "traveler" });
    }
    return opts;
  }, [filteredCharacters, search, excludeIds]);

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
      <DialogContent className="max-w-md p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
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
              {pickerOptions.map(char => {
                const isSelected = selected.has(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3",
                      "hover-elevate active-elevate-2",
                      teamBadge(char.team),
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
                    <span className="ml-auto">
                      <TeamBadge team={char.team} variant="label" />
                    </span>
                  </button>
                );
              })}
              {pickerOptions.length === 0 && (
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
  onClose,
  onToggleAlive,
  onSetPlayerStatus,
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
  onClose: () => void;
  onToggleAlive: () => void;
  onSetPlayerStatus?: (status: PlayerStatus) => void;
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
  const notesSectionRef = useRef<HTMLDivElement>(null);

  if (!player) return null;

  const claimedCharacters = player.claims.map(id => resolveClaimDescriptor(id)).filter(Boolean);

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

          <ScrollArea className="flex-1">
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
                    {claimedCharacters.map((char, idx) => char && (
                      <div key={char.id} className="inline-flex items-center gap-1">
                        <Badge
                          className={cn(
                            "gap-1.5 text-base",
                            char.id !== GENERIC_TRAVELLER_ID && "cursor-pointer",
                            candidateChipClass(char.team, idx === 0)
                          )}
                          onClick={char.id === GENERIC_TRAVELLER_ID ? undefined : () => {
                            const full = ALL_CHARACTERS.find(c => c.id === char.id);
                            if (full) setPreviewCharacter(full);
                          }}
                          data-testid={idx === 0 ? `chip-primary-${player.id}` : `badge-claim-${char.id}`}
                        >
                          {char.name}
                          {char.id !== GENERIC_TRAVELLER_ID && <Info className="w-3.5 h-3.5 opacity-60" />}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No claims recorded</p>
                )}
              </div>


              {/* Notes Section */}
              <div ref={notesSectionRef} className="rounded-lg bg-card/30 border border-border/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notes
                  </h3>
                </div>
                <Textarea
                  value={player.notes}
                  onChange={(e) => onSetNotes(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      notesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 350);
                  }}
                  placeholder="Add notes about this player..."
                  className="min-h-[80px] resize-none bg-background/50"
                  data-testid="textarea-notes"
                />
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
                  <TeamBadge team={previewCharacter.team} variant="pill" />
                  <span className="text-amber-400 font-display">{previewCharacter.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Night order & jinx badges */}
                {(() => {
                  const previewJinxes = getJinxesForCharacter(previewCharacter.id);
                  const hasBadges =
                    previewCharacter.firstNightOrder !== null ||
                    previewCharacter.otherNightOrder !== null ||
                    previewJinxes.length > 0;
                  return hasBadges ? (
                    <div className="flex flex-wrap gap-2">
                      <NightBadges char={previewCharacter} />
                      <JinxBadge count={previewJinxes.length} />
                    </div>
                  ) : null;
                })()}

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

                {/* Jinxes */}
                <JinxList char={previewCharacter} jinxes={getJinxesForCharacter(previewCharacter.id)} />

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

/**
 * Candidate chip styling. The primary guess renders as a filled team-colored
 * pill (the existing badge style); alternates render outlined (team text + ring
 * border on a transparent background). Both reuse team-style values; no new
 * colors are introduced here.
 */
function candidateChipClass(team: string, isPrimary: boolean): string {
  if (isPrimary) return teamBadge(team);
  const text = teamCard(team).split(' ').find((c) => c.startsWith('text-')) ?? 'text-foreground';
  return cn('bg-transparent', text, teamRing(team));
}

export function SortablePlayerCard({
  player,
  game,
  seatNumber,
  onSelect,
  onToggleAlive,
  onOpenClaimPicker,
  onRemoveClaim,
}: {
  player: GamePlayer;
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  seatNumber: number;
  onSelect: () => void;
  onToggleAlive: () => void;
  onOpenClaimPicker: () => void;
  onRemoveClaim: (characterId: string) => void;
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

  const claimedChars = player.claims.map(id => resolveClaimDescriptor(id)).filter(Boolean);
  const primaryChar = claimedChars[0] ?? null;
  const hasNotes = player.notes.trim().length > 0;

  const isActive = player.status === 'alive';
  // Gate every dead visual (greyed row, shroud, dagger) on CURRENT status, not
  // on the existence of a death record, so a resurrected player renders as a
  // normal living seat. Matches the circle node's isDead gate.
  const isDead = player.status === 'dead' || player.status === 'exiled';
  const deathRecord = isDead ? latestDeathRecord(game.deathRecords ?? [], player.id) : null;
  const phaseStamp = deathPhaseLabel(deathRecord);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "p-3 cursor-pointer",
        isDead && "opacity-60",
        isDragging && "opacity-80 shadow-lg z-50 scale-[1.02]",
        player.isTraveler && "border-purple-700/50"
      )}
      data-testid={`card-player-${player.id}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="touch-none cursor-grab active:cursor-grabbing flex items-center justify-center w-9 h-9 -ml-1 shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted"
          data-testid={`button-drag-${player.id}`}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <span
          className="shrink-0 mt-1.5 w-5 text-center text-sm font-mono tabular-nums text-muted-foreground"
          data-testid={`text-seat-number-${player.id}`}
        >
          {seatNumber}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="relative shrink-0 mt-0.5"
          title={`View ${player.name}`}
          data-testid={`button-token-${player.id}`}
        >
          {primaryChar ? (
            <CharacterToken
              characterId={primaryChar.id}
              team={primaryChar.team}
              size={40}
              muted={isDead}
              data-testid={`token-list-${player.id}`}
            />
          ) : (
            <span
              className="inline-flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground/60 bg-background/40"
              style={{ width: 40, height: 40 }}
              data-testid={`token-list-${player.id}`}
            >
              <Plus className="w-4 h-4" />
            </span>
          )}
          {isDead && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none flex items-end justify-center overflow-hidden"
              data-testid={`overlay-shroud-${player.id}`}
            >
              <span className="absolute inset-0 rounded-full bg-[#c79fe6]/15 border-2 border-[#3d2f57]" />
              <Skull className="relative mb-0.5 w-3 h-3 text-[#c79fe6]/80" />
            </span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {player.isTraveler && (
              <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 border-purple-700 text-xs shrink-0">
                T
              </Badge>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={cn(
                "font-display font-semibold text-base text-left hover:underline truncate min-w-0",
                isActive ? "text-amber-100" : "text-muted-foreground line-through"
              )}
              data-testid={`button-player-name-${player.id}`}
            >
              {player.name}
            </button>
            {phaseStamp && (
              <span className="text-[#c79fe6] text-sm shrink-0" data-testid={`text-seat-death-${player.id}`}>
                † {phaseStamp}
              </span>
            )}
          </div>

          {claimedChars.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1.5" data-testid={`claims-row-${player.id}`}>
              {claimedChars.map((char, idx) => char && (
                <div
                  key={char.id}
                  className="inline-flex items-center gap-1"
                  data-testid={`chip-candidate-${player.id}-${char.id}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveClaim(char.id); }}
                    className={cn("inline-flex items-center gap-1 text-xs font-sans whitespace-nowrap rounded-full border px-2.5 py-1 font-semibold transition-colors hover:opacity-80", candidateChipClass(char.team, idx === 0))}
                    title={`Remove ${char.name} claim`}
                    data-testid={`button-claim-badge-${char.id}-${player.id}`}
                  >
                    {char.name}
                    <X className="w-3 h-3 opacity-60" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p
              className="mt-1.5 text-xs italic text-muted-foreground/60"
              data-testid={`text-no-guess-${player.id}`}
            >
              no guess yet
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1 h-4">
            {hasNotes && <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onOpenClaimPicker(); }}
              className="flex items-center gap-1 px-2.5 rounded-full border border-dashed border-amber-700/60 text-amber-400 text-xs font-medium hover:bg-amber-900/20 hover:border-amber-600 transition-colors shrink-0 h-9"
              data-testid={`button-add-claim-${player.id}`}
            >
              <Plus className="w-4 h-4" />
              Claim
            </button>
            {!player.isTraveler && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleAlive(); }}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg border transition-colors",
                  isDead
                    ? "bg-red-900/40 border-red-700/60 text-red-400 hover:bg-red-900/60"
                    : "border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                title={isDead ? "Revive player" : "Mark as dead"}
                data-testid={`button-toggle-dead-${player.id}`}
              >
                <Skull className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Pull just the text color token out of the single team-style source. */
function seatRoleTextColor(team: string): string {
  return teamCard(team).split(' ').find((c) => c.startsWith('text-')) ?? 'text-foreground';
}

function CircleNodeContent({
  player,
  nodeSize,
  isOverlay = false,
}: {
  player: GamePlayer;
  nodeSize: number;
  isDragging?: boolean;
  isOverlay?: boolean;
  nameOutside?: boolean;
}) {
  const claims = player.claims ?? [];
  const primaryId = claims?.[0] ?? null;
  const primaryChar = primaryId ? resolveClaimDescriptor(primaryId) : null;
  const extraCount = claims.length > 1 ? claims.length - 1 : 0;
  const isDead = player.status === 'dead' || player.status === 'exiled';

  const tokenSize = Math.round(nodeSize * 0.62);
  const roleName = primaryChar?.name ?? null;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full text-center",
        isOverlay && "shadow-2xl scale-110"
      )}
      style={{ width: nodeSize, height: nodeSize }}
      data-testid={`token-seat-${player.id}`}
    >
      {primaryChar ? (
        <CharacterToken
          characterId={primaryId ?? undefined}
          team={primaryChar.team}
          size={tokenSize}
          muted={isDead}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground/60",
            isDead && "opacity-40"
          )}
          style={{ width: tokenSize, height: tokenSize }}
        >
          <Plus style={{ width: Math.round(tokenSize * 0.45), height: Math.round(tokenSize * 0.45) }} />
        </div>
      )}

      {roleName ? (
        <span
          className={cn(
            "mt-0.5 text-[9px] leading-tight font-medium truncate px-1",
            isDead ? "text-muted-foreground" : seatRoleTextColor(primaryChar?.team ?? 'townsfolk')
          )}
          style={{ maxWidth: nodeSize - 6 }}
          data-testid={`text-seat-role-${player.id}`}
        >
          {roleName.length > 9 ? roleName.slice(0, 8) + '…' : roleName}
        </span>
      ) : (
        <span
          className="mt-0.5 text-[9px] leading-tight italic text-muted-foreground/60 px-1"
          data-testid={`text-seat-noguess-${player.id}`}
        >
          no guess
        </span>
      )}

      {extraCount > 0 && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full border flex items-center justify-center text-[9px] font-semibold leading-none",
            teamBadge(primaryChar?.team ?? 'townsfolk')
          )}
          data-testid={`badge-candidates-${player.id}`}
        >
          +{extraCount}
        </span>
      )}

      {isDead && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none flex items-end justify-center overflow-hidden"
          data-testid={`overlay-shroud-${player.id}`}
        >
          <div className="absolute inset-0 rounded-full bg-[#c79fe6]/15 border-2 border-[#3d2f57]" />
          <Skull
            className="relative mb-1 text-[#c79fe6]/80"
            style={{ width: Math.round(nodeSize * 0.3), height: Math.round(nodeSize * 0.3) }}
          />
        </div>
      )}
    </div>
  );
}

export function CircleSeatingChart({
  players,
  currentDay,
  deathRecords = [],
  onSelectPlayer,
  onReorderPlayers,
  onSetCirclePosition,
  onSetMultipleCirclePositions,
  onResetCirclePositions,
}: {
  players: GamePlayer[];
  currentDay: number;
  deathRecords?: DeathRecord[];
  onSelectPlayer: (playerId: string) => void;
  onReorderPlayers: (activeId: string, overId: string) => void;
  onSetCirclePosition: (playerId: string, x: number, y: number) => void;
  onSetMultipleCirclePositions: (updates: { playerId: string; x: number; y: number }[]) => void;
  onResetCirclePositions: () => void;
}) {
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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
  const nodeSize = playerCount <= 8 ? 76 : playerCount <= 12 ? 66 : playerCount <= 15 ? 56 : 50;
  const radius = Math.min(centerX, centerY) - nodeSize / 2 - 8;

  const getDefaultPosition = (index: number) => {
    const angle = (-90 + (index / playerCount) * 360) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle) - nodeSize / 2,
      y: centerY + radius * Math.sin(angle) - nodeSize / 2,
    };
  };

  const getPlayerPosition = (player: GamePlayer, index: number) => {
    if (player.circleX !== undefined && player.circleY !== undefined) {
      return {
        x: player.circleX * dimensions.width - nodeSize / 2,
        y: player.circleY * dimensions.height - nodeSize / 2,
      };
    }
    return getDefaultPosition(index);
  };

  const getPlayerAngleDeg = (player: GamePlayer, index: number) => {
    const pos = getPlayerPosition(player, index);
    const px = pos.x + nodeSize / 2;
    const py = pos.y + nodeSize / 2;
    const deg = Math.atan2(py - centerY, px - centerX) * (180 / Math.PI);
    return ((deg % 360) + 360) % 360;
  };

  const hasCustomPositions = players.some(p => p.circleX !== undefined);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setDragDelta({ x: 0, y: 0 });
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleDragMove = (event: { delta: { x: number; y: number } }) => {
    setDragDelta(event.delta);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const playerId = active.id as string;
    const playerIndex = players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      setActiveId(null);
      setDragDelta({ x: 0, y: 0 });
      return;
    }

    const hasMoved = Math.abs(delta.x) > 3 || Math.abs(delta.y) > 3;
    if (hasMoved) {
      const currentPos = getPlayerPosition(players[playerIndex], playerIndex);
      const newCenterX = currentPos.x + nodeSize / 2 + delta.x;
      const newCenterY = currentPos.y + nodeSize / 2 + delta.y;
      const clampedX = Math.max(0, Math.min(1, newCenterX / dimensions.width));
      const clampedY = Math.max(0, Math.min(1, newCenterY / dimensions.height));

      const minDist = nodeSize * 0.8;
      const updates: { playerId: string; x: number; y: number }[] = [
        { playerId, x: clampedX, y: clampedY },
      ];

      players.forEach((other, i) => {
        if (other.id === playerId) return;
        const otherPos = getPlayerPosition(other, i);
        const otherCenterX = otherPos.x + nodeSize / 2;
        const otherCenterY = otherPos.y + nodeSize / 2;
        const dx = otherCenterX - newCenterX;
        const dy = otherCenterY - newCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
          const angle = dist > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
          const pushDist = (minDist * 1.2 - dist);
          const nudgedX = (otherCenterX + Math.cos(angle) * pushDist) / dimensions.width;
          const nudgedY = (otherCenterY + Math.sin(angle) * pushDist) / dimensions.height;
          updates.push({
            playerId: other.id,
            x: Math.max(0, Math.min(1, nudgedX)),
            y: Math.max(0, Math.min(1, nudgedY)),
          });
        }
      });

      if (updates.length > 1) {
        onSetMultipleCirclePositions(updates);
      } else {
        onSetCirclePosition(playerId, clampedX, clampedY);
      }
    }

    setActiveId(null);
    setDragDelta({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center pt-4 pb-4 px-2">
      {hasCustomPositions && (
        <button
          onClick={onResetCirclePositions}
          className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 hover:border-amber-600/60 mb-2 transition-colors"
          data-testid="reset-circle-layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Circle Up
        </button>
      )}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          className="relative overflow-visible"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {players.map((player, index) => {
            const pos = getPlayerPosition(player, index);
            const isBeingDragged = activeId === player.id;
            const displayX = isBeingDragged ? pos.x + dragDelta.x : pos.x;
            const displayY = isBeingDragged ? pos.y + dragDelta.y : pos.y;
            const angleDeg = getPlayerAngleDeg(player, index);
            const deathRecord = latestDeathRecord(deathRecords, player.id);

            return (
              <DraggableCircleNode
                key={player.id}
                player={player}
                position={{ x: displayX, y: displayY }}
                nodeSize={nodeSize}
                onSelectPlayer={onSelectPlayer}
                isDragging={isBeingDragged}
                angleDeg={angleDeg}
                deathRecord={deathRecord}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

function DraggableCircleNode({
  player,
  position,
  nodeSize,
  onSelectPlayer,
  isDragging,
  angleDeg,
  deathRecord = null,
}: {
  player: GamePlayer;
  position: { x: number; y: number };
  nodeSize: number;
  onSelectPlayer: (playerId: string) => void;
  isDragging: boolean;
  angleDeg: number;
  deathRecord?: DeathRecord | null;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: player.id,
  });

  const isBottom = angleDeg > 0 && angleDeg < 180;
  const isActive = player.status === 'alive';
  const displayName = player.name.length > 9 ? player.name.slice(0, 8) + '…' : player.name;
  const phaseStamp = deathPhaseLabel(deathRecord);

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onSelectPlayer(player.id)}
      className={cn(
        "absolute touch-none z-10",
        isDragging && "z-30",
        !isDragging && "hover-elevate active-elevate-2"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: nodeSize,
        height: nodeSize,
        transition: isDragging ? 'none' : 'left 200ms ease, top 200ms ease',
        transform: isDragging ? 'scale(1.15)' : 'scale(1)',
        borderRadius: '50%',
        boxShadow: isDragging ? '0 0 8px 3px rgba(201, 162, 39, 0.7), 0 0 20px 6px rgba(201, 162, 39, 0.35)' : 'none',
      }}
      data-testid={`circle-node-${player.id}`}
    >
      <span
        className={cn(
          "absolute left-1/2 -translate-x-1/2 font-display text-[11px] font-medium whitespace-nowrap pointer-events-none",
          !isActive && "text-muted-foreground line-through",
          isActive && "text-foreground"
        )}
        style={isBottom ? { top: nodeSize + 2 } : { bottom: nodeSize + 2 }}
      >
        {displayName}
        {phaseStamp && (
          <span className="ml-1 text-[#c79fe6]" data-testid={`text-seat-death-${player.id}`}>
            † {phaseStamp}
          </span>
        )}
      </span>
      <CircleNodeContent
        player={player}
        nodeSize={nodeSize}
        isDragging={isDragging}
        nameOutside={true}
      />
    </button>
  );
}

export function GameTrackerView({
  game,
  onEndGame,
  onPlayAgain,
  onToggleAlive,
  onSetPlayerStatus,
  onAddClaim,
  onAddMultipleClaims,
  onRemoveClaim,
  onSetNotes,
  onUpdatePlayerName,
  onAdvancePhase,
  onRegressPhase,
  onReorderPlayers,
  onReversePlayers,
  onClearScript,
  onSetScript,
  onAddTraveler,
  onConvertToTraveler,
  onRemoveTraveler,
  onSetGameNotes,
  onAddNotebookNote,
  onRemoveNotebookNote,
  onAddPlayer,
  onRemovePlayer,
  onSetCirclePosition,
  onSetMultipleCirclePositions,
  onResetCirclePositions,
}: {
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  onEndGame: () => void;
  onPlayAgain: () => void;
  onToggleAlive: (playerId: string) => void;
  onSetPlayerStatus: (playerId: string, status: PlayerStatus) => void;
  onAddClaim: (playerId: string, characterId: string) => void;
  onAddMultipleClaims: (playerId: string, characterIds: string[]) => void;
  onRemoveClaim: (playerId: string, characterId: string) => void;
  onSetNotes: (playerId: string, notes: string) => void;
  onUpdatePlayerName: (playerId: string, name: string) => void;
  onAdvancePhase: () => void;
  onRegressPhase: () => void;
  onReorderPlayers: (activeId: string, overId: string) => void;
  onReversePlayers: () => void;
  onClearScript: () => void;
  onSetScript: (scriptRef: GameScriptRef | null) => void;
  onAddTraveler: (name: string, initialClaims?: string[]) => void;
  onConvertToTraveler: (playerId: string) => void;
  onRemoveTraveler: (playerId: string) => void;
  onSetGameNotes: (notes: string) => void;
  onAddNotebookNote: (text: string) => void;
  onRemoveNotebookNote: (id: string) => void;
  onAddPlayer: (name: string, insertAfterPlayerId: string | null) => void;
  onRemovePlayer: (playerId: string) => void;
  onSetCirclePosition: (playerId: string, x: number, y: number) => void;
  onSetMultipleCirclePositions: (updates: { playerId: string; x: number; y: number }[]) => void;
  onResetCirclePositions: () => void;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showPlayAgainConfirm, setShowPlayAgainConfirm] = useState(false);
  const [showAddTravelerDialog, setShowAddTravelerDialog] = useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [scriptPopoverOpen, setScriptPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'circle' | 'log' | 'script'>('list');
  const [selectedSheetCharId, setSelectedSheetCharId] = useState<string | null>(null);
  const [scoreboardCollapsed, setScoreboardCollapsed] = useState(false);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [playerFilter, setPlayerFilter] = useState<'all' | 'alive' | 'dead'>('all');
  const [claimPickerPlayerId, setClaimPickerPlayerId] = useState<string | null>(null);
  const { getScriptById, isLoading: scriptsLoading, allScripts, addCustomScript, updateCustomScript, customScripts } = useLocalScripts();
  
  const resolvedScript = game.script ? getScriptById(game.script.id) : null;
  const scriptCharacterIds = useMemo(
    () =>
      resolvedScript
        ? resolveScriptCharacters(resolvedScript, {
            includeTravellers: false,
            includeFabled: false,
          }).map(c => c.id)
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedScript?.id, resolvedScript?.characterIds],
  );
  const sheetCharacters = useMemo(
    () =>
      resolvedScript
        ? resolveScriptCharacters(resolvedScript, {
            includeTravellers: false,
            includeFabled: false,
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedScript?.id, resolvedScript?.characterIds],
  );
  const selectedSheetChar = selectedSheetCharId ? getCharacterById(selectedSheetCharId) ?? null : null;

  useEffect(() => {
    if (!scriptsLoading && game.script && !resolvedScript) {
      onClearScript();
    }
  }, [scriptsLoading, game.script, resolvedScript, onClearScript]);

  // Reset any open sheet selection when leaving the Script tab or switching
  // scripts, so the drawer never shows stale content from a prior context.
  useEffect(() => {
    if (activeTab !== 'script') {
      setSelectedSheetCharId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    setSelectedSheetCharId(null);
  }, [resolvedScript?.id]);

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

  const handleAdvancePhase = () => {
    onAdvancePhase();
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

  // Phase spine: Night N = (day N, 'night'), Day N = (day N, 'day').
  const isNight = game.phase === 'night';
  const phaseLabel = (day: number, phase: 'day' | 'night') =>
    phase === 'day' ? `Day ${day}` : `Night ${day}`;
  const currentPhaseLabel = phaseLabel(game.currentDay, game.phase);
  // The chapter before the current one (null at Night 1, the start of time).
  const prevChapter = isNight
    ? (game.currentDay > 1 ? { day: game.currentDay - 1, phase: 'day' as const } : null)
    : { day: game.currentDay, phase: 'night' as const };
  // The chapter after the current one.
  const nextChapter = isNight
    ? { day: game.currentDay, phase: 'day' as const }
    : { day: game.currentDay + 1, phase: 'night' as const };

  // Filter players based on current filter
  const filteredPlayers = useMemo(() => {
    if (playerFilter === 'alive') {
      return game.players.filter(p => p.status === 'alive');
    } else if (playerFilter === 'dead') {
      return game.players.filter(p => p.status !== 'alive');
    }
    return game.players;
  }, [game.players, playerFilter]);

  // Toggle filter on tap
  const toggleFilter = (filter: 'alive' | 'dead') => {
    setPlayerFilter(prev => prev === filter ? 'all' : filter);
  };

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
                      {script.isCommunity ? (
                        <Users className="w-3.5 h-3.5 text-teal-500/70" />
                      ) : script.isOfficial ? (
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
          <DropdownMenu onOpenChange={(open) => { if (!open) setConfirmEnd(false); }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-overflow-menu">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onInteractOutside={(e) => { if (confirmEnd) e.preventDefault(); }}
              onEscapeKeyDown={(e) => { if (confirmEnd) e.preventDefault(); }}
            >
              {confirmEnd ? (
                <>
                  <DropdownMenuItem
                    onSelect={(e) => { e.preventDefault(); setConfirmEnd(false); }}
                    data-testid="button-cancel-end"
                  >
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
                    onClick={() => setShowAddTravelerDialog(true)}
                    data-testid="button-add-traveler-menu"
                  >
                    <Theater className="w-4 h-4 mr-2" />
                    Add Traveler
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
                    onSelect={(e) => { e.preventDefault(); setConfirmEnd(true); }}
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

        {scoreboardCollapsed && (
          <button
            onClick={() => setScoreboardCollapsed(false)}
            className="flex items-center justify-between w-full px-3 py-2 border-b border-border hover-elevate"
            data-testid="button-expand-scoreboard"
          >
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                {isNight ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className={cn("font-sans font-medium", isNight ? "text-indigo-300" : "text-amber-400")}>{currentPhaseLabel}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-emerald-400 font-medium">{aliveCount}A</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-red-400/80 font-medium">{deadCount}D</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <div className={cn(scoreboardCollapsed && "hidden")}>
        {/* Phase Spine - prev chapter, current phase, next chapter */}
        <div
          className={cn(
            "flex items-stretch justify-between gap-1.5 px-2 py-2.5 border-b border-border",
            isNight ? "bg-indigo-950/20" : "bg-amber-950/10"
          )}
        >
          {/* Previous chapter pill (hidden at Night 1, the start of time) */}
          {prevChapter ? (
            <Button
              variant="outline"
              onClick={onRegressPhase}
              className="flex items-center gap-1 px-2 h-10 min-w-0"
              data-testid="button-phase-prev"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              {prevChapter.phase === 'night' ? (
                <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-xs font-sans text-muted-foreground whitespace-nowrap">{phaseLabel(prevChapter.day, prevChapter.phase)}</span>
            </Button>
          ) : (
            <div className="w-[44px] shrink-0" aria-hidden="true" />
          )}

          {/* Current phase pill */}
          <div
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-10 px-2 border rounded-md min-w-0",
              isNight
                ? "bg-indigo-900/30 border-indigo-700/40"
                : "bg-amber-900/30 border-amber-700/30"
            )}
            data-testid="text-phase-current"
          >
            {isNight ? (
              <Moon className="w-5 h-5 text-indigo-300 shrink-0" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span className={cn("font-sans text-lg truncate", isNight ? "text-indigo-200" : "text-amber-400")}>{currentPhaseLabel}</span>
          </div>

          {/* Next chapter pill */}
          <Button
            variant="outline"
            onClick={handleAdvancePhase}
            className="flex items-center gap-1 px-2 h-10 min-w-0"
            data-testid="button-phase-next"
          >
            <span className="text-xs font-sans text-muted-foreground whitespace-nowrap">{phaseLabel(nextChapter.day, nextChapter.phase)}</span>
            {nextChapter.phase === 'night' ? (
              <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Button>
        </div>

        {/* Night context line. Days have no special banner. */}
        {isNight && (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-border text-base text-indigo-300/80" data-testid="text-night-context">
            <Moon className="w-4 h-4 shrink-0" />
            <span>Night falls. Mark any deaths, then move to the day.</span>
          </div>
        )}

        {/* Role Count */}
        {(() => {
          const roleBreakdown = getBreakdown(regularPlayers.length);
          return (
            <div className="flex items-center justify-center gap-1.5 px-4 py-2 border-b border-border text-sm flex-wrap" data-testid="section-role-count">
              <span className="text-blue-400 font-medium" data-testid="text-townsfolk-count">{roleBreakdown.townsfolk} Townsfolk</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-green-400 font-medium" data-testid="text-outsiders-count">{roleBreakdown.outsiders} Outsider{roleBreakdown.outsiders !== 1 ? 's' : ''}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-red-400 font-medium" data-testid="text-minions-count">{roleBreakdown.minions} Minion{roleBreakdown.minions !== 1 ? 's' : ''}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-red-700 font-medium" data-testid="text-demon-count">{roleBreakdown.demons} Demon{roleBreakdown.demons !== 1 ? 's' : ''}</span>
              {travelers.length > 0 && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-purple-400 font-medium" data-testid="text-travelers-count">{travelers.length} Traveler{travelers.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          );
        })()}

        {/* Core Action Zone - Alive/Dead filters */}
        <div className="grid grid-cols-2 gap-3 px-3 py-3 border-b border-border">
          {/* Alive - Interactive Filter */}
          <Button
            variant="outline"
            onClick={() => toggleFilter('alive')}
            className={cn(
              "flex flex-col items-center h-auto py-3 toggle-elevate",
              playerFilter === 'alive' && "toggle-elevated bg-emerald-500/20 border-emerald-500/50"
            )}
            data-testid="filter-alive"
          >
            <span className="text-3xl font-sans font-bold text-emerald-400 tabular-nums">{aliveCount}</span>
            <span className="text-xs font-sans text-muted-foreground uppercase tracking-wide">Alive</span>
          </Button>

          {/* Dead - Interactive Filter */}
          <Button
            variant="outline"
            onClick={() => toggleFilter('dead')}
            className={cn(
              "flex flex-col items-center h-auto py-3 toggle-elevate",
              playerFilter === 'dead' && "toggle-elevated bg-red-500/20 border-red-500/50"
            )}
            data-testid="filter-dead"
          >
            <span className="text-3xl font-sans font-bold text-red-400/80 tabular-nums">{deadCount}</span>
            <span className="text-xs font-sans text-muted-foreground uppercase tracking-wide">Dead</span>
          </Button>
        </div>

        {/* Traveler Row - Conditional */}
        {travelers.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap px-3 py-2 border-t border-border bg-purple-950/20">
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

        </div>

      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReversePlayers}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
              data-testid="button-reverse-order"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              Reverse Order
            </Button>
          </div>
          <SortableContext items={filteredPlayers.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlayers.map((player) => (
                <SortablePlayerCard
                  key={player.id}
                  player={player}
                  game={game}
                  seatNumber={game.players.findIndex(p => p.id === player.id) + 1}
                  onSelect={() => setSelectedPlayerId(player.id)}
                  onToggleAlive={() => onToggleAlive(player.id)}
                  onOpenClaimPicker={() => setClaimPickerPlayerId(player.id)}
                  onRemoveClaim={(charId) => onRemoveClaim(player.id, charId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {activeTab === 'circle' && (
        <CircleSeatingChart
          players={game.players}
          currentDay={game.currentDay}
          deathRecords={game.deathRecords ?? []}
          onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
          onReorderPlayers={onReorderPlayers}
          onSetCirclePosition={onSetCirclePosition}
          onSetMultipleCirclePositions={onSetMultipleCirclePositions}
          onResetCirclePositions={onResetCirclePositions}
        />
      )}
      
      {activeTab === 'log' && (
        <InlineGameLog
          game={game}
          onUpdateGameNotes={onSetGameNotes}
          onAddNotebookNote={onAddNotebookNote}
          onRemoveNotebookNote={onRemoveNotebookNote}
        />
      )}

      {activeTab === 'script' && (
        resolvedScript ? (
          <ScriptSheet
            characters={sheetCharacters}
            scriptName={resolvedScript.name}
            onCharacterSelect={(id) => setSelectedSheetCharId(id)}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground" data-testid="text-script-nudge-game">
            Pick a script to see the full character sheet.
          </div>
        )
      )}

      {/* Bottom Navigation - thumb-reachable view switcher */}
      <nav
        className="sticky bottom-0 z-40 mt-2 grid grid-cols-4 gap-1 rounded-t-xl border-t border-border bg-background/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        data-testid="nav-tracker"
      >
        {([
          { tab: 'circle', label: 'Grim', icon: Users, testId: 'nav-grim', collapse: true },
          { tab: 'list', label: 'List', icon: LayoutList, testId: 'nav-list', collapse: false },
          { tab: 'log', label: 'Notebook', icon: NotebookText, testId: 'nav-notebook', collapse: false },
          { tab: 'script', label: 'Script', icon: ScrollText, testId: 'nav-script', collapse: true },
        ] as const).map(({ tab, label, icon: Icon, testId, collapse }) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setScoreboardCollapsed(collapse); }}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-sans font-medium transition-colors",
              activeTab === tab
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            data-testid={testId}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <Drawer
        open={!!selectedSheetChar}
        onOpenChange={(open) => { if (!open) setSelectedSheetCharId(null); }}
      >
        <DrawerContent
          className="max-h-[85vh]"
          data-testid={selectedSheetChar ? `drawer-character-${selectedSheetChar.id}` : undefined}
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>{selectedSheetChar?.name ?? "Character"}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">
            {selectedSheetChar && (
              <CharacterCard char={selectedSheetChar} isExpanded onToggle={() => {}} />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <PlayerDetailDrawer
        player={selectedPlayer}
        players={game.players}
        onClose={() => setSelectedPlayerId(null)}
        onToggleAlive={() => selectedPlayerId && onToggleAlive(selectedPlayerId)}
        onSetPlayerStatus={(status) => selectedPlayerId && onSetPlayerStatus(selectedPlayerId, status)}
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

      <AddTravelerDialog
        open={showAddTravelerDialog}
        onClose={() => setShowAddTravelerDialog(false)}
        onAddTraveler={onAddTraveler}
      />

      <AddPlayerDialog
        open={showAddPlayerDialog}
        onClose={() => setShowAddPlayerDialog(false)}
        onAddPlayer={onAddPlayer}
        players={game.players}
      />

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

      {claimPickerPlayerId && (
        <CharacterPicker
          open={!!claimPickerPlayerId}
          onClose={() => setClaimPickerPlayerId(null)}
          onSelect={(characterIds) => {
            onAddMultipleClaims(claimPickerPlayerId, characterIds);
            setClaimPickerPlayerId(null);
          }}
          excludeIds={game.players.find(p => p.id === claimPickerPlayerId)?.claims || []}
          scriptCharacterIds={scriptCharacterIds}
        />
      )}

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
    setNotes,
    advancePhase,
    regressPhase,
    reorderPlayers,
    reversePlayers,
    clearScript,
    setScript,
    addTraveler,
    convertToTraveler,
    removeTraveler,
    setGameNotes,
    addNotebookNote,
    removeNotebookNote,
    addPlayer,
    removePlayer,
    setCirclePosition,
    setMultipleCirclePositions,
    resetCirclePositions,
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
          onAddClaim={addClaim}
          onAddMultipleClaims={addMultipleClaims}
          onRemoveClaim={removeClaim}
          onSetNotes={setNotes}
          onUpdatePlayerName={updatePlayerName}
          onAdvancePhase={advancePhase}
          onRegressPhase={regressPhase}
          onReorderPlayers={reorderPlayers}
          onReversePlayers={reversePlayers}
          onClearScript={clearScript}
          onSetScript={setScript}
          onAddTraveler={addTraveler}
          onConvertToTraveler={convertToTraveler}
          onRemoveTraveler={removeTraveler}
          onSetGameNotes={setGameNotes}
          onAddNotebookNote={addNotebookNote}
          onRemoveNotebookNote={removeNotebookNote}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onSetCirclePosition={setCirclePosition}
          onSetMultipleCirclePositions={setMultipleCirclePositions}
          onResetCirclePositions={resetCirclePositions}
        />
      )}
    </Layout>
  );
}

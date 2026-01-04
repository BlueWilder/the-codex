import { Layout } from "@/components/ui/Layout";
import { useState, useMemo } from "react";
import { usePlayerGame, getBreakdown, type GamePlayer, type Nomination, type PlayerVote } from "@/hooks/use-player-game";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { Users, ChevronRight, Play, Skull, X, Plus, Check, Hand, Search, Sun, Moon, ChevronUp, ChevronDown, FileText, Theater, Vote, Loader2, Ghost, GripVertical, UserPlus, ArrowRight, Target, Scale } from "lucide-react";
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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TEAM_COLORS: Record<string, string> = {
  townsfolk: "bg-blue-900/60 text-blue-200 border-blue-700",
  outsider: "bg-teal-900/60 text-teal-200 border-teal-700",
  minion: "bg-orange-900/60 text-orange-200 border-orange-700",
  demon: "bg-red-900/60 text-red-200 border-red-700",
  traveler: "bg-purple-900/60 text-purple-200 border-purple-700",
};

function SetupWizard({ onStart }: { onStart: (count: number, names: string[]) => void }) {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(8);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  const breakdown = getBreakdown(playerCount);

  const handleCountConfirm = () => {
    setPlayerNames(Array(playerCount).fill("").map((_, i) => `Player ${i + 1}`));
    setStep(2);
  };

  const handleNameChange = (index: number, name: string) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-display text-amber-500 mb-8 text-center">New Game</h1>

      <div className="flex items-center justify-center mb-8 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors",
              step === i ? "bg-amber-600 border-amber-600 text-black" :
              step > i ? "bg-amber-900/40 border-amber-600 text-amber-500" :
              "bg-transparent border-muted text-muted-foreground"
            )}>
              {i}
            </div>
            {i < 2 && <div className={cn("w-12 h-0.5 mx-2", step > i ? "bg-amber-800" : "bg-muted")} />}
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
                    placeholder={`Player ${i + 1}`}
                    data-testid={`input-player-name-${i}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} data-testid="button-back">
                Back
              </Button>
              <Button onClick={() => onStart(playerCount, playerNames)} data-testid="button-start-game">
                <Play className="w-4 h-4 mr-2" /> Start Game
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function CharacterPicker({ 
  open, 
  onClose, 
  onSelect,
  excludeIds = []
}: { 
  open: boolean; 
  onClose: () => void; 
  onSelect: (characterId: string) => void;
  excludeIds?: string[];
}) {
  const [search, setSearch] = useState("");

  const filteredCharacters = useMemo(() => {
    const term = search.toLowerCase();
    return ALL_CHARACTERS.filter(c => 
      !excludeIds.includes(c.id) &&
      (c.name.toLowerCase().includes(term) || c.team.toLowerCase().includes(term))
    ).sort((a, b) => {
      const teamOrder = { townsfolk: 0, outsider: 1, minion: 2, demon: 3, traveler: 4 };
      return (teamOrder[a.team] || 5) - (teamOrder[b.team] || 5) || a.name.localeCompare(b.name);
    });
  }, [search, excludeIds]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0">
        <div className="flex flex-col max-h-[70vh] overflow-hidden p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-amber-500">Select Character</DialogTitle>
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
              {filteredCharacters.map(char => (
                <button
                  key={char.id}
                  onClick={() => { onSelect(char.id); onClose(); setSearch(""); }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3",
                    "hover-elevate active-elevate-2",
                    TEAM_COLORS[char.team]
                  )}
                  data-testid={`button-select-character-${char.id}`}
                >
                  <span className="font-medium">{char.name}</span>
                  <span className="text-xs opacity-70 capitalize ml-auto">{char.team}</span>
                </button>
              ))}
              {filteredCharacters.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No characters found</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlayerDetailDrawer({
  player,
  players,
  nominations,
  onClose,
  onToggleAlive,
  onToggleGhostVote,
  onAddClaim,
  onRemoveClaim,
  onSetNotes,
}: {
  player: GamePlayer | null;
  players: GamePlayer[];
  nominations: Nomination[];
  onClose: () => void;
  onToggleAlive: () => void;
  onToggleGhostVote: () => void;
  onAddClaim: (characterId: string) => void;
  onRemoveClaim: (characterId: string) => void;
  onSetNotes: (notes: string) => void;
}) {
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);

  if (!player) return null;

  const claimedCharacters = player.claims.map(id => ALL_CHARACTERS.find(c => c.id === id)).filter(Boolean);
  
  const playerNominations = nominations.filter(n => 
    n.nomineeId === player.id || n.nominatorId === player.id || n.votes.some(v => v.playerId === player.id)
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
              <div className="flex items-center gap-3">
                {!player.isAlive && <Skull className="w-5 h-5 text-muted-foreground" />}
                <DrawerTitle className="font-display text-xl text-amber-500">{player.name}</DrawerTitle>
                <Badge variant={player.isAlive ? "default" : "secondary"} className={player.isAlive ? "bg-emerald-900/50 text-emerald-300" : ""}>
                  {player.isAlive ? "Alive" : "Dead"}
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1",
                    player.isAlive
                      ? "border-red-800 text-red-400 hover:bg-red-950/30"
                      : "border-emerald-800 text-emerald-400 hover:bg-emerald-950/30"
                  )}
                  onClick={onToggleAlive}
                  data-testid="button-toggle-alive"
                >
                  <Skull className="w-4 h-4 mr-2" />
                  {player.isAlive ? "Mark as Dead" : "Mark as Alive"}
                </Button>
                {!player.isAlive && (
                  <Button
                    variant="outline"
                    className={cn(
                      player.hasGhostVote
                        ? "border-purple-800 text-purple-400 hover:bg-purple-950/30"
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

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notes
                  </h3>
                </div>
                <Textarea
                  value={player.notes}
                  onChange={(e) => onSetNotes(e.target.value)}
                  placeholder="Add notes about this player..."
                  className="min-h-[100px] resize-none"
                  data-testid="textarea-notes"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Theater className="w-4 h-4" /> Claims
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowCharacterPicker(true)} data-testid="button-add-claim">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                {claimedCharacters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {claimedCharacters.map(char => char && (
                      <Badge
                        key={char.id}
                        className={cn("cursor-pointer gap-1", TEAM_COLORS[char.team])}
                        onClick={() => onRemoveClaim(char.id)}
                        data-testid={`badge-claim-${char.id}`}
                      >
                        {char.name}
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No claims recorded</p>
                )}
              </div>

              <div className="space-y-3">
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
                          const playerVote = nom.votes.find(v => v.playerId === player.id);
                          const votesFor = nom.votes.filter(v => v.voted).length;
                          
                          return (
                            <div key={nom.id} className="text-sm pl-2 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-amber-400">{nominee?.name}</span>
                                <span className="text-muted-foreground">nominated by</span>
                                <span className="text-purple-400">{nominator?.name}</span>
                                <Badge variant="secondary" className="text-xs">{votesFor} votes</Badge>
                              </div>
                              {nom.nomineeId === player.id && (
                                <div className="flex items-center gap-1 text-amber-400">
                                  <Theater className="w-3 h-3" /> Was nominated
                                </div>
                              )}
                              {nom.nominatorId === player.id && (
                                <div className="flex items-center gap-1 text-purple-400">
                                  <UserPlus className="w-3 h-3" /> Made nomination
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
            </div>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <CharacterPicker
        open={showCharacterPicker}
        onClose={() => setShowCharacterPicker(false)}
        onSelect={onAddClaim}
        excludeIds={player.claims}
      />
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4",
        !player.isAlive && "opacity-60",
        isDragging && "opacity-80 shadow-lg z-50 scale-[1.02]"
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
          {!player.isAlive && <Skull className="w-4 h-4 text-muted-foreground" />}
          <button
            onClick={onSelect}
            className={cn(
              "font-bold text-lg text-left hover:underline",
              player.isAlive ? "text-amber-100" : "text-muted-foreground line-through"
            )}
          >
            {player.name}
          </button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {!player.isAlive && player.hasGhostVote && (
            <Ghost className="w-5 h-5 text-purple-400" data-testid={`icon-ghost-vote-${player.id}`} />
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
              <Theater className="w-3.5 h-3.5" />
              {nominationsReceived}
            </span>
          )}
          {nominationsMade > 0 && (
            <span className="flex items-center gap-1 text-purple-400" data-testid={`text-nominations-made-${player.id}`}>
              <UserPlus className="w-3.5 h-3.5" />
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
}: {
  open: boolean;
  onClose: () => void;
  players: GamePlayer[];
  hasBeenNominatedToday: (playerId: string) => boolean;
  hasNominatedToday: (playerId: string) => boolean;
  onCreateNomination: (nomineeId: string, nominatorId: string, votes: PlayerVote[]) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nomineeId, setNomineeId] = useState<string | null>(null);
  const [nominatorId, setNominatorId] = useState<string | null>(null);
  const [selectedVoters, setSelectedVoters] = useState<Set<string>>(new Set());

  const reset = () => {
    setStep(1);
    setNomineeId(null);
    setNominatorId(null);
    setSelectedVoters(new Set());
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

  const handleSubmit = () => {
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

  const eligibleNominees = players.filter(p => p.isAlive && !hasBeenNominatedToday(p.id));
  const eligibleNominators = players.filter(p => p.isAlive && !hasNominatedToday(p.id) && p.id !== nomineeId);
  const eligibleVoters = players.filter(p => p.isAlive || p.hasGhostVote);
  const nominee = players.find(p => p.id === nomineeId);
  const nominator = players.find(p => p.id === nominatorId);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-amber-500">
            {step === 1 && "Select Nominee"}
            {step === 2 && "Select Nominator"}
            {step === 3 && "Record Votes"}
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
              {eligibleVoters.map(player => (
                <label
                  key={player.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedVoters.has(player.id)
                      ? "bg-emerald-950/30 border-emerald-800"
                      : "bg-card border-border hover:bg-muted/50"
                  )}
                  data-testid={`label-voter-${player.id}`}
                >
                  <Checkbox
                    checked={selectedVoters.has(player.id)}
                    onCheckedChange={() => handleToggleVoter(player.id)}
                    data-testid={`checkbox-voter-${player.id}`}
                  />
                  <span className={cn(
                    "flex-1",
                    !player.isAlive && "text-muted-foreground"
                  )}>
                    {player.name}
                    {!player.isAlive && player.hasGhostVote && (
                      <Ghost className="w-4 h-4 inline ml-2 text-purple-400" />
                    )}
                  </span>
                  {selectedVoters.has(player.id) && (
                    <Hand className="w-4 h-4 text-emerald-500" />
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit} data-testid="button-confirm-nomination">
                <Check className="w-4 h-4 mr-2" />
                Confirm ({selectedVoters.size} votes)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GameTrackerView({
  game,
  onEndGame,
  onToggleAlive,
  onToggleGhostVote,
  onAddClaim,
  onRemoveClaim,
  onSetNotes,
  onNextDay,
  onPrevDay,
  onReorderPlayers,
  hasBeenNominatedToday,
  hasNominatedToday,
  onCreateNomination,
}: {
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  onEndGame: () => void;
  onToggleAlive: (playerId: string) => void;
  onToggleGhostVote: (playerId: string) => void;
  onAddClaim: (playerId: string, characterId: string) => void;
  onRemoveClaim: (playerId: string, characterId: string) => void;
  onSetNotes: (playerId: string, notes: string) => void;
  onNextDay: () => void;
  onPrevDay: () => void;
  onReorderPlayers: (activeId: string, overId: string) => void;
  hasBeenNominatedToday: (playerId: string) => boolean;
  hasNominatedToday: (playerId: string) => boolean;
  onCreateNomination: (nomineeId: string, nominatorId: string, votes: PlayerVote[]) => void;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showNominationDialog, setShowNominationDialog] = useState(false);

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

  const selectedPlayer = game.players.find(p => p.id === selectedPlayerId) || null;
  const playerCount = game.players.length;
  const aliveCount = game.players.filter(p => p.isAlive).length;
  const deadCount = playerCount - aliveCount;
  const votesNeeded = Math.ceil(aliveCount / 2);
  const ghostVotesAvailable = game.players.filter(p => !p.isAlive && p.hasGhostVote).length;
  const totalVotesAvailable = aliveCount + ghostVotesAvailable;
  const todayNominations = game.nominations.filter(n => n.day === game.currentDay);
  const canExecute = totalVotesAvailable >= votesNeeded;

  return (
    <div className="space-y-4">
      {/* Scoreboard Header */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Day Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1 flex-wrap">
            <Button size="icon" variant="ghost" onClick={onPrevDay} disabled={game.currentDay <= 1} data-testid="button-prev-day">
              <ChevronDown className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="font-display text-amber-500 text-lg">DAY {game.currentDay}</span>
            </div>
            <Button size="icon" variant="ghost" onClick={onNextDay} data-testid="button-next-day">
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            {confirmEnd ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(false)} data-testid="button-cancel-end">Cancel</Button>
                <Button variant="destructive" size="sm" onClick={onEndGame} data-testid="button-confirm-end">End</Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(true)} data-testid="button-end-game">
                End Game
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {/* Alive */}
          <div className="p-3 text-center border-r border-b sm:border-b-0 border-border">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">{aliveCount}</div>
            <div className="text-xs text-muted-foreground">Alive</div>
          </div>

          {/* Dead */}
          <div className="p-3 text-center border-b sm:border-b-0 sm:border-r border-border">
            <div className="flex items-center justify-center gap-1 text-red-500/70 mb-1">
              <Skull className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-400/80 tabular-nums">{deadCount}</div>
            <div className="text-xs text-muted-foreground">Dead</div>
          </div>

          {/* Votes to Execute */}
          <div className="p-3 text-center border-r border-border">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 tabular-nums">{votesNeeded}</div>
            <div className="text-xs text-muted-foreground">To Exec</div>
          </div>

          {/* Available Votes */}
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
              <Hand className="w-4 h-4" />
            </div>
            <div className={cn(
              "text-xl sm:text-2xl font-bold tabular-nums",
              canExecute ? "text-purple-400" : "text-red-400"
            )}>{totalVotesAvailable}</div>
            <div className="text-xs text-muted-foreground">Can Vote</div>
          </div>
        </div>

        {/* Today's Activity & Nominate Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2 sm:gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-500/70" />
              <span className="font-semibold text-amber-400">{todayNominations.length}</span>
              <span className="text-muted-foreground">nom</span>
            </div>
            {ghostVotesAvailable > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Ghost className="w-3 h-3" />
                <span className="text-xs">{ghostVotesAvailable} ghost</span>
              </div>
            )}
          </div>
          <Button onClick={() => setShowNominationDialog(true)} data-testid="button-nominate">
            <UserPlus className="w-4 h-4 mr-2" />
            Nominate
          </Button>
        </div>
      </div>

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

      <PlayerDetailDrawer
        player={selectedPlayer}
        players={game.players}
        nominations={game.nominations}
        onClose={() => setSelectedPlayerId(null)}
        onToggleAlive={() => selectedPlayerId && onToggleAlive(selectedPlayerId)}
        onToggleGhostVote={() => selectedPlayerId && onToggleGhostVote(selectedPlayerId)}
        onAddClaim={(charId) => selectedPlayerId && onAddClaim(selectedPlayerId, charId)}
        onRemoveClaim={(charId) => selectedPlayerId && onRemoveClaim(selectedPlayerId, charId)}
        onSetNotes={(notes) => selectedPlayerId && onSetNotes(selectedPlayerId, notes)}
      />

      <NominationDialog
        open={showNominationDialog}
        onClose={() => setShowNominationDialog(false)}
        players={game.players}
        hasBeenNominatedToday={hasBeenNominatedToday}
        hasNominatedToday={hasNominatedToday}
        onCreateNomination={onCreateNomination}
      />
    </div>
  );
}

export default function Game() {
  const {
    game,
    isLoading,
    createGame,
    endGame,
    addClaim,
    removeClaim,
    toggleAlive,
    toggleGhostVote,
    setNotes,
    nextDay,
    prevDay,
    reorderPlayers,
    hasBeenNominatedToday,
    hasNominatedToday,
    createNomination,
  } = usePlayerGame();

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
          onToggleAlive={toggleAlive}
          onToggleGhostVote={toggleGhostVote}
          onAddClaim={addClaim}
          onRemoveClaim={removeClaim}
          onSetNotes={setNotes}
          onNextDay={nextDay}
          onPrevDay={prevDay}
          onReorderPlayers={reorderPlayers}
          hasBeenNominatedToday={hasBeenNominatedToday}
          hasNominatedToday={hasNominatedToday}
          onCreateNomination={createNomination}
        />
      )}
    </Layout>
  );
}

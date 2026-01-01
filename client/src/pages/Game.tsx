import { Layout } from "@/components/ui/Layout";
import { useState, useMemo } from "react";
import { usePlayerGame, getBreakdown, type GamePlayer } from "@/hooks/use-player-game";
import { ALL_CHARACTERS } from "@/lib/game-data";
import { Users, ChevronRight, Play, Skull, X, Plus, Check, Hand, Search, Sun, Moon, ChevronUp, ChevronDown, FileText, Theater, Vote, Loader2, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

function NomineePicker({
  open,
  onClose,
  onSelect,
  players,
  currentPlayerId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (nomineeId: string, voted: boolean) => void;
  players: GamePlayer[];
  currentPlayerId: string;
}) {
  const [selectedNominee, setSelectedNominee] = useState<string | null>(null);

  const handleVote = (voted: boolean) => {
    if (selectedNominee) {
      onSelect(selectedNominee, voted);
      setSelectedNominee(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setSelectedNominee(null); onClose(); }}}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-amber-500">
            {selectedNominee ? "Record Vote" : "Select Nominee"}
          </DialogTitle>
        </DialogHeader>
        
        {!selectedNominee ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">Who was on the block?</p>
            {players.filter(p => p.id !== currentPlayerId).map(player => (
              <button
                key={player.id}
                onClick={() => setSelectedNominee(player.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  "hover-elevate active-elevate-2",
                  player.isAlive 
                    ? "bg-card border-border" 
                    : "bg-muted/30 border-muted text-muted-foreground"
                )}
                data-testid={`button-select-nominee-${player.id}`}
              >
                <span className="flex items-center gap-2">
                  {!player.isAlive && <Skull className="w-4 h-4" />}
                  {player.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Did this player vote on <span className="text-amber-400 font-medium">{players.find(p => p.id === selectedNominee)?.name}</span>?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-emerald-950/30 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40"
                onClick={() => handleVote(true)}
                data-testid="button-voted-yes"
              >
                <Hand className="w-6 h-6" />
                <span>Voted</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-red-950/30 border-red-800 text-red-400 hover:bg-red-900/40"
                onClick={() => handleVote(false)}
                data-testid="button-voted-no"
              >
                <X className="w-6 h-6" />
                <span>Did Not Vote</span>
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setSelectedNominee(null)}>
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlayerDetailDrawer({
  player,
  players,
  currentDay,
  onClose,
  onToggleAlive,
  onToggleGhostVote,
  onAddClaim,
  onRemoveClaim,
  onSetNotes,
  onAddVote,
}: {
  player: GamePlayer | null;
  players: GamePlayer[];
  currentDay: number;
  onClose: () => void;
  onToggleAlive: () => void;
  onToggleGhostVote: () => void;
  onAddClaim: (characterId: string) => void;
  onRemoveClaim: (characterId: string) => void;
  onSetNotes: (notes: string) => void;
  onAddVote: (nomineeId: string, voted: boolean) => void;
}) {
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [showNomineePicker, setShowNomineePicker] = useState(false);

  if (!player) return null;

  const claimedCharacters = player.claims.map(id => ALL_CHARACTERS.find(c => c.id === id)).filter(Boolean);
  const votesByDay = player.votes.reduce((acc, vote) => {
    if (!acc[vote.day]) acc[vote.day] = [];
    acc[vote.day].push(vote);
    return acc;
  }, {} as Record<number, typeof player.votes>);

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
                    <Vote className="w-4 h-4" /> Voting Record
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowNomineePicker(true)} data-testid="button-add-vote">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                {Object.keys(votesByDay).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(votesByDay).sort(([a], [b]) => Number(b) - Number(a)).map(([day, votes]) => (
                      <div key={day} className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground">Day {day}</p>
                        {votes.map((vote, i) => {
                          const nominee = players.find(p => p.id === vote.nomineeId);
                          return (
                            <div key={i} className="text-sm flex items-center gap-2 pl-2">
                              {vote.voted ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                              <span>
                                {vote.voted ? "Voted on" : "Did not vote on"}{" "}
                                <span className="text-amber-400">{nominee?.name || "Unknown"}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No votes recorded</p>
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

      <NomineePicker
        open={showNomineePicker}
        onClose={() => setShowNomineePicker(false)}
        onSelect={onAddVote}
        players={players}
        currentPlayerId={player.id}
      />
    </>
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
  onAddVote,
  onNextDay,
  onPrevDay,
}: {
  game: NonNullable<ReturnType<typeof usePlayerGame>["game"]>;
  onEndGame: () => void;
  onToggleAlive: (playerId: string) => void;
  onToggleGhostVote: (playerId: string) => void;
  onAddClaim: (playerId: string, characterId: string) => void;
  onRemoveClaim: (playerId: string, characterId: string) => void;
  onSetNotes: (playerId: string, notes: string) => void;
  onAddVote: (playerId: string, nomineeId: string, voted: boolean) => void;
  onNextDay: () => void;
  onPrevDay: () => void;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const selectedPlayer = game.players.find(p => p.id === selectedPlayerId) || null;
  const playerCount = game.players.length;
  const aliveCount = game.players.filter(p => p.isAlive).length;
  const votesNeeded = Math.ceil(aliveCount / 2);
  const totalVotesAvailable = game.players.filter(p => p.isAlive || (!p.isAlive && p.hasGhostVote)).length;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={onPrevDay} disabled={game.currentDay <= 1} data-testid="button-prev-day">
              <ChevronDown className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="font-display text-amber-500 text-xl">Day {game.currentDay}</span>
            </div>
            <Button size="icon" variant="ghost" onClick={onNextDay} data-testid="button-next-day">
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            {confirmEnd ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(false)} data-testid="button-cancel-end">Cancel</Button>
                <Button variant="destructive" size="sm" onClick={onEndGame} data-testid="button-confirm-end">End Game</Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(true)} data-testid="button-end-game">
                End Game
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Players:</span>
          <span className="font-semibold text-foreground">{playerCount}</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-muted-foreground">Alive:</span>
          <span className="font-semibold text-foreground">{aliveCount}</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-muted-foreground">Exec:</span>
          <span className="font-semibold text-amber-400">{votesNeeded}</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-muted-foreground">Poss:</span>
          <span className="font-semibold text-purple-400">{totalVotesAvailable}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {game.players.map((player) => {
          const claimedChars = player.claims.map(id => ALL_CHARACTERS.find(c => c.id === id)).filter(Boolean);
          const hasNotes = player.notes.trim().length > 0;
          const voteCount = player.votes.length;
          const nominatedCount = game.players.reduce((count, p) => 
            count + p.votes.filter(v => v.nomineeId === player.id).length, 0
          );

          return (
            <Card
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className={cn(
                "p-4 cursor-pointer transition-all hover-elevate",
                !player.isAlive && "opacity-60"
              )}
              data-testid={`card-player-${player.id}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {!player.isAlive && <Skull className="w-4 h-4 text-muted-foreground" />}
                  <span className={cn(
                    "font-bold text-lg",
                    player.isAlive ? "text-amber-100" : "text-muted-foreground line-through"
                  )}>
                    {player.name}
                  </span>
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
                  {nominatedCount > 0 && (
                    <span className="flex items-center gap-1" data-testid={`text-nominated-${player.id}`}>
                      <Theater className="w-3.5 h-3.5" />
                      {nominatedCount}
                    </span>
                  )}
                  {voteCount > 0 && (
                    <span className="flex items-center gap-1" data-testid={`text-votes-${player.id}`}>
                      <Hand className="w-3.5 h-3.5" />
                      {voteCount}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <PlayerDetailDrawer
        player={selectedPlayer}
        players={game.players}
        currentDay={game.currentDay}
        onClose={() => setSelectedPlayerId(null)}
        onToggleAlive={() => selectedPlayerId && onToggleAlive(selectedPlayerId)}
        onToggleGhostVote={() => selectedPlayerId && onToggleGhostVote(selectedPlayerId)}
        onAddClaim={(charId) => selectedPlayerId && onAddClaim(selectedPlayerId, charId)}
        onRemoveClaim={(charId) => selectedPlayerId && onRemoveClaim(selectedPlayerId, charId)}
        onSetNotes={(notes) => selectedPlayerId && onSetNotes(selectedPlayerId, notes)}
        onAddVote={(nomineeId, voted) => selectedPlayerId && onAddVote(selectedPlayerId, nomineeId, voted)}
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
    addVote,
    nextDay,
    prevDay,
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
          onAddVote={addVote}
          onNextDay={nextDay}
          onPrevDay={prevDay}
        />
      )}
    </Layout>
  );
}

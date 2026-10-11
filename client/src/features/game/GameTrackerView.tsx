import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { usePlayerGame, getBreakdown } from "@/features/game/state/use-player-game";
import { getCharacterById } from "@/lib/game-data";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { CaptureFriendsDialog } from "@/components/CaptureFriendsDialog";
import { useFriends } from "@/hooks/use-friends";
import { resolveScriptCharacters } from "@/lib/script-resolve";
import { ArrowLeft, ChevronRight, ChevronLeft, X, Plus, Check, Moon, Sun, ChevronDown, FileText, UserPlus, BookOpen, Pencil, MoreVertical, RotateCcw, Users, Skull, Theater, LayoutList, NotebookText, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CircleSeatingChart } from "@/features/game/views/CircleView";
import { type GameScriptRef, type PlayerStatus } from "@/features/game/types";
import { ListView } from "@/features/game/views/ListView";
import { GameScriptView } from "@/features/game/views/GameScriptView";
import { NotebookView } from "@/features/game/views/NotebookView";
import { AddTravelerDialog } from "@/features/game/dialogs/AddTravelerDialog";
import { AddPlayerDialog } from "@/features/game/dialogs/AddPlayerDialog";
import { CharacterPicker } from "@/features/game/dialogs/CharacterPicker";
import { ScriptCharacterDrawer } from "@/features/game/dialogs/ScriptCharacterDrawer";
import { PlayAgainDialog } from "@/features/game/dialogs/PlayAgainDialog";
import { PlayerDetailDrawer } from "@/features/game/PlayerDetailDrawer";

export function GameTrackerView({
  game,
  onEndGame,
  onPlayAgain,
  onToggleAlive,
  onSetPlayerStatus,
  onAddClaim,
  onAddMultipleClaims,
  onSetPrimaryClaim,
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
  onSetPrimaryClaim: (playerId: string, characterId: string) => void;
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
  const [primaryPickerPlayerId, setPrimaryPickerPlayerId] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showPlayAgainConfirm, setShowPlayAgainConfirm] = useState(false);
  const [showAddTravelerDialog, setShowAddTravelerDialog] = useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [scriptPopoverOpen, setScriptPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'circle' | 'log' | 'script'>('list');
  const [selectedSheetCharId, setSelectedSheetCharId] = useState<string | null>(null);
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
  const [playerFilter, setPlayerFilter] = useState<'all' | 'alive' | 'dead'>('all');
  const [claimPickerPlayerId, setClaimPickerPlayerId] = useState<string | null>(null);
  const [captureNames, setCaptureNames] = useState<string[] | null>(null);
  const { friends, addFriend } = useFriends();
  const { getScriptById, isLoading: scriptsLoading, allScripts, addCustomScript, updateCustomScript, customScripts } = useLocalScripts();

  // On Confirm End Game, offer to save typed player names that are not
  // already friends. Placeholder names ("Player N" / "Traveler N") and
  // existing friends never trigger the prompt.
  const handleConfirmEndGame = () => {
    const isPlaceholder = (n: string) => /^Player \d+$/.test(n) || /^Traveler \d+$/.test(n);
    const friendNames = new Set(friends.map(f => f.name.trim().toLowerCase()));
    const seen = new Set<string>();
    const newNames: string[] = [];
    for (const p of game.players) {
      const name = p.name.trim();
      if (!name || isPlaceholder(name)) continue;
      const key = name.toLowerCase();
      if (friendNames.has(key) || seen.has(key)) continue;
      seen.add(key);
      newNames.push(name);
    }
    if (newNames.length === 0) {
      onEndGame();
      return;
    }
    setCaptureNames(newNames);
  };

  const handleCaptureSave = (selectedNames: string[]) => {
    selectedNames.forEach(name => addFriend(name));
    setCaptureNames(null);
    onEndGame();
  };

  const handleCaptureSkip = () => {
    setCaptureNames(null);
    onEndGame();
  };
  
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

  const handleAdvancePhase = () => {
    onAdvancePhase();
  };

  const selectedPlayer = game.players.find(p => p.id === selectedPlayerId) || null;
  const regularPlayers = game.players.filter(p => !p.isTraveler);
  const travelers = game.players.filter(p => p.isTraveler);
  const alivePlayers = game.players.filter(p => p.status === 'alive');
  const aliveCount = alivePlayers.length;
  const deadCount = game.players.filter(p => p.status === 'dead').length;

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
      {/* Header: back, script name and seat summary, game menu, phase pill */}
      <header className="game-chrome -mx-4 -mt-4 border-b px-2 pt-2 pb-3" data-testid="header-game">
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--shell-inactive)] transition-colors hover:text-[var(--shell-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to home"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col items-center">
            <Popover open={scriptPopoverOpen} onOpenChange={setScriptPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 hover-elevate active-elevate-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  data-testid="button-change-script"
                >
                  <span className="truncate font-display text-xl leading-tight text-[var(--shell-gold)]">
                    {resolvedScript ? resolvedScript.name : "No Script"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[var(--shell-gold)] opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Select Script</div>
                  <button
                    className={cn(
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
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
                        className="flex-1 flex items-center gap-2 text-left hover-elevate rounded-md -m-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
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
                          className="p-1 rounded hover-elevate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingScript(script);
                            setShowScriptBuilder(true);
                            setScriptPopoverOpen(false);
                          }}
                          data-testid={`button-edit-active-script-${script.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover-elevate text-purple-400 border-t border-border mt-1 pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
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
            <span className="game-label mt-0.5 text-[var(--shell-inactive)]" data-testid="text-seat-summary">
              {game.players.length} seats · {aliveCount} alive
            </span>
          </div>

          {/* Game menu */}
          <DropdownMenu onOpenChange={(open) => { if (!open) setConfirmEnd(false); }}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-[var(--shell-inactive)] hover:text-[var(--shell-gold)]"
                data-testid="button-overflow-menu"
              >
                <MoreVertical className="w-5 h-5" />
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
                    onClick={handleConfirmEndGame} 
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
                  {prevChapter && (
                    <DropdownMenuItem
                      onClick={onRegressPhase}
                      data-testid="button-phase-prev"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to {phaseLabel(prevChapter.day, prevChapter.phase)}
                    </DropdownMenuItem>
                  )}
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

        {/* Phase pill: the current phase is the active segment, the next phase is a button */}
        <div
          className="mt-3 flex items-center gap-1 rounded-full border border-[var(--shell-border)] bg-black/40 p-1"
          data-testid="pill-phase"
        >
          <div
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--shell-gold)] px-3 py-1.5 text-[var(--shell-chrome)]"
            data-testid="text-phase-current"
          >
            {isNight ? <Moon className="h-4 w-4 shrink-0" /> : <Sun className="h-4 w-4 shrink-0" />}
            <span className="font-display text-base font-semibold">{currentPhaseLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleAdvancePhase}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[var(--shell-inactive)] transition-colors hover:text-[var(--shell-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="button-phase-next"
          >
            {nextChapter.phase === 'night' ? <Moon className="h-4 w-4 shrink-0" /> : <Sun className="h-4 w-4 shrink-0" />}
            <span className="game-label">{phaseLabel(nextChapter.day, nextChapter.phase)}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div className="game-panel" data-testid="panel-list">
          {/* Merged chip row: Alive/Dead filters + team composition dots */}
          {(() => {
            const roleBreakdown = getBreakdown(regularPlayers.length);
            return (
              <div className="flex items-center justify-center gap-x-3 gap-y-1 px-3 py-1.5 border-b border-border flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFilter('alive')}
                    className={cn(
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                      "flex items-baseline gap-1 px-2 py-0.5 rounded-md border transition-colors",
                      playerFilter === 'alive'
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : "border-transparent hover:bg-muted/40"
                    )}
                    data-testid="filter-alive"
                  >
                    <span className="text-base font-display font-semibold text-emerald-400 tabular-nums">{aliveCount}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Alive</span>
                  </button>
                  <span className="text-muted-foreground/50">/</span>
                  <button
                    onClick={() => toggleFilter('dead')}
                    className={cn(
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                      "flex items-baseline gap-1 px-2 py-0.5 rounded-md border transition-colors",
                      playerFilter === 'dead'
                        ? "bg-red-500/20 border-red-500/50"
                        : "border-transparent hover:bg-muted/40"
                    )}
                    data-testid="filter-dead"
                  >
                    <span className="text-base font-display font-semibold text-red-400/80 tabular-nums">{deadCount}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Dead</span>
                  </button>
                </div>
                <div className="w-px h-4 bg-border shrink-0" aria-hidden="true" />
                <div className="flex items-center gap-2.5 text-sm flex-wrap" data-testid="section-role-count">
                  <span className="flex items-center gap-1" data-testid="role-dot-townsfolk">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-blue-400 font-medium tabular-nums">{roleBreakdown.townsfolk}</span>
                  </span>
                  <span className="flex items-center gap-1" data-testid="role-dot-outsider">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <span className="text-green-400 font-medium tabular-nums">{roleBreakdown.outsiders}</span>
                  </span>
                  <span className="flex items-center gap-1" data-testid="role-dot-minion">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span className="text-red-400 font-medium tabular-nums">{roleBreakdown.minions}</span>
                  </span>
                  <span className="flex items-center gap-1" data-testid="role-dot-demon">
                    <span className="w-2 h-2 rounded-full bg-red-700 shrink-0" />
                    <span className="text-red-700 font-medium tabular-nums">{roleBreakdown.demons}</span>
                  </span>
                  {travelers.length > 0 && (
                    <span className="flex items-center gap-1" data-testid="role-dot-traveler">
                      <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                      <span className="text-purple-400 font-medium tabular-nums">{travelers.length}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
          <ListView
            game={game}
            filteredPlayers={filteredPlayers}
            onReorderPlayers={onReorderPlayers}
            onReversePlayers={onReversePlayers}
            onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
            onToggleAlive={onToggleAlive}
            onOpenClaimPicker={(playerId) => setClaimPickerPlayerId(playerId)}
            onRemoveClaim={onRemoveClaim}
          />
        </div>
      )}
      
      {activeTab === 'circle' && (
        <div className="game-panel" data-testid="panel-circle">
          <CircleSeatingChart
            players={game.players}
            currentDay={game.currentDay}
            deathRecords={game.deathRecords ?? []}
            onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
            onOpenPrimaryPicker={(playerId) => setPrimaryPickerPlayerId(playerId)}
            onReorderPlayers={onReorderPlayers}
            onSetCirclePosition={onSetCirclePosition}
            onSetMultipleCirclePositions={onSetMultipleCirclePositions}
            onResetCirclePositions={onResetCirclePositions}
          />
        </div>
      )}
      
      {activeTab === 'log' && (
        <div className="game-panel" data-testid="panel-notes">
          <NotebookView
            game={game}
            onSetGameNotes={onSetGameNotes}
            onAddNotebookNote={onAddNotebookNote}
            onRemoveNotebookNote={onRemoveNotebookNote}
          />
        </div>
      )}

      {activeTab === 'script' && (
        <GameScriptView
          scriptName={resolvedScript ? resolvedScript.name : null}
          characters={sheetCharacters}
          onCharacterSelect={(id) => setSelectedSheetCharId(id)}
        />
      )}

      {/* Bottom navigation: thumb-reachable view switcher */}
      <nav
        className="game-chrome sticky bottom-0 z-40 -mx-4 grid grid-cols-4 gap-1 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        data-testid="nav-tracker"
      >
        {([
          { tab: 'circle', label: 'Circle', icon: Users, testId: 'nav-grim' },
          { tab: 'list', label: 'List', icon: LayoutList, testId: 'nav-list' },
          { tab: 'script', label: 'Script', icon: ScrollText, testId: 'nav-script' },
          { tab: 'log', label: 'Notes', icon: NotebookText, testId: 'nav-notebook' },
        ] as const).map(({ tab, label, icon: Icon, testId }) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
              activeTab === tab
                ? "text-[var(--shell-gold)]"
                : "text-[var(--shell-inactive)] hover:text-[var(--parchment-panel)]"
            )}
            aria-current={activeTab === tab ? "page" : undefined}
            data-testid={testId}
          >
            <Icon className="w-5 h-5" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </nav>

      <ScriptCharacterDrawer
        character={selectedSheetChar}
        onClose={() => setSelectedSheetCharId(null)}
      />

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

      <CaptureFriendsDialog
        open={captureNames !== null}
        names={captureNames ?? []}
        onSave={handleCaptureSave}
        onSkip={handleCaptureSkip}
      />

      <PlayAgainDialog
        open={showPlayAgainConfirm}
        onOpenChange={setShowPlayAgainConfirm}
        onPlayAgain={onPlayAgain}
      />

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

      {primaryPickerPlayerId && (
        <CharacterPicker
          open={!!primaryPickerPlayerId}
          onClose={() => setPrimaryPickerPlayerId(null)}
          singleSelect
          primaryClaimId={game.players.find(p => p.id === primaryPickerPlayerId)?.claims?.[0]}
          onSelect={(characterIds) => {
            if (characterIds[0]) onSetPrimaryClaim(primaryPickerPlayerId, characterIds[0]);
            setPrimaryPickerPlayerId(null);
          }}
          onRemove={(characterId) => {
            onRemoveClaim(primaryPickerPlayerId, characterId);
            setPrimaryPickerPlayerId(null);
          }}
          scriptCharacterIds={scriptCharacterIds}
        />
      )}

    </div>
  );
}

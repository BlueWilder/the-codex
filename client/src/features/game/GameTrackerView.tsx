import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { usePlayerGame } from "@/features/game/state/use-player-game";
import { getCharacterById } from "@/lib/game-data";
import { useLocalScripts, type LocalScript } from "@/hooks/use-local-scripts";
import { ScriptBuilderDialog } from "@/components/ScriptBuilderDialog";
import { CaptureFriendsDialog } from "@/components/CaptureFriendsDialog";
import { useFriends } from "@/hooks/use-friends";
import { resolveScriptCharacters } from "@/lib/script-resolve";
import { ArrowLeft, X, Plus, Check, ChevronDown, FileText, UserPlus, BookOpen, Pencil, MoreVertical, RotateCcw, Users, Skull, Theater, LayoutList, NotebookText, ScrollText } from "lucide-react";
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
import { ScriptCharacterDrawer } from "@/features/game/dialogs/ScriptCharacterDrawer";
import { PlayAgainDialog } from "@/features/game/dialogs/PlayAgainDialog";
import { SeatSheet } from "@/features/game/SeatSheet";

export function GameTrackerView({
  game,
  onEndGame,
  onPlayAgain,
  onToggleAlive,
  onSetPlayerStatus,
  onAddClaim,
  onRemoveClaim,
  onSetNotes,
  onUpdatePlayerName,
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
  onRemoveClaim: (playerId: string, characterId: string) => void;
  onSetNotes: (playerId: string, notes: string) => void;
  onUpdatePlayerName: (playerId: string, name: string) => void;
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
  const [showScriptBuilder, setShowScriptBuilder] = useState(false);
  const [editingScript, setEditingScript] = useState<LocalScript | null>(null);
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

  const selectedPlayer = game.players.find(p => p.id === selectedPlayerId) || null;
  const alivePlayers = game.players.filter(p => p.status === 'alive');
  const aliveCount = alivePlayers.length;

  return (
    <div className="space-y-4">
      {/* Header: back, script name and seat summary, game menu */}
      <header className="game-chrome -mx-5 -mt-5 border-b px-2 py-2" data-testid="header-game">
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
      </header>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div className="game-panel" data-testid="panel-list">
          <ListView
            game={game}
            players={game.players}
            onReorderPlayers={onReorderPlayers}
            onReversePlayers={onReversePlayers}
            onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
            onToggleAlive={onToggleAlive}
          />
        </div>
      )}
      
      {activeTab === 'circle' && (
        <div className="game-panel px-0" data-testid="panel-circle">
          <CircleSeatingChart
            players={game.players}
            centerLabel={resolvedScript?.name}
            onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
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
        className="game-chrome sticky bottom-0 z-40 -mx-5 -mb-5 grid grid-cols-4 gap-1 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
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

      <SeatSheet
        player={selectedPlayer}
        players={game.players}
        scriptCharacterIds={scriptCharacterIds}
        onClose={() => setSelectedPlayerId(null)}
        onToggleAlive={() => selectedPlayerId && onToggleAlive(selectedPlayerId)}
        onSetPlayerStatus={(status) => selectedPlayerId && onSetPlayerStatus(selectedPlayerId, status)}
        onAddClaim={(charId) => selectedPlayerId && onAddClaim(selectedPlayerId, charId)}
        onRemoveClaim={(charId) => selectedPlayerId && onRemoveClaim(selectedPlayerId, charId)}
        onSetNotes={(notes) => selectedPlayerId && onSetNotes(selectedPlayerId, notes)}
        onSetPlayerName={(name) => selectedPlayerId && onUpdatePlayerName(selectedPlayerId, name)}
        onConvertToTraveler={!selectedPlayer?.isTraveler ? () => selectedPlayerId && onConvertToTraveler(selectedPlayerId) : undefined}
        // A traveler leaving is logged (removeTraveler); other seats are removed outright.
        onRemovePlayer={() => {
          if (!selectedPlayerId) return;
          if (selectedPlayer?.isTraveler) onRemoveTraveler(selectedPlayerId);
          else onRemovePlayer(selectedPlayerId);
        }}
        canRemovePlayer={!!selectedPlayer?.isTraveler || game.players.length > 1}
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
    </div>
  );
}
